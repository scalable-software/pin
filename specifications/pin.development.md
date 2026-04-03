# Product Development

Level 1 - The Application Hierarchy

```
 Initiative:  Web Application
└─ Epic:     Workspace Layout Management
   └─ Feature:   Pinnable Panels
      └─ User Story: "As a user, I want to pin a panel so it
                      stays visible while I navigate the workspace"
         ├─ Acceptance Criteria:
         │     ├─ Panel remains in position when pinned
         │     ├─ Panel can be unpinned and dismissed
         │     └─ Pin state persists across navigation
         └─ Tasks:
               ├─ Implement <content-panel> component
               ├─ Integrate <pin-button> into panel
               └─ Wire onpin event to layout manager
```

Level 2 - The Component Library Hierarchy

```
Initiative:  Component Library
└─ Epic:     Interactive Controls
   └─ Feature:   Pin Button
      └─ User Story: "As a developer, I want a pin-button component
                      with a reliable state/event contract so I can
                      integrate it predictably into any panel"
         ├─ Acceptance Criteria:
         │     ├─ Component renders as a styled toggleable button
         │     ├─ Supports visible and status states
         │     ├─ Exposes hide, show, pin, unpin and toggle operations
         │     ├─ Emits onhide, onshow, onpin, onunpin and on events
         │     └─ Click gesture toggles status
         └─ Tasks:
               ├─ Define specification (pin.specifications.json)
               ├─ Implement Pin.ts
               ├─ Author Pin.template.html
               ├─ Author Pin.style.css
               ├─ Write unit tests
               └─ Generate API documentation
```

Level 3 - The Component Capability Hierarchy

```
Initiative:  Component Library
└─ Epic:     Pin Button
   ├─ Feature:   Visibility
   │  └─ User Story: "As a developer, I want to control pin visibility
   │                  so I can show or hide it programmatically"
   │     ├─ Acceptance Criteria:
   │     │     ├─ visible state accepts 'yes' | 'no'
   │     │     ├─ absence of attribute defaults to 'yes'
   │     │     └─ DOM stays clean (attribute removed when visible=yes)
   │     └─ Tasks:
   │           ├─ Implement visible state with attribute reflection
   │           ├─ Implement hide() operation
   │           ├─ Implement show() operation
   │           ├─ Emit onhide event with { visible: 'no' }
   │           └─ Emit onshow event with { visible: 'yes' }
   │
   └─ Feature:   Pin Status
      └─ User Story: "As a developer, I want to control pin status
                      so I can pin or unpin it programmatically"
         ├─ Acceptance Criteria:
         │     ├─ status state accepts 'pinned' | 'unpinned'
         │     ├─ attribute is always present (initialized)
         │     └─ click gesture toggles status
         └─ Tasks:
               ├─ Implement status state with attribute reflection
               ├─ Implement pin() operation
               ├─ Implement unpin() operation
               ├─ Implement toggle() operation
               ├─ Wire click gesture to toggle()
               ├─ Emit onpin event with { status: 'pinned' }
               └─ Emit onunpin event with { status: 'unpinned' }
```

# Pin Component — Development Journey

This document captures the agile development journey of the `pin-button` Web Component, organized as Epics, User Stories, Features, and Tasks. Epics 1–5 are a direct translation of the [pin.specifications.json](pin.specifications.json). Epic 6 is the only emergent backlog addition, and Epic 7 covers developer experience.

---

## Summary

| Epic                    | User Stories | Features | Driven by Spec? |
| ----------------------- | ------------ | -------- | --------------- |
| 1. Foundation           | 1            | 4        | Yes             |
| 2. Visibility Control   | 1            | 2        | Yes             |
| 3. Pin Status Control   | 1            | 2        | Yes             |
| 4. Event Communication  | 1            | 3        | Yes             |
| 5. User Interaction     | 2            | 2        | Yes             |
| 6. Robustness           | 1            | 1        | No — emerged    |
| 7. Developer Experience | 1            | 2        | Partially       |

---

## Epic 1 — Component Foundation

**User Story**

> As a developer, I want to drop `<pin-button>` into any HTML page so that I get a fully styled, functional pin button without writing any CSS or JavaScript.

---

### Feature 1.1 — Metadata Module

The TypeScript projection of the spec. No logic — just the contract encoded as constants and types.

| Task                                  | Artefact                     |
| ------------------------------------- | ---------------------------- |
| Define `Tag` constant                 | `src/pin.meta.ts`            |
| Define `Attributes` constant and type | `src/pin.meta.ts`            |
| Define `Visible` constant and type    | `src/pin.meta.ts`            |
| Define `Status` constant and type     | `src/pin.meta.ts`            |
| Define `Operation` constant and type  | `src/pin.meta.ts`            |
| Define `Event` constant and type      | `src/pin.meta.ts`            |
| Define `Gesture` constant and type    | `src/pin.meta.ts`            |
| Write metadata unit tests             | `test/unit/pin.meta.test.ts` |

---

### Feature 1.2 — DOM Composition

The visual structure of the component derived from the `Composition` block in the spec.

