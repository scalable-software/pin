# Demo: The Page for Using a Component by Hand

This document describes the demo page in `demo/`: what it is for, what it shows, how it is built, and when it changes.

It is a workflow, not a policy. The demo is not part of the component and is never published: the package holds `dist/` only. What the component itself must look like is in `.claude/policies/`.

The examples are from the `title`, whose demo is the reference for how the page is built. What a demo shows comes from its own component: a component without data, such as the `pin`, has no data group.

---

# 1) What the Demo Is For

The demo lets a maintainer use the component's public API by hand, in a browser, and see what it does, without writing a host application.

- It is where a change is checked by eye: a style, a layout fix, the order of events.
- It is where a newcomer first meets the component, so the README's quick start walks through it.
- It uses only what a host application could use: the package's exports, the component's properties, operations and events. It never reaches into the shadow root, and never calls a member that starts with `_`.

# 2) The Layout

The component is shown in a band across the top, and its controls fill the area below it.

| Part | Holds |
|---|---|
| the stage | the component, on the background it is designed for |
| the controls | one group for each section of the specification that a host can use, in the order of the specification |

- The groups are columns that stack under each other on a narrow window. Nothing scrolls sideways at any width.
- The groups in a row share one bottom edge, as tall as the tallest of them.
- A component that is wider than tall gets a band; one that is taller than wide may be placed beside its controls instead. Choose what leaves the component its natural size.
- When the component is wider than a narrow window, the page narrows it through the component's own custom properties, such as `--panel-width`, never by changing the component.

# 3) The Groups

Each group shows one section of the specification. A group is left out when the component has nothing in that section.

| Group | Controls | Shows |
|---|---|---|
| Data | buttons that load sample data, one for each case worth seeing, and a field to load a value of the maintainer's own | the component's current data, updated after every event |
| Operations | one button for each operation | — |
| States | a choice for each writable state; readonly states have no control | every state, following the component |
| Events | a button that clears the log | a log of every event, oldest first, with its local time and its `detail` |

## 3.1) Data

- The samples are valid data: an `id` is a real UUID, made with `crypto.randomUUID()`.
- Choose the samples from the cases the requirements care about: the title has a named pathway, an unnamed one, and a name too long to fit.
- The data is shown as formatted JSON, wrapped rather than scrolled.

## 3.2) Operations

- The buttons are made from the `Operation` list the package exports, in its order, so that a new operation appears without a change to the demo.
- An operation that needs an argument is given a sample, and the group says which: the title's `load` loads the named sample.

## 3.3) States

- The choices are made from each state's value list, such as `Visibility`, `Status` and `Mode`.
- Choosing a value sets the property, never the attribute.
- The page follows the component when the component changes a state itself. States are attributes, so the page watches the component's attributes with a `MutationObserver`.
- A readonly state is shown as text, marked readonly, with no control: the title's `content`.

## 3.4) Events

- The log is fed by `onevent`, which receives every event the component sends. No `on…` property is used, so the page leaves them all free.
- One `onevent` handler hands each event to every part of the page that follows the component: the log and the data view.

# 4) How It Is Built

| File | Holds |
|---|---|
| `demo/index.html` | the stage, and one `section` for each group with its static controls |
| `demo/index.js` | loading the template, defining the component, and wiring the controls; controls made from a list are made here |
| `demo/html.style.css` | the page's layout and the controls' look; never the component's |

- The page imports the component by its package name, resolved by the import map in `importmap/importmap.build.js`, so it uses the same entry point a host application does.
- The page takes its lists from the package's exports, such as `Operation`, `Visibility` and `Type`, rather than typing their values again.

# 5) When the Demo Changes

- **When the public API changes:** a new operation, state or event appears by itself where its group is made from a list; anything else the change needs is added in the same branch.
- **When there is something new to see:** a new sample for a case a story adds, such as a long name.
- **Never to work around the component:** when the demo cannot show something without reaching inside the component, the component is missing something. Say so; do not hide it in the demo.

Every change to the demo is a `DOCUMENTATION:` commit, one concern each, and among the last commits on the branch (`workflow.md` §6). It has no specs (`testing.md` §8): each commit is checked in the browser, at full width and at a narrow width, with the console open for errors. The README's quick start is updated in the same branch when it no longer matches the page.

# 6) Checklist

1. Show the component in a band across the top, or beside its controls when it is taller than wide.
2. Give each section of the specification a host can use its own group, in the order of the specification.
3. Make the groups columns that stack on a narrow window, with no sideways scroll at any width.
4. Give the groups in a row one bottom edge.
5. Load only valid sample data, and show the component's current data.
6. Make one button for each operation, from the `Operation` list.
7. Make a choice for each writable state from its value list; set the property; follow the component through its attributes.
8. Show each readonly state as text, with no control.
9. Log every event through `onevent`, oldest first, with its time and its `detail`, and let the log be cleared.
10. Use only the package's exports and the component's public API.
11. Commit each change as `DOCUMENTATION:`, and check it in the browser at full and narrow width, with no console errors.
