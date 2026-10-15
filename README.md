# Local Park Map

Find parks through a searchable list and a Leaflet map.
Filter parks by amenities.
Select a park to read its details in a native dialog.
The app does not request your location.
Phone users can choose the list or the map.
Larger screens show both panels.

## Run

Use a Node.js version that supports Vite 7.

```sh
npm install
npm run dev
npm run build
npm test
npm run lint
```

The development command prints the local URL.
The build command writes production files to `dist/`.
The test command runs Vitest.
The lint command permits no warnings.

## Milestone branches

| Branch | Scope |
| --- | --- |
| `m1-toolchain` | Vite, Vitest, ESLint, and the HTML shell. |
| `m2-data-catalog` | Added parks, normalized data, search, filters, list, and detail dialog. |
| `m3-map` | Raster basemap, park markers, viewport bounds, and map selection. |
| `m4-integration-polish` | Responsive styles, documentation, and integration contracts. |

Each feature branch starts from `m1-toolchain`.
Each branch builds independently.
The integrated app combines the catalog, map, and responsive shell.
This branch alone retains the entry placeholder until integration.

## Documentation

- [Park schema and missing values](docs/data-schema.md)
- [Modules and selection flow](docs/architecture.md)
- [Accessibility targets and manual checks](docs/accessibility.md)
- [Interface research and sources](docs/ui-ux-research.md)
- [Verification report: what was tested and what was not](docs/verification.md)

## Deviation

The two ESLint config packages are not published on npm.
The repository vendors their local package archives under `vendor/`.
The package manifest installs these archives through `file:` dependencies.
The app still uses the required JavaScript and JSDoc rules.

The supplied park file contains demonstration data.
Do not treat it as a verified park directory.
