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
}

function buildLegend() {
  const legend = document.getElementById('legend');
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

async function boot() {
  const r = await fetch('/api/events');
  EVENTS = await r.json();
  EVENTS.sort((a, b) => a.year - b.year);

  buildLegend();

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
