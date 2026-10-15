# Architecture

## Scope

The app uses vanilla JavaScript modules and native HTML controls.
Vite bundles the modules and local JSON files.
Vitest checks pure logic and DOM behavior.
No framework manages application state.

Each milestone starts from `m1-toolchain`.
The independent milestone branches do not contain each other's features.
This document defines the shared integration contract.
The `m4-integration-polish` branch supplies responsive CSS and documentation.
Its entry function retains the milestone placeholder until integration.

## Module map

| Module | Responsibility | Fixed interface |
| --- | --- | --- |
| `src/data.js` | Load and normalize records. Search names, addresses, and descriptions. Filter amenities. | `loadParks()`, `normalizePark(raw)`, `searchParks(parks, query)`, `filterParks(parks, amenities)`, `collectUniqueAmenities(parks)`, `boundsOfParks(parks)` |
| `src/ui/list.js` | Create search controls, amenity checkboxes, and park selection buttons. | `createParkList({ parks, onSelect })` returns a panel element. |
| `src/ui/detail.js` | Define the `park-detail` custom element. Render one park in a native dialog. | `open(park)` opens details. `closePark()` closes details. |
| `src/map.js` | Own Leaflet, raster tiles, bounds, markers, and marker selection. | `createParkMap(el, parks)` returns `{ focus, setParks, selectMarker }`. Pure helpers are `computeBounds(parks)` and `markerLabel(park)`. |
| `src/styles.css` | Set base colors, controls, list items, and detail presentation in the catalog milestone. | Shared class names and semantic HTML. |
| `src/responsive.css` | Set panel widths, mobile visibility, fluid type, and dialog limits. | Linked by `index.html`. Reads `.app-shell`, `.view-switch`, `.park-list-panel`, `.map-panel`, and `park-detail dialog`. |
| `src/main.js` | Start the integrated shell. Connect selection and filter events. | Mount the catalog first, then the map, so the map fills the region the catalog reserves. |

`boundsOfParks(parks)` returns `{ south, west, north, east }` for valid park coordinates.
The map uses `computeBounds(parks)` to prepare its viewport bounds.
The normalized park shape appears in [the schema](data-schema.md).
Leaflet objects stay inside `map.js`.
Other modules exchange park objects, not Leaflet markers.

## Selection and filters

The catalog sends `park:select` and `parks:filter` document events.
The integration shell connects these events to the map.
The map also supports an optional third argument with an `onSelect` callback.
The two-argument map interface remains valid.

1. A list button selects its park and opens the detail dialog.
2. The shell sends that park to `map.selectMarker(park)` and `map.focus(park)`.
3. A marker activation sends its park through the map selection callback.
4. The shell applies the same selection to the list and opens the same dialog.
5. A filter change sends the same visible park set to the list and `map.setParks(parks)`.

The park identifier connects the two views.
Selection does not create a second park record.
Programmatic marker selection must not emit another selection event.
This rule prevents an event loop between the list and map.
`focus(park)` changes the viewport, not the selected data.
The initial viewport includes all valid park locations.
The app does not request geolocation.

## Responsive shell

Below 800 pixels, the shell shows one panel.
Two labelled buttons form the `.view-switch` group.
Native buttons support Tab, Enter, and Space.
The shell sets `data-view` to `list` or `map`.
It sets `aria-pressed` on both buttons to match that choice.
CSS hides the inactive panel and its controls.
The map must refresh its size when its hidden panel becomes visible.

From 800 through 1200 pixels, the list uses 320 pixels.
Above 1200 pixels, the list uses 380 pixels.
The map uses the remaining width.
The switch disappears when both panels are visible.
The dialog scrolls internally and uses the dynamic viewport height.
Its desktop width does not exceed 720 pixels.

## Why Leaflet and Carto raster

This app needs a basemap and a small set of selectable points.
Leaflet supplies these features without a vector rendering engine.
This choice reduces the renderer payload compared with a full MapLibre GL setup.
No measured cross-library payload comparison is available for this app.
Tile images still add network traffic.
Raster tiles are not automatically smaller than vector tiles.

Carto's public raster basemap works without a browser API key for this design.
The map retains Carto and OpenStreetMap attribution.
The tile service still has usage conditions and network dependencies.
A missing tile must not prevent list search or park selection.

Leaflet markers use DOM elements.
The map can give each marker a park-specific accessible name and keyboard behavior.
Canvas-rendered vector features need separate accessible controls.
MapLibre also supports DOM markers, so accessibility alone does not exclude it.
MapLibre offers vector styling and rotation that this app does not need.
Leaflet avoids that extra renderer for this scope.

See [Leaflet's accessibility guide](https://leafletjs.com/examples/accessibility/) for marker labels and keyboard defaults.
