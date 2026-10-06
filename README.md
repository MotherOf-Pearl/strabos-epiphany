# Strabo's Epiphany

Interactive world history map. Click a place, scrub the timeline, learn.

## Stack

- **Frontend:** MapLibre GL JS, vanilla HTML/CSS, OSM raster tiles.
- **Backend:** single-file Node HTTP server (`server.js`). Serves statics + `/api/events`.
- **Data:** `data/events.json` — flat array of `{year, title, region, lat, lng, description}`.

## Run locally

```
node server.js
# visit http://localhost:3000
```

## Deploy

Same pattern as `boohaw-tcg`:

1. Push to `main`.
2. Home unraid at `192.168.1.3` pulls within 60s via cron (`auto-deploy.sh`).
3. Docker container restarts only on actual change.

Public URL: `atlas.bormanfamily.com`.

## Adding events

Append entries to `data/events.json`. Shape:

```json
{ "year": -336, "title": "Alexander ascends the Macedonian throne", "region": "Macedon", "lat": 40.95, "lng": 22.52, "description": "At twenty...", "category": "politics", "source": "https://..." }
```

`category` is one of: `politics`, `war`, `religion`, `science`, `culture`, `exploration`, `economy`, `disaster` (drives marker colour + the legend filter). `source` is optional (shows a link in the popup). Negative years are BCE. One-year resolution. The timeline window is adjustable (±50 to ±500 years) via the control next to the slider.

See [`VISION.md`](VISION.md) for where this is headed.
