# Strabo's Epiphany — Vision

## North star

A living atlas of world history that you scrub through time. Not a list of dated points on a map, but the moving picture of humanity: where people were, where they went, what they believed, who ruled them, what they knew of the world, and what they built. You pick a year and the whole map reflects that moment. You drag the timeline and you watch history happen.

## What you should be able to see

Everything below is a function of the selected year. Each is its own layer you can turn on or off, and all of them move together as you scrub time.

### 1. Peoples and their migrations
Where distinct peoples lived at a given time, and the movements that carried them across the map. The Bantu expansion, the Indo-European spread, the Sea Peoples, the Mongol movements, the Atlantic slave trade, the great modern migrations. Shown as regions that shift and as flows that animate across the period they occurred.

### 2. Religions and their spread
The diffusion of belief over time. The early spread of Buddhism along trade routes, Christianity moving through the Roman world, the rapid expansion of Islam, the Reformation. Shown as regions of adoption that grow and change, with the spread fronts visible as you move forward in time.

### 3. Territories and wars
The political map as it actually changed. Borders of empires, kingdoms, and states at any given year, and the wars that redrew them. You should be able to sit on 117 AD and see Rome at its greatest extent, then move forward and watch it fragment. Wars appear as events tied to the territorial changes they caused.

### 4. Great persons and great works
The people and achievements that defined an age, placed where and when they happened. Thinkers, rulers, artists, scientists, and the works they left: the Parthenon, the Great Library, Gutenberg's press, major texts and discoveries. This is the layer the app has today, and it grows into the richest one.

### 5. Knowledge horizons, or what people knew
For each civilization, the extent of the world it actually knew about at the time. China had no real knowledge of the rest of the world until a certain age. Rome's known world ended well short of the globe. This layer shows the edge of the known world from each civilization's point of view, and how that horizon expanded through exploration and contact. It is the layer that makes the map honest about perspective rather than drawing everything from a modern god's-eye view.

### 6. Forms of government
How people were governed at the time: monarchy, dynasty, republic, empire, theocracy, dictatorship, and so on. Attached to each polity so you can see, at a glance, not just who controlled a territory but how that society was organized, and how those forms rose and fell across regions and eras.

## How time works

The timeline is the spine of the whole product. Every layer is driven by the year or range you select. A point event shows when its year falls in range. A territory shows the borders valid at that moment. A migration or a religious spread animates across the window you are viewing. Scrubbing the timeline is the core interaction, and everything else serves it.

## Where the data model needs to go

Today each event is a single point: `{year, title, region, lat, lng, description}`, all held in one flat `data/events.json`. That is the right foundation for the "great persons and great works" layer, but the fuller vision needs entities that have duration and shape, not just a single year and a single point. The direction is to keep point events as they are and add sibling, time-indexed datasets:

- **Polities and territories.** Border geometry with a valid-from and valid-to year, plus attributes like name, people, and form of government. This powers both the territories layer and the forms-of-government layer.
- **Migrations.** Paths or flows with a date range, the people involved, and a rough magnitude, so they can animate.
- **Religions.** Regions of adoption with dates, so the spread can be drawn as it grew.
- **Knowledge horizons.** For each major civilization, the extent of its known world over time.
- **Persons and works.** Enriched point events with a category, an associated person, and a source link.

Each dataset stays simple and human-readable, indexed by time, so the map can ask one question of all of them at once: what did the world look like in this year.

## Phased roadmap

- **Phase 0 (today).** Point events on a scrubbable map.
- **Phase 1.** Enrich and grow the point events. Add a category (war, science, culture, religion, politics) and a source link to each, add great persons and works, and expand from seventeen events to a broad, well-distributed base across eras and regions.
- **Phase 2.** Time-varying territories and forms of government. Borders that change as you scrub, with each polity carrying its government type.
- **Phase 3.** Religions and migrations as animated, time-aware layers.
- **Phase 4.** Knowledge horizons. The known world from each civilization's point of view.
- **Phase 5.** Polish. Layer toggles, filtering by category, and a narrative mode that walks you through a theme across time.

## Open questions

- Border granularity. Snapshots at fixed intervals, for example every fifty or hundred years, or continuous interpolation between known states.
- Sourcing. How much is generated and verified here versus pulled from existing historical GIS datasets, and what the accuracy bar is for an educational tool.
- Attribution. Whether each event and territory carries a citation the user can follow.
