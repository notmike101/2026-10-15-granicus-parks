# Accessibility targets

## Status and scope

The app targets [WCAG 2.1 Level AA](https://www.w3.org/TR/WCAG21/).
This document records implementation choices and required browser checks.
It does not certify compliance.
Automated lint, unit tests, and a production build cannot establish accessibility compliance.

The independent `m4-integration-polish` branch contains responsive styles and documentation.
Its entry function still contains the approved milestone placeholder.
The catalog and map branches supply the controls described below.
The integration shell connects their behavior.
No manual browser check of that integrated app occurred in this milestone.
All manual checks below have status **Not performed**.

## Success criteria

| Criterion | Implementation or integration contract | Manual browser check |
| --- | --- | --- |
| 4.1.2 Name, Role, Value, Level A | Native buttons, labelled search, and labelled amenity checkboxes expose their purpose. A named group contains the mobile switch. Each switch button exposes `aria-pressed`. The dialog uses its park heading as its name. Markers receive park-specific names. | Inspect names, roles, and changing states with a screen reader. Check list selection, marker selection, and both switch states. |
| 2.4.3 Focus Order, Level A | DOM order places the switch before the list and map. CSS removes the hidden mobile panel from navigation. The native modal dialog contains focus. Closing the dialog restores its opener. | Use Tab and Shift+Tab through both layouts. Open details from the list and a marker. Check focus after Escape and the close button. |
| 2.4.7 Focus Visible, Level AA | Responsive CSS adds a dark outline and a white outer ring to focused controls. The map and catalog styles retain visible focus indicators. | Check each control against tiles, images, and all backgrounds. Check that scrolling does not hide the focused control. |
| 1.4.3 Contrast (Minimum), Level AA | The switch uses dark text on white. Its active state uses white text on dark green. Body styles must meet 4.5:1 for normal text. Large text needs 3:1. | Measure computed colors for body text, links, metadata, placeholders, and every control state. Do not assume map labels meet the target. |
| 1.4.1 Use of Color, Level A | Switch state also changes border thickness and font weight. `aria-pressed` exposes the state without color. Selection uses a named park and dialog, not a colored marker alone. | Check switch and selection states without color. Check any list and marker selection indicators. |
| 2.1.2 No Keyboard Trap, Level A | The dialog permits Escape and an explicit close button. Keyboard users can leave the map through normal navigation. List selection provides an alternative to map interaction. | Enter and leave the map in both directions. Check dialog dismissal. Confirm that focus returns to an available opener after filtering. |
| 1.3.1 Info and Relationships, Level A | Headings describe the list and detail sections. Labels name inputs. Amenity groups use related form controls. Park details retain text labels for values and links. | Read headings, landmarks, groups, and form labels with a screen reader. Confirm the reading order matches the visible order. |

Keyboard operation also targets **2.1.1 Keyboard**, Level A.
Use Enter to select a list button.
Use Enter or Space on native switch buttons.
Check marker activation and map zoom without a pointer.
Criterion 2.1.2 concerns escape from controls, not all keyboard operation.

## Images and reflow

Park photos use descriptive alternative text.
The missing-image placeholder uses `Image unavailable`.
Missing text produces no empty detail section or `N/A` label.

Responsive CSS uses a fluid type scale with `clamp()`.
The shell has `min-height: 100dvh`.
The dialog limits its size to the current viewport and scrolls internally.
Long text wraps instead of widening the dialog.
Images cannot exceed the dialog width.
No fixed pixel height controls the phone layout.

These rules support **1.4.10 Reflow**, Level AA.
Check the app at 360 pixels wide and at 400% browser zoom.
Check portrait and landscape orientations.
Check long names, addresses, URLs, and an empty image array.
Confirm that the document has no horizontal scroll.
Confirm that the dialog close button remains reachable after scrolling.

## Browser verification record

| Behavior | Result in this milestone |
| --- | --- |
| List selection and matching marker state | Not performed |
| Marker selection and matching list state | Not performed |
| Search and filters without map tiles | Not performed |
| Mobile switch state and keyboard operation | Not performed |
| Dialog focus containment and restoration | Not performed |
| Visible focus on every control | Not performed |
| Text and non-text contrast measurements | Not performed |
| Screen reader names and reading order | Not performed |
| Phone reflow and landscape scrolling | Not performed |
| Missing and failed image fallback | Not performed |

Record browser names, viewport sizes, and observed results during integration verification.
Keep failed checks visible until a new browser check confirms the correction.
