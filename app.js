// Strabo's Epiphany — client

const WINDOW_YEARS = 100;

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
        attribution: 'Tiles &copy; Esri &mdash; Sources: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), MapmyIndia, Tomtom',
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

function render(year) {
  const yearEl = document.getElementById('year-display');
  yearEl.textContent = formatYear(year);

  markers.forEach(m => m.remove());
  markers = [];

  const visible = EVENTS.filter(e => Math.abs(e.year - year) <= WINDOW_YEARS);
  for (const e of visible) {
    const el = document.createElement('div');
    el.style.cssText = `
      width: 14px; height: 14px; border-radius: 50%;
      background: #d4a574; border: 2px solid #1a1511;
      cursor: pointer; box-shadow: 0 0 8px rgba(212, 165, 116, 0.6);
    `;
    const popup = new maplibregl.Popup({ offset: 14 }).setHTML(`
      <div class="popup-title">${e.title}</div>
      <div class="popup-date">${formatYear(e.year)} &middot; ${e.region || ''}</div>
      <div class="popup-body">${e.description}</div>
    `);
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([e.lng, e.lat])
      .setPopup(popup)
      .addTo(map);
    markers.push(marker);
  }
}

async function boot() {
  const r = await fetch('/api/events');
  EVENTS = await r.json();

  const slider = document.getElementById('year-slider');
  slider.addEventListener('input', () => render(parseInt(slider.value, 10)));
  render(parseInt(slider.value, 10));
}

map.on('load', boot);
