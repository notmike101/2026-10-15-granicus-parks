# Park finder interface research

## Method and limits

Review date: 15 October 2026.
This scan used public pages and public product documentation.
The sources below returned readable content during this review.
The review did not operate the live interfaces in a browser.
It does not establish current keyboard behavior or accessibility compliance.

The AllTrails trail page and iNaturalist observation explorer returned HTTP 403.
Their public help pages supplied the interface evidence instead.
The OpenStreetMap homepage returned its loading shell.
Its browsing guide supplied the interaction evidence.
Older reports describe historical behavior, not a current browser observation.

## NYC Parks

Sources: [Find A Park](https://www.nycgovparks.org/parks) and [Prospect Park](https://www.nycgovparks.org/parks/prospect-park).

**List and map pattern:** The finder starts with park-name and facility or location search.
It also offers borough lists.
The park page combines location information, facilities, links, photos, and a map disclaimer.
The readable finder page does not establish a synchronized list beside a map.

**Detail surface:** A separate park page carries the full details.
The evidence does not show a modal or a map popover as the main detail surface.

**Takeaway:** Keep facility filters visible and useful without map interaction.
Separate official park links from map directions.
Do not imply that a marker defines a legal park boundary.

## Google Maps place panel

Source: [Search locations on Google Maps](https://support.google.com/maps/answer/3092445?hl=en).

**List and map pattern:** Search results appear as pins and in a results list.
The desktop help describes a collapsible side panel beside the map.
Selecting a result or pin provides more place information.

**Detail surface:** The desktop place panel is a side panel.
It presents the address, hours, website, and ratings or reviews.
The help page supports this pattern but does not verify the current visual arrangement of each field.

**Takeaway:** Use one park selection across both views.
Keep the map context when users read a park's details.
Do not copy account features or personalized search into this small catalog.

## AllTrails

Sources: [List view](https://support.alltrails.com/hc/en-us/articles/360041612232-How-to-use-list-view-to-explore-trails) and [Map view](https://support.alltrails.com/hc/en-us/articles/360034969432-How-to-use-map-view-to-search-for-trails).

**List and map pattern:** The documented mobile app switches between a scrollable trail list and a map.
A list icon returns users from the map to the list.
A location search also produces a list.

**Detail surface:** A selected map pin shows a trail card at the bottom of the screen.
This card acts as a map preview rather than a full modal dialog.
Selecting the card opens more trail details.
The help does not establish a desktop side-panel layout.

**Takeaway:** Give phone users a clear choice between list and map.
Use visible text labels instead of unexplained icons.
A full park detail dialog can replace the extra preview step for this smaller dataset.

## OpenStreetMap

Source: [Browsing guide](https://wiki.openstreetmap.org/wiki/Browsing).

**List and map pattern:** A search box sits beside the map.
A search result can highlight its feature on the map.
The query tool lists nearby features after a map selection.
The map remains the main spatial context.

**Detail surface:** The data browser presents feature tags and history in a side interface.
Notes use marker-triggered map content.
The guide also describes a sidebar for layers and a panel for sharing.
This scan did not confirm the current feature-panel geometry in a running browser.

**Takeaway:** Preserve spatial context when selection changes.
Show readable park facts instead of raw map tags.
Keep service attribution visible.

## iNaturalist

Sources: [Observation search guide](https://help.inaturalist.org/en/support/solutions/articles/151000169670-how-to-search-inaturalist-observations) and [map popover report](https://forum.inaturalist.org/t/location-of-observations-shown-on-map/16020).

**List and map pattern:** Explore offers Map, Grid, and List views over the same search filters.
The guide states that the site remembers the chosen view.
Observation markers appear as users increase the map zoom.

**Detail surface:** The 2020 community report describes a map popover that links to the full observation.
This is historical evidence for a preview followed by a detail page.
The current help confirms view choices but does not confirm that popover's current behavior.

**Takeaway:** Keep filters consistent when users change views.
Expose the selected item through readable text.
Do not require location permission to browse this park catalog.

## Recommendation

Use the approved master-detail shell with a native `<dialog>` for full park details.
Show the list and map together from 800 pixels.
Below 800 pixels, use two labelled buttons to select one panel.
Keep the same search results and selected park across both panels.
Open the same dialog from a list button or marker.
Return focus to the opener when the dialog closes.
This design combines map context with a complete list-based path.
