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

## Milestones

| Pull request | Scope |
| --- | --- |
| #1 | Vite, Vitest, ESLint, and the HTML shell. |
| #5 | Park data normalization, search, amenity filters, list, and detail dialog. |
| #6 | Raster basemap, park markers, viewport bounds, and map selection. |
| #7 | Responsive styles, documentation, and integration contracts. |
| #8 | Map refit when a hidden panel becomes visible. |
| #9 | Panel switch for screens narrower than 800 pixels. |
| #10 | Map panel height locked to the viewport. |
| #11 | Map refit after any container resize. |
| #12 | Links from both data shapes reach the dialog. |

`main` holds the integrated application.
Each change arrived through a reviewed pull request from a branch off `main`.

## Documentation

- [Park schema and missing values](docs/data-schema.md)
- [Modules and selection flow](docs/architecture.md)
- [Accessibility targets and manual checks](docs/accessibility.md)
- [Interface research and sources](docs/ui-ux-research.md)
- [Verification report: what was tested and what was not](docs/verification.md)
- [Session transcripts and how to read them](docs/transcripts.md)

## Deviation

The two ESLint config packages are not published on npm.
The repository vendors their local package archives under `vendor/`.
The package manifest installs these archives through `file:` dependencies.
The app still uses the required JavaScript and JSDoc rules.

The supplied park file contains demonstration data.
Do not treat it as a verified park directory.