| Task                                                       | Artefact                |
| ---------------------------------------------------------- | ----------------------- |
| Create `<template id="pin-button">` with `.icon` container | `src/pin.template.html` |
| Add `.pinned` SVG icon inside `.icon`                      | `src/pin.template.html` |
| Add `.unpinned` SVG icon inside `.icon`                    | `src/pin.template.html` |
| Write composition unit tests for template structure        | `test/unit/pin.test.ts` |

---

### Feature 1.3 — Component Shell

Wires the class, Shadow DOM, template, and CSS together.

| Task                                                       | Artefact                |
| ---------------------------------------------------------- | ----------------------- |
| Define `configuration` object (url, template id, css name) | `src/pin.ts`            |
| Create `Pin` class extending base `Component`              | `src/pin.ts`            |
| Expose `Pin.Tag` static getter                             | `src/pin.ts`            |
| Expose `Pin.Attributes` static getter                      | `src/pin.ts`            |
| Expose `Pin.Template` static property                      | `src/pin.ts`            |
| Write component configuration unit tests                   | `test/unit/pin.test.ts` |

---

### Feature 1.4 — Scoped Stylesheet

Visual presentation, light/dark mode, encapsulated inside Shadow DOM.

| Task                                                                  | Artefact                |
| --------------------------------------------------------------------- | ----------------------- |
| Define CSS custom properties (colours, sizes, radius) for light mode  | `src/pin.style.css`     |
| Define CSS custom property overrides for dark mode                    | `src/pin.style.css`     |
| Style `.icon` container (layout, border, shadow, cursor, transitions) | `src/pin.style.css`     |
| Style SVG icons (size, fill, transitions)                             | `src/pin.style.css`     |
| Write CSS link unit test                                              | `test/unit/pin.test.ts` |

---

## Epic 2 — Visibility Control

**User Story**

> As a developer, I want to show and hide the pin button so that I can control its presence in the UI without removing it from the DOM.

---

### Feature 2.1 — Visible State

| Task                                                                   | Artefact                |
| ---------------------------------------------------------------------- | ----------------------- |
| Declare internal `_visible` defaulting to `Visible.YES`                | `src/pin.ts`            |
| Implement `visible` getter (attribute-first, fallback to internal)     | `src/pin.ts`            |
| Implement `visible` setter with clean-DOM pattern (no attr when `YES`) | `src/pin.ts`            |
| Register `VISIBLE` in `_attributeHandlers`                             | `src/pin.ts`            |
| Apply `:host([visible="no"]) { display: none }` in CSS                 | `src/pin.style.css`     |
| Write visible state unit tests                                         | `test/unit/pin.test.ts` |

---

### Feature 2.2 — Hide & Show Operations

| Task                                                 | Artefact                |
| ---------------------------------------------------- | ----------------------- |
| Implement `hide()` — sets `visible` to `Visible.NO`  | `src/pin.ts`            |
| Implement `show()` — sets `visible` to `Visible.YES` | `src/pin.ts`            |
| Write `hide` operation unit tests                    | `test/unit/pin.test.ts` |
| Write `show` operation unit tests                    | `test/unit/pin.test.ts` |

---

## Epic 3 — Pin Status Control

**User Story**

> As a developer, I want to pin and unpin the button programmatically so that I can synchronise its state with my application.

---

### Feature 3.1 — Status State

| Task                                                                     | Artefact                |
| ------------------------------------------------------------------------ | ----------------------- |
| Declare internal `_status` defaulting to `Status.UNPINNED`               | `src/pin.ts`            |
| Implement `status` getter (attribute-first, fallback to internal)        | `src/pin.ts`            |
| Implement `status` setter — always reflects to DOM attribute             | `src/pin.ts`            |
| Implement `_initialize()` — sets `status` attribute on connect if absent | `src/pin.ts`            |
| Register `STATUS` in `_attributeHandlers`                                | `src/pin.ts`            |
| Apply pinned/unpinned CSS state rules (SVG visibility, background)       | `src/pin.style.css`     |
| Write status state unit tests                                            | `test/unit/pin.test.ts` |

---

### Feature 3.2 — Pin, Unpin & Toggle Operations

| Task                                                         | Artefact                |
| ------------------------------------------------------------ | ----------------------- |
| Implement `pin()` — sets `status` to `Status.PINNED`         | `src/pin.ts`            |
| Implement `unpin()` — sets `status` to `Status.UNPINNED`     | `src/pin.ts`            |
| Implement `toggle()` — flips between `PINNED` and `UNPINNED` | `src/pin.ts`            |
| Write `pin` operation unit tests                             | `test/unit/pin.test.ts` |
| Write `unpin` operation unit tests                           | `test/unit/pin.test.ts` |
| Write `toggle` operation unit tests                          | `test/unit/pin.test.ts` |

---

## Epic 4 — Event Communication

**User Story**

> As a developer, I want to be notified when the pin changes state so that my application can react without polling.

---

### Feature 4.1 — Visibility Events

