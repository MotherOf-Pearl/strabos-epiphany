// Strabo's Epiphany — client

// Category -> colour. Also defines the legend order.
const CATEGORIES = {
  politics:    { label: 'Politics',    color: '#d4a574' },
  war:         { label: 'War',         color: '#c0392b' },
  religion:    { label: 'Religion',    color: '#9b59b6' },
  science:     { label: 'Science',     color: '#3498db' },
  culture:     { label: 'Culture',     color: '#27ae60' },
  exploration: { label: 'Exploration', color: '#16a085' },
  economy:     { label: 'Economy',     color: '#e67e22' },
  disaster:    { label: 'Disaster',    color: '#95a5a6' },
};
const DEFAULT_COLOR = '#d4a574';

let WINDOW_YEARS = 100;
const activeCategories = new Set(Object.keys(CATEGORIES));
const activeReligions  = new Set();  // populated after load
const activeEmpires    = new Set();

let RELIGIONS = { type: 'FeatureCollection', features: [] };
let EMPIRES   = { type: 'FeatureCollection', features: [] };

const map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {
      base: {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: 'Tiles &copy; Esri',
      },
    },
    layers: [{ id: 'base', type: 'raster', source: 'base' }],
  },
  center: [20, 30],
  zoom: 2,
});

let EVENTS = [];
let markers = [];

function formatYear(y) {
  if (y < 0) return `${Math.abs(y)} BCE`;
  return `${y} CE`;
}

function colorFor(cat) {
  return (CATEGORIES[cat] && CATEGORIES[cat].color) || DEFAULT_COLOR;
}

// Build the MapLibre filter for a layer given active names and current year.
function layerFilter(activeSet, year) {
  if (activeSet.size === 0) return ['==', 1, 0]; // always false
  return [
    'all',
    ['<=', ['get', 'start_year'], year],
    ['>=', ['get', 'end_year'], year],
    ['in', ['get', 'name'], ['literal', [...activeSet]]],
  ];
}

function applyLayerFilters(year) {
  if (map.getLayer('religions-fill')) {
    map.setFilter('religions-fill', layerFilter(activeReligions, year));
    map.setFilter('religions-outline', layerFilter(activeReligions, year));
  }
  if (map.getLayer('empires-fill')) {
    map.setFilter('empires-fill', layerFilter(activeEmpires, year));
    map.setFilter('empires-outline', layerFilter(activeEmpires, year));
  }
}

function render(year) {
  document.getElementById('year-display').textContent = formatYear(year);
  document.getElementById('window-display').textContent =
    `showing events within ±${WINDOW_YEARS} years`;

  markers.forEach(m => m.remove());
  markers = [];

  const visible = EVENTS.filter(e =>
    Math.abs(e.year - year) <= WINDOW_YEARS &&
    activeCategories.has(e.category || 'politics')
  );

  for (const e of visible) {
    const color = colorFor(e.category);
    const el = document.createElement('div');
    el.style.cssText = `
      width: 13px; height: 13px; border-radius: 50%;
      background: ${color}; border: 2px solid #1a1511;
      cursor: pointer; box-shadow: 0 0 8px ${color}99;
    `;
    const cat = CATEGORIES[e.category];
    const srcLink = e.source
      ? `<a class="popup-src" href="${e.source}" target="_blank" rel="noopener">source</a>` : '';
    const catBadge = cat
      ? `<span class="popup-cat" style="background:${cat.color}">${cat.label}</span>` : '';
    const popup = new maplibregl.Popup({ offset: 14 }).setHTML(`
      <div class="popup-title">${e.title}</div>
      <div class="popup-date">${formatYear(e.year)} &middot; ${e.region || ''} ${catBadge}</div>
      <div class="popup-body">${e.description} ${srcLink}</div>
    `);
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([e.lng, e.lat])
      .setPopup(popup)
      .addTo(map);
    markers.push(marker);
  }

  document.getElementById('count-display').textContent =
    `${visible.length} event${visible.length === 1 ? '' : 's'}`;

  applyLayerFilters(year);
}

function buildEventsLegend() {
  const legend = document.getElementById('legend-events');
  for (const [key, { label, color }] of Object.entries(CATEGORIES)) {
    const row = document.createElement('div');
    row.className = 'legend-row active';
    row.innerHTML = `<span class="legend-dot" style="background:${color}"></span>${label}`;
    row.addEventListener('click', () => {
      if (activeCategories.has(key)) { activeCategories.delete(key); row.classList.remove('active'); }
      else { activeCategories.add(key); row.classList.add('active'); }
      render(parseInt(document.getElementById('year-slider').value, 10));
    });
    legend.appendChild(row);
  }
}

// Build a legend section for a polygon layer. Groups features by `name` so
// each religion/empire appears as a single row even if it has many polygons.
function buildLayerLegend(containerId, geojson, activeSet) {
  const container = document.getElementById(containerId);
  const seen = new Map();  // name -> color
  for (const f of geojson.features) {
    if (!seen.has(f.properties.name)) seen.set(f.properties.name, f.properties.color);
  }
  for (const [name, color] of seen) {
    activeSet.add(name);
    const row = document.createElement('div');
    row.className = 'legend-row active';
    row.innerHTML = `<span class="legend-swatch" style="background:${color}"></span>${name}`;
    row.addEventListener('click', () => {
      if (activeSet.has(name)) { activeSet.delete(name); row.classList.remove('active'); }
      else { activeSet.add(name); row.classList.add('active'); }
      applyLayerFilters(parseInt(document.getElementById('year-slider').value, 10));
    });
    container.appendChild(row);
  }
}

function addPolygonLayer(id, geojson) {
  map.addSource(id, { type: 'geojson', data: geojson });
  map.addLayer({
    id: `${id}-fill`,
    type: 'fill',
    source: id,
    paint: {
      'fill-color': ['get', 'color'],
      'fill-opacity': 0.28,
    },
  });
  map.addLayer({
    id: `${id}-outline`,
    type: 'line',
    source: id,
    paint: {
      'line-color': ['get', 'color'],
      'line-opacity': 0.55,
      'line-width': 1.2,
    },
  });
}

async function boot() {
  const [eventsR, religionsR, empiresR] = await Promise.all([
    fetch('/api/events').then(r => r.json()),
    fetch('/api/religions').then(r => r.json()),
    fetch('/api/empires').then(r => r.json()),
  ]);
  EVENTS = eventsR;
  RELIGIONS = religionsR;
  EMPIRES = empiresR;
  EVENTS.sort((a, b) => a.year - b.year);

  addPolygonLayer('religions', RELIGIONS);
  addPolygonLayer('empires', EMPIRES);

  buildEventsLegend();
  buildLayerLegend('legend-religions', RELIGIONS, activeReligions);
  buildLayerLegend('legend-empires', EMPIRES, activeEmpires);

  const slider = document.getElementById('year-slider');
  slider.addEventListener('input', () => render(parseInt(slider.value, 10)));

  const winSel = document.getElementById('window-select');
  winSel.addEventListener('change', () => {
    WINDOW_YEARS = parseInt(winSel.value, 10);
    render(parseInt(slider.value, 10));
  });

  render(parseInt(slider.value, 10));
}

map.on('load', boot);
