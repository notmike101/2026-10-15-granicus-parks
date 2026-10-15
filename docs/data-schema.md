# Park data schema

## Files and normalization

`assets/parks.sample.json` contains the supplied records.
`assets/parks.additional.json` contains the added records.
`loadParks()` combines both files through `normalizePark(raw)`.
The loader marks each record with its file source.

Each file contains a JSON array of park objects.
The table describes the normalized object.
Required fields identify a usable park and place its marker.
The normalizer tolerates missing required values, but it does not invent names or coordinates.
Keep those fields complete when you add data.

Blank strings become `null`.
The normalizer trims text.
Missing arrays become empty arrays.
The normalizer removes blank entries and entries with the wrong type from text arrays.
Numbers must be finite JavaScript numbers.
Numeric strings do not become numbers.
Missing text never produces an `N/A` label.

## Fields

| Field | Normalized type | Required in input | UI behavior when missing |
| --- | --- | --- | --- |
| `id` | `string` or `null` | Yes | The UI shows no identifier. Selection needs a unique identifier. |
| `name` | `string` or `null` | Yes | The UI omits the name text. No substitute name appears. |
| `description` | `string` or `null` | No | The detail dialog omits the description section. Search ignores it. |
| `location` | `object` | Yes | Normalization supplies the object with null members. No address or valid marker appears. |
| `location.lat` | `number` or `null` | Yes | The map omits the marker without a valid latitude. No coordinate text appears. |
| `location.lng` | `number` or `null` | Yes | The map omits the marker without a valid longitude. No coordinate text appears. |
| `location.address` | `string` or `null` | No | The list and dialog omit the address. Search ignores it. |
| `amenities` | `string[]` | No | An empty array produces no amenity items or detail section. It adds no filter choices. |
| `hours` | `string` or `null` | No | The detail dialog omits the hours section. |
| `images` | `string[]` | No | The detail dialog shows the bundled missing-image placeholder for an empty array. |
| `acreage` | `number` or `null` | No | The detail dialog omits the acreage label and value. Zero remains a value. |
| `rating` | `number` or `null` | No | The detail dialog omits the rating label and value. Zero remains a value. |
| `links` | `{label, url}[]` | No | An empty array omits the links section. No empty anchor appears. |
| `neighborhood` | `string` or `null` | No | The detail dialog omits the neighborhood text. |
| `source` | `'sample'` or `'augmented'` | No | Normalization defaults to `sample`. The UI does not display this field. |

Latitude uses decimal degrees from -90 through 90.
Longitude uses decimal degrees from -180 through 180.
The map needs both coordinates within these ranges.
Coordinates identify a display point, not a park boundary or an entrance.

The dialog gives each park image a name-based alternative text with its photo number.
A failed image request also uses the bundled placeholder.
The placeholder uses the alternative text `Image unavailable`.
No remote image is necessary to read the park details.

## Extended fields

`links` is a list of labelled web links. Normalization accepts two input
shapes. The supplied sample file uses an array of label and URL objects, for
example a Wikipedia article. The added records use `website` and `map`
members, which normalization labels `Park website` and `Map and directions`.
Normalization keeps only HTTP and HTTPS URLs, drops a repeated URL, and names
an unlabelled link `More information`. A park that repeats in both files keeps
the links of both records.

`neighborhood` adds local context without changing the address.
This field supports a readable detail view when a street address lacks context.

`source` records data provenance, which means the origin of a record.
`sample` identifies the supplied file.
`augmented` identifies the added file.
This field does not certify accuracy.
The supplied sample contains demonstration data and example image hosts.
Do not treat it as a verified park directory.

All three extensions are optional in source records.
They preserve the supplied field names.
They do not require a service or an API key.
