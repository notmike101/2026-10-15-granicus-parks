# Parks Map — Specification and Milestone Plan

Approved decisions (user, 2026-10-15):

1. Map SDK: Leaflet with Carto raster basemap tiles (no API key).
2. Data: supplied `assets/parks.sample.json` plus 5–8 augmented entries; schema may be extended.
3. Shell: master–detail (park list + map) with park details in a native `<dialog>` overlay.
4. Stack: Vite, Vitest, `@notmike101/eslint-config-js` + `eslint-config-jsdoc` (local packs from `notmike101/eslint-configs`), vanilla JavaScript, standardized web components. No framework.

## Milestones (one feature branch + one PR each)

| Branch | Scope |
|---|---|
| `m1-toolchain` | package.json, Vite/Vitest/ESLint config, index.html shell, `--max-warnings 0` lint |
| `m2-data-catalog` | data augmentation, `data.js` loader/normalizer, search/filter logic + unit tests, list + `<dialog>` UI + tests |
| `m3-map` | Leaflet map, `fitBounds` viewport over parks, markers ↔ list sync, map a11y + tests |
| `m4-integration-polish` | responsive layout (mobile/tablet/desktop), focus management, README + `docs/` (ASD-STE100), browser verification report |

## Behavior contract

- Initial map viewport fits all park locations (`fitBounds` with padding). No geolocation anywhere.
- Selecting a park (list button or map marker) opens the detail dialog: name, address, description, hours, acreage, rating, amenities, images, links.
- Missing data: images fall back to a bundled placeholder; absent text values render nothing (no "N/A" text).
- Users can find and filter parks without the map: search box (name/address/description) + amenity filter checkboxes.
- Keyboard: every control reachable by Tab; visible focus rings; dialog traps focus, Esc closes, focus returns to the opener; Enter selects list items.
- Responsive: ≥ 800px shows list + map side by side; < 800px shows one panel at a time with a visible toggle. Dialog fills small screens without horizontal scroll.
- WCAG 2.1 AA targets: labeled controls, contrast ≥ 4.5:1 body text, non-text ≥ 3:1, no color-only signaling, alt text on informative images.

## Extended schema (additive, all optional)

`links: { website?: string, map?: string }`, `neighborhood: string`, `source: "sample" | "augmented"`.

## Module interfaces (fixed for parallel work)

- `src/data.js`: `normalizePark(raw)`; `searchParks(parks, query)`; `filterParks(parks, amenities)`; `amenityUniverse(parks)`; `boundsOfParks(parks)`.
- `src/ui/list.js`: `createParkList({ parks, onSelect })` → panel element.
- `src/ui/detail.js`: `<park-detail>` dialog element; `open(park)`, closes on Esc/backdrop, restores focus.
- `src/map.js`: `createParkMap(el, parks)` → `{ focus(park) }`; Leaflet confined here.

## Verification

Vitest units (pure logic), DOM tests under jsdom, browser check of built app (Playwright/CDP): list select, marker select, Tab order, focus visibility, mobile viewport, missing-image fallback. Report records pass/fail/not-performed per item.