| Task                                                                | Artefact                |
| ------------------------------------------------------------------- | ----------------------- |
| Declare `_onhide` and `_onshow` internal handler references         | `src/pin.ts`            |
| Dispatch `onhide` event with `detail.visible` from `visible` setter | `src/pin.ts`            |
| Dispatch `onshow` event with `detail.visible` from `visible` setter | `src/pin.ts`            |
| Implement `onhide` setter with listener swap                        | `src/pin.ts`            |
| Implement `onshow` setter with listener swap                        | `src/pin.ts`            |
| Write `onhide` event unit tests                                     | `test/unit/pin.test.ts` |
| Write `onshow` event unit tests                                     | `test/unit/pin.test.ts` |

---

### Feature 4.2 — Status Events

| Task                                                               | Artefact                |
| ------------------------------------------------------------------ | ----------------------- |
| Declare `_onpin` and `_onunpin` internal handler references        | `src/pin.ts`            |
| Dispatch `onpin` event with `detail.status` from `status` setter   | `src/pin.ts`            |
| Dispatch `onunpin` event with `detail.status` from `status` setter | `src/pin.ts`            |
| Implement `onpin` setter with listener swap                        | `src/pin.ts`            |
| Implement `onunpin` setter with listener swap                      | `src/pin.ts`            |
| Write `onpin` event unit tests                                     | `test/unit/pin.test.ts` |
| Write `onunpin` event unit tests                                   | `test/unit/pin.test.ts` |

---

### Feature 4.3 — Catch-all Event

| Task                                                                      | Artefact                |
| ------------------------------------------------------------------------- | ----------------------- |
| Declare `_on` internal handler reference                                  | `src/pin.ts`            |
| Implement `on` setter — subscribes to all events except `Event.ON` itself | `src/pin.ts`            |
| Write `on` catch-all event unit tests                                     | `test/unit/pin.test.ts` |

---

## Epic 5 — User Interaction

**User Story 1**

> As a user, I want to click the pin button to toggle it so that I can pin and unpin without any application code.

**User Story 2**

> As a user, I want visual feedback when I hover over the pin so that the button feels interactive and clickable.

---

### Feature 5.1 — Click Gesture

| Task                                              | Artefact                |
| ------------------------------------------------- | ----------------------- |
| Cache `.icon` element reference in `_cache()`     | `src/pin.ts`            |
| Implement `_handleClick` delegating to `toggle()` | `src/pin.ts`            |
| Wire click listener in `_addEventListeners`       | `src/pin.ts`            |
| Remove click listener in `_removeEventListeners`  | `src/pin.ts`            |
| Write click gesture unit tests                    | `test/unit/pin.test.ts` |

---

### Feature 5.2 — Hover Gesture (CSS-only)

No runtime event. No unit test. Intentional per spec: _"visual-only gesture implemented via CSS and does not emit runtime events"_.

| Task                                                                   | Artefact            |
| ---------------------------------------------------------------------- | ------------------- |
| Apply hover background, border, and shadow via `@media (hover: hover)` | `src/pin.style.css` |
| Apply hover SVG fill colour change                                     | `src/pin.style.css` |
| Apply active (pressed) state background and shadow removal             | `src/pin.style.css` |

---

## Epic 6 — Robustness

**User Story**

> As a developer, I want the component to throw a descriptive error when I pass an invalid value so that bugs surface immediately rather than silently corrupting state.

> **Note:** This epic has no corresponding entry in the specification — it emerged after the core component was built. A candidate for a future `Validation` section in `pin.specifications.json`.

---

### Feature 6.1 — Input Validation

| Task                                                   | Artefact                           |
| ------------------------------------------------------ | ---------------------------------- |
| Create `Validate` class with `visible()` static method | `src/pin.validation.ts`            |
| Create `Validate` class with `status()` static method  | `src/pin.validation.ts`            |
| Integrate `Validate.visible()` into `visible` setter   | `src/pin.ts`                       |
| Integrate `Validate.status()` into `status` setter     | `src/pin.ts`                       |
| Export `Validate` from `index.ts`                      | `src/index.ts`                     |
| Write `Validate.visible` unit tests                    | `test/unit/pin.validation.test.ts` |
| Write `Validate.status` unit tests                     | `test/unit/pin.validation.test.ts` |
| Update state tests to assert on invalid input errors   | `test/unit/pin.test.ts`            |

---

## Epic 7 — Developer Experience

**User Story**

> As a developer adopting this package, I want generated API docs, a public npm release, and CI/CD so that I can integrate `<pin-button>` with confidence.

---

### Feature 7.1 — API Documentation

| Task                                                               | Artefact       |
| ------------------------------------------------------------------ | -------------- |
| Add TypeDoc JSDoc annotations to all public members                | `src/pin.ts`   |
| Configure `npm run document` script                                | `package.json` |
| Write README with Quick Start, States, Operations, Events sections | `README.md`    |

---

### Feature 7.2 — Publishing & CI/CD

| Task                                             | Artefact                         |
| ------------------------------------------------ | -------------------------------- |
| Configure automated test workflow                | `.github/workflows/test.yaml`    |
| Configure automated publish workflow             | `.github/workflows/publish.yaml` |
| Configure `.npmignore` to exclude non-dist files | `.npmignore`                     |
| Bump to `0.1.0`                                  | `package.json`                   |

---
