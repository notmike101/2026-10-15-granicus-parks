# Verification report

Date: 15 October 2026.

This report separates three things: automated tests, browser checks, and
checks that were not performed. Do not read any line here as a claim of
full WCAG conformance.

## Commands

```sh
npm run lint    # eslint . --max-warnings 0
npm test        # vitest run
npm run build   # vite build
npm run preview # serves dist/ for the browser checks
```

Result on the merged state (m2 + m3 + m4): lint exits 0 with no warnings,
48 Vitest tests pass, and the build succeeds. The production bundle is
51 kB gzipped of JavaScript, which is mostly Leaflet.

## Automated tests

| Area | Tests | Result |
| --- | --- | --- |
| Data: normalization of missing fields, search, amenity filter, bounds, one record per id | 28 | Pass |
| List panel in jsdom: search, filter, item names, empty state | 4 | Pass |
| Detail dialog in jsdom: rendered sections, omitted sections, image fallback, close and focus return | 6 | Pass |
| Map helpers in node: bounds box, marker label | 4 | Pass |
| Map module in jsdom: mount, one labelled marker per park, filtered subset | 6 | Pass |

jsdom cannot run a native modal focus trap or a physical Escape keypress.
Those two items are covered by the browser checks below.

## Browser checks on the production build

Chromium, headless, `vite preview` on `http://localhost:4183/`.

| Check | Result |
| --- | --- |
| Page loads with 21 parks in the list and 21 markers | Pass |
| Initial map viewport contains every marker (no panning needed) | Pass at 1280x900 |
| Basemap tiles load from CARTO (80 tiles at desktop size) | Pass |
| Attribution text present: "© OpenStreetMap contributors © CARTO" | Pass |
| Marker accessible names, for example "Prospect Park, Brooklyn, NY 11225" | Pass |
| List button opens a modal `<dialog>` with name, address, description, hours, acreage, rating, amenities | Pass |
| Missing hours and rating render no element at all | Pass |
| Park with no images shows one placeholder image with alt "Image unavailable" | Pass |
| Dead image URL falls back to the same placeholder | Pass |
| Escape closes the dialog and focus returns to the list button | Pass |
| Tab never reaches the list, the map, or the panel switch while the dialog is open | Pass |
| Amenity filter keeps list and map in step (6 results, 6 unique markers) | Pass |
| Search box narrows both panels and updates the live count | Pass |
| Keyboard: focus a marker, press Enter, dialog opens | Pass |
| Text contrast in the list and dialog (measured 12.5:1 to 14.7:1, body text) | Pass |
| Tablet 900x700: list and map side by side, switch hidden, no horizontal overflow | Pass |
| Phone 390x844: switch visible with correct `aria-pressed`, one panel at a time | Pass |
| Phone map panel: all 21 markers inside the viewport after the switch | Pass after fix |
| Phone dialog: 358 px wide inside a 390 px viewport, no horizontal overflow | Pass |
| `navigator.permissions.query({ name: 'geolocation' })` stays "prompt" through a full session | Pass |
| No horizontal scrollbar at 1280, 900, and 390 px | Pass |

Two defects were found in the browser and fixed:

1. Duplicate park records made the map keep stale markers after a filter.
   Fixed in m2 by merging records that share a park id.
2. On a phone the map fitted a hidden, zero-sized container, so every
   marker landed off screen. Fixed in m3 by refitting when the container
   gains size.

## Not performed

These limits are honest gaps, not passes.

- Screen reader speech was not observed. Names, roles, and live regions
  were verified in the DOM only.
- No real assistive technology, no physical keyboard, and no Windows
  Narrator, NVDA, VoiceOver, or TalkBack run.
- Only Chromium was tested. No Safari, Firefox, or Android WebView.
- Viewports tested: 1280x900, 900x700, 390x844. Other sizes were not.
- Zoom and reflow at 200 percent text size (WCAG 1.4.4 and 1.4.10) were
  not measured.
- Reduced-motion behaviour was not exercised, only declared in CSS.
- Colour contrast was measured for list and dialog text. It was not
  measured for every control state, focus ring, or map label.
- Touch target size (WCAG 2.5.5) was not measured for map markers.
- Full keyboard map navigation with Leaflet's arrow-key panning was not
  exercised beyond marker focus and Enter.
- Tile availability from CARTO and OpenStreetMap was checked once. The
  app has no offline tile fallback.
