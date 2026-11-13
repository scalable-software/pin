# Event

This document defines an implementation policy for **component events**, then illustrates how specifications are implemented by applying this policy.

This document is intentionally **events** only, but part of a set of implementation policies which together defines the policies which should be followed to transform specifications into an implementation which is predictable, maintainable, and production-ready at scale.

---

# How to Read This Policy

Rules in this policy fall into three strengths. Read each rule with its strength in mind:

- **Principles** are non-negotiable. They derive from framework correctness or TDD discipline and hold for every component. A conflict with a principle is a defect.
- **Templates** are invariant skeletons with explicit variation points. The skeleton applies to every component; specific steps activate or deactivate based on the component's declared classification (e.g., attribute-backed vs non-attribute, readonly vs writable, payload-bearing vs payload-free). Variation is part of the template, not a deviation from it.
- **Conventions** are canonical defaults that keep implementations readable across components. A second component may deviate when its shape genuinely warrants it; the deviation should be explained at review time, not forbidden by the policy.

When applying this policy to a new component, classify each rule before reconciling conflicts. A conflict with a principle is a defect; a conflict with a template means a variation point needs to be made explicit; a conflict with a convention is a documented deviation.

---

# 1) Event Contract Must Be Declared in the Specification

Each component specification must declare its public event contract under `Events`.

`Events` must be an object whose property names are the canonical event names.

Canonical event names must use lowerCamelCase and must begin with `on`.

Each event definition must include:

- `description`

An event definition may also include:

- `parameters`

Interpretation:

- `description` defines the semantic meaning of the event
- `parameters` defines the public runtime payload contract for the event
- if `parameters` is present, runtime payload must be expressed through a `detail` object
- if `parameters` is absent, the event emits no declared runtime payload

Example specification:

```json
"onpin": {
  "description": "Dispatched when the component becomes pinned.",
  "parameters": [
    {
      "name": "detail",
      "type": "object",
      "properties": {
        "status": {
          "type": "Status",
          "values": ["pinned"]
        }
      }
    }
  ]
}
```

This defines the public event contract that the implementation must honor.

# Template Variation Points

Events vary by payload presence:

- **Payload-bearing events** — declared with `parameters` in the specification. Runtime payload is delivered through `event.detail` and must match the declared parameter contract (Section 7).
- **Payload-free events** — declared without `parameters`. They emit no runtime payload.

The subscription property (Sections 4–5), the framework dispatch path (Section 6), the accepted-outcome dispatch rule (Section 8), and the way an event behaves once dispatched (Section 10) are invariant across both variants.

# 2) Events Must Represent Semantic Outcomes

This framework distinguishes:

- `Events`: the set of observable semantic outcomes exposed by the component
- `Subscription Properties`: the public component API surface used to assign event handlers
- `Runtime Dispatch`: the framework event path used to emit public events
- `Gestures`: the set of low-level user or runtime interactions that may trigger behavior

Policy:

- events describe what happened as a meaningful component outcome
- gestures describe what the user did or what low-level interaction occurred
- subscription properties provide the public assignment surface for handling declared events
- runtime dispatch provides the authoritative emission path for declared public events
- events must not be used to declare gestures
- events must not be used to declare state
- events must not be used to declare operations

Examples of valid semantic events:

- `onpin`
- `onunpin`
- `onshow`
- `onhide`

Examples that must not normally be modeled as component events:

- `onclick`
- `onhover`
- `onmousedown`

These belong to gesture-level behavior, not semantic outcome reporting.

# 3) Public Event Names Must Be Declared in Metadata

For every event declared in the specification, the implementation must define corresponding metadata in `<component>.meta.ts`.

This metadata defines the canonical event vocabulary for the component.

Policy:

- every declared public event must have a key in `Event`
- `Event` contains only declared public event names
- the implementation must use event metadata consistently as the canonical event vocabulary
- the metadata must export an `Events` type, and the component class must implement it through `Meta`, so that the compiler fails the build when a declared event has no subscription property (see the operation policy, Section 3)
- an event is named after the business outcome it reports; when that name is one every HTML element already has, such as `onchange` or `onload`, the override is allowed but must be deliberate

Example pattern:

```typescript
export const Event = {
  ON_HIDE: "onhide",
  ON_SHOW: "onshow",
  ON_PIN: "onpin",
  ON_UNPIN: "onunpin",
} as const;

export type Event = (typeof Event)[keyof typeof Event];

export type Events = Record<Event, EventListener | null>;
```

This gives the implementation a stable, centralized event vocabulary that prevents string duplication and keeps naming consistent across metadata, subscription properties, and dispatch.

A name the platform already uses replaces the element's own property of that name: on that component, `onchange` then means the component's event, not the browser's. The business name comes first, so this is allowed. The metadata tests record which names override, so that an override is a decision and never an accident:

```typescript
// no overrides
then("no event name is taken by the platform", () => {
  const taken = Object.values(Event).filter(
    (name) => name in HTMLElement.prototype
  );
  expect(taken).toEqual([]);
});

// deliberate overrides, listed
expect(taken).toEqual(["onchange", "onload"]);
```

# 4) Event Subscription Must Be Exposed Through Properties

For every public event declared in the specification, the component class must expose a corresponding public subscription property.

Policy:

- every declared public event must have a corresponding public subscription property on the component class
- the public subscription property name must match the canonical event name
- the subscription property must store its assigned handler in a private handler slot
- the subscription property is write-only: it has a setter and no getter
- the setter must go through the base component's `_subscribe` and store what it returns
- assigning a subscription property must replace the previously assigned handler for that property
- assigning `null` must remove the current handler

Example pattern:

```typescript
private _onpin: EventListener | null = null;

public set onpin(handler: EventListener | null) {
  this._onpin = this._subscribe(Event.ON_PIN, this._onpin, handler);
}
```

This gives the component a stable event subscription API:

```typescript
pin.onpin = (event) => console.log(event.detail.status);
pin.onpin = null;
```

# 5) Subscription Properties Must Replace Existing Listeners

Event subscription properties must behave as single-slot listener assignments.

Assignment replaces the previous handler. The base component's `_subscribe(event, current, next)` performs the replacement, in this sequence:

1. check the new handler — it must be a function, `null`, or `undefined`
2. remove the previous listener
3. attach the new listener if there is one
4. return the handler to store: the function, or `null`

Policy:

- a subscription property must manage at most one currently assigned handler
- reassigning a subscription property must replace the previous handler rather than accumulate listeners
- assigning `null` or `undefined` must leave no active listener for that subscription property
- a handler is a value that enters from outside, so it is validated before anything changes: a value that is not a function throws `Invalid {event} value: {value}`, and the previous handler stays in place
- the component must not add or remove the listener itself; `_subscribe` owns that

Example:

```typescript
public set onunpin(handler: EventListener | null) {
  this._onunpin = this._subscribe(Event.ON_UNPIN, this._onunpin, handler);
}
```

To remove the listener:

```typescript
pin.onunpin = null;
```

# 6) Events Must Be Dispatched Through the Framework Dispatch Path

Events must not manually call subscribed handlers.

They must be emitted through the framework dispatch helper so the event is dispatched through the component's standard event path.

Policy:

- public events must be dispatched through `_dispatch(...)`
- the implementation must not manually invoke subscribed handlers as a substitute for event dispatch
- the dispatch helper is the authoritative runtime path for public event emission
- event name metadata from `Event` must be used as the dispatch vocabulary

Example:

```typescript
const detail = { status };

status === Status.PINNED && this._dispatch(Event.ON_PIN, detail);
status === Status.UNPINNED && this._dispatch(Event.ON_UNPIN, detail);
```

This ensures the implementation stays aligned with the DOM event model and keeps public event emission consistent across the component.

# 7) Event Payload Must Match the Specification Contract

For every event declared with `parameters` in the specification, the implementation must emit a runtime payload that matches that declared contract.

Event payload must be delivered through `detail`.

Policy:

- if an event declares `parameters`, the emitted runtime payload must match the declared parameter contract
- when runtime payload is emitted, it must be delivered through `detail`
- emitted payload values must conform to the values and types declared in the specification
- emitted payload must describe the accepted semantic outcome represented by the event
- the implementation must not emit undeclared runtime payload for a declared public event

Example dispatch:

```typescript
const detail = { visibility };

this._dispatch(Event.ON_SHOW, detail);
```

Consumer usage:

```typescript
pin.onshow = (event) => console.log(event.detail.visibility);
```

In this example, the emitted `detail.visibility` value must match the event contract declared in the specification for `onshow`.

# 8) Events Must Only Be Emitted After Accepted Transitions

Public events that represent semantic outcomes must be emitted only after the component has accepted the outcome they describe.

Policy:

- no event must be emitted for a no-op assignment
- no event must be emitted for a rejected transition
- no event must be emitted before the component accepts the semantic outcome
- when an event represents a state outcome, dispatch must occur after the authoritative mutation path has accepted and applied the transition

Example pattern:

```typescript
public set status(status: Status) {
  try {
    // Validate
    status = Validate.status(status);

    // Guard
    if (this._status === status) return;

    // Mutate
    this._status = status;
  } finally {
    // Reflect
    this._reflect(Attributes.STATUS, this._status);
  }

  // Dispatch
  const detail = { status };
  status === Status.PINNED && this._dispatch(Event.ON_PIN, detail);
  status === Status.UNPINNED && this._dispatch(Event.ON_UNPIN, detail);
}
```

In this example, the event is emitted only after validation succeeds, the guard allows the transition, and the canonical state has been updated to the accepted outcome. The dispatch lines sit after the `finally` block: a rejected or ignored value leaves through `finally` and never reaches them.

# 9) Naming Must Be Predictably Transformed Across Layers

Public event naming must remain consistent across the specification, metadata, component API, and runtime dispatch.

Policy:

- the specification defines the canonical public event name
- metadata must define a corresponding `Event` key whose value is that canonical event name
- the component class must expose a public subscription property using that same canonical event name
- runtime dispatch must use the corresponding metadata value from `Event`
- naming must remain predictably traceable across all implementation layers

Transformation pattern:

| Layer | Example |
|---|---|
| Specification | `onpin` |
| Metadata | `Event.ON_PIN = "onpin"` |
| Component API | `set onpin(handler)` |
| Dispatch | `_dispatch(Event.ON_PIN, ...)` |

This predictable transformation keeps the implementation directly traceable back to the specification and consistent with the framework's metadata-driven design.

# 10) How an Event Behaves Once Dispatched

Policy:

- the event type is the full canonical name: a listener is added with `addEventListener("onpin", …)`, not `"pin"`
- an event stays on the component: it does not bubble and does not cross the shadow boundary, so a host subscribes on the element itself or through `onevent` (Section 11)
- an event cannot be cancelled
- the detail is the record of what happened: a handler must read `event.detail`, not the component, because an earlier handler may already have changed the state again
- a handler that throws is contained: the browser reports the error, the remaining handlers still run, and the state change stands

# 11) `onevent` Receives Every Event of a Component

The base component gives every component one more subscription property, `onevent`. It is not declared in a component's specification or metadata.

Policy:

- `onevent` receives every event the component dispatches through `_dispatch`
- it runs after the event's subscription property and after any listener added with `addEventListener`
- assigning replaces the handler; `null` removes it
- it is the entry point for an orchestrator that mirrors a component, such as a Machine:

```typescript
pin.onevent = (event) => machine.send(event);
```

# 12) Lifecycle Events Come From the Base Component

The base component dispatches two events on every component:

- `connected` — after the component is added to the DOM and initialized
- `disconnected` — after the component is removed from the DOM

Policy:

- lifecycle events are not declared in a component's specification or metadata, and have no subscription property
- they reach `onevent` like any other event
- a component must not declare an event of its own with either name

---

# Policy Checklist

A compliant component must:

1. Declare all public events under `Events` in the specification.
2. Define each event using the required specification contract.
3. Use `description` for every declared event.
4. Use `parameters` only when the event emits runtime payload.
5. Express runtime payload through a `detail` object when payload is emitted.
6. Ensure events represent semantic outcomes rather than low-level gestures.
7. Avoid modeling gestures, state, or operations as events.
8. Define all declared public event names in `<component>.meta.ts`, export the `Events` type, and implement `Meta` on the component class.
9. Use `Event` metadata as the canonical event vocabulary, name events after the business outcome, and record any name that overrides one the platform already has.
10. Expose a public, write-only subscription property for every declared public event.
11. Keep each subscription property name aligned with the canonical event name from the specification.
12. Type subscription property setters as `EventListener | null` to formally support handler removal.
13. Store each assigned subscription handler in a private handler slot typed `EventListener | null`.
14. Replace the handler through `_subscribe` and store what it returns; do not add or remove the listener in the component.
15. Reject a handler that is not a function, leaving the previous handler in place; remove the handler for `null`.
16. Dispatch public events through `_dispatch(...)`.
17. Never manually invoke subscribed handlers as a substitute for event dispatch.
18. Emit runtime payload through `event.detail`.
19. Ensure emitted payload matches the specification contract for the event.
20. Emit only values and shapes declared by the specification.
21. Emit events only after the semantic outcome has been accepted.
22. Emit no event for no-op assignments.
23. Emit no event for rejected transitions.
24. Keep naming predictably aligned across specification, metadata, component API, and runtime dispatch.

---

# Policy Applied to Specification

Specification fragment:

```json
{
  "Events": {
    "onhide": {
      "description": "Dispatched when pin 'visibility' state changes from 'visible' to 'hidden'.",
      "parameters": [
        {
          "name": "detail",
          "type": "object",
          "description": "Contains the new visibility state of the component.",
          "properties": {
            "visibility": {
              "type": "Visibility",
              "values": ["hidden"]
            }
          }
        }
      ]
    },
    "onshow": {
      "description": "Dispatched when pin 'visibility' state changes from 'hidden' to 'visible'.",
      "parameters": [
        {
          "name": "detail",
          "type": "object",
          "description": "Contains the new visibility state of the component.",
          "properties": {
            "visibility": {
              "type": "Visibility",
              "values": ["visible"]
            }
          }
        }
      ]
    },
    "onpin": {
      "description": "Dispatched when pin 'status' changes from 'unpinned' to 'pinned'.",
      "parameters": [
        {
          "name": "detail",
          "type": "object",
          "description": "Contains the new status of the component.",
          "properties": {
            "status": {
              "type": "Status",
              "values": ["pinned"]
            }
          }
        }
      ]
    },
    "onunpin": {
      "description": "Dispatched when pin 'status' changes from 'pinned' to 'unpinned'.",
      "parameters": [
        {
          "name": "detail",
          "type": "object",
          "description": "Contains the new status of the component.",
          "properties": {
            "status": {
              "type": "Status",
              "values": ["unpinned"]
            }
          }
        }
      ]
    }
  }
}
```

How this specification is implemented:

- every declared event is represented in metadata as part of the canonical `Event` vocabulary
- every declared event is exposed through a corresponding public subscription property
- `onhide`
    - subscription property typed `EventListener | null`
    - dispatched by the `visibility` setter after accepting a transition to `Visibility.HIDDEN`
    - payload: `detail.visibility = "hidden"`
- `onshow`
    - subscription property typed `EventListener | null`
    - dispatched by the `visibility` setter after accepting a transition to `Visibility.VISIBLE`
    - payload: `detail.visibility = "visible"`
- `onpin`
    - subscription property typed `EventListener | null`
    - dispatched by the `status` setter after accepting a transition to `Status.PINNED`
    - payload: `detail.status = "pinned"`
- `onunpin`
    - subscription property typed `EventListener | null`
    - dispatched by the `status` setter after accepting a transition to `Status.UNPINNED`
    - payload: `detail.status = "unpinned"`

Implementation:

```typescript
private _onhide: EventListener | null = null;
private _onshow: EventListener | null = null;
private _onpin: EventListener | null = null;
private _onunpin: EventListener | null = null;

public set onhide(handler: EventListener | null) {
  this._onhide = this._subscribe(Event.ON_HIDE, this._onhide, handler);
}

public set onshow(handler: EventListener | null) {
  this._onshow = this._subscribe(Event.ON_SHOW, this._onshow, handler);
}

public set onpin(handler: EventListener | null) {
  this._onpin = this._subscribe(Event.ON_PIN, this._onpin, handler);
}

public set onunpin(handler: EventListener | null) {
  this._onunpin = this._subscribe(Event.ON_UNPIN, this._onunpin, handler);
}
```

Dispatch from within the authoritative state setters:

```typescript
public set visibility(visibility: Visibility | null) {
  try {
    // Normalize
    visibility = visibility ?? Visibility.VISIBLE;
    // Validate
    visibility = Validate.visibility(visibility);

    // Guard
    if (this._visibility === visibility) return;

    // Mutate
    this._visibility = visibility;
  } finally {
    // Reflect
    this._reflect(Attributes.VISIBILITY, this._visibility, Visibility.VISIBLE);
  }

  // Dispatch
  const detail = { visibility };
  visibility === Visibility.HIDDEN && this._dispatch(Event.ON_HIDE, detail);
  visibility === Visibility.VISIBLE && this._dispatch(Event.ON_SHOW, detail);
}

public set status(status: Status) {
  try {
    // Validate
    status = Validate.status(status);

    // Guard
    if (this._status === status) return;

    // Mutate
    this._status = status;
  } finally {
    // Reflect
    this._reflect(Attributes.STATUS, this._status);
  }

  // Dispatch
  const detail = { status };
  status === Status.PINNED && this._dispatch(Event.ON_PIN, detail);
  status === Status.UNPINNED && this._dispatch(Event.ON_UNPIN, detail);
}
```

How the implementation applies the policy:

- the specification defines the public event contract under `Events`
- metadata defines the canonical event vocabulary
- the component class exposes each declared event as a public subscription property with the same canonical name
- subscription properties are write-only and typed `EventListener | null` to formally support both handler assignment and handler removal
- subscription properties manage a single handler slot through `_subscribe` — reassignment replaces, `null` removes, and a value that is not a function is rejected
- events are dispatched through `_dispatch(...)`, not by manually invoking handlers
- payload is delivered through `detail` and matches the values declared in the specification
- events are emitted only after the authoritative state setter has validated, guarded, mutated, and reflected the accepted transition
- naming is predictably traceable: specification → `Event` metadata → subscription property → `_dispatch` call

---

# Component Event Specification Schema

JSON Schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://scalable.software/schema/component-events.schema.json",
  "title": "Component Events",
  "description": "Schema for the Events object in a component specification.",
  "type": "object",
  "propertyNames": {
    "type": "string",
    "pattern": "^on[a-z][a-zA-Z0-9]*$",
    "description": "Canonical event name in lowerCamelCase beginning with 'on', for example: onpin, onunpin, onshow, onhide."
  },
  "additionalProperties": {
    "type": "object",
    "description": "An event definition.",
    "required": ["description"],
    "additionalProperties": false,
    "properties": {
      "description": {
        "type": "string",
        "minLength": 1,
        "description": "Human-readable description of the semantic outcome represented by the event."
      },
      "parameters": {
        "type": "array",
        "description": "Ordered list of runtime payload parameters for the event. When present, runtime payload must be expressed through a detail object.",
        "minItems": 1,
        "items": {
          "type": "object",
          "required": ["name", "type"],
          "additionalProperties": false,
          "properties": {
            "name": {
              "type": "string",
              "const": "detail",
              "description": "The public runtime payload channel for component events. Event payload must be exposed through detail."
            },
            "type": {
              "type": "string",
              "const": "object",
              "description": "Event payload type. Runtime payload for component events must be expressed as an object."
            },
            "description": {
              "type": "string",
              "minLength": 1,
              "description": "Human-readable description of the detail payload."
            },
            "properties": {
              "type": "object",
              "description": "The object properties emitted through event.detail.",
              "minProperties": 1,
              "propertyNames": {
                "type": "string",
                "pattern": "^[a-z][a-zA-Z0-9]*$",
                "description": "Canonical property name in lowerCamelCase, for example: status, visibility."
              },
              "additionalProperties": {
                "type": "object",
                "required": ["type"],
                "additionalProperties": false,
                "properties": {
                  "type": {
                    "type": "string",
                    "minLength": 1,
                    "description": "Declared type of the detail property, for example: Status, Visibility, string, boolean."
                  },
                  "values": {
                    "type": "array",
                    "minItems": 1,
                    "description": "Allowed values for this emitted property when the event contract constrains the outcome to a subset of the value domain."
                  },
                  "description": {
                    "type": "string",
                    "minLength": 1,
                    "description": "Human-readable description of the emitted property."
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

Example JSON:

```json
{
  "Events": {
    "onhide": {
      "description": "Dispatched when pin 'visibility' state changes from 'visible' to 'hidden'.",
      "parameters": [
        {
          "name": "detail",
          "type": "object",
          "description": "Contains the new visibility state of the component.",
          "properties": {
            "visibility": {
              "type": "Visibility",
              "values": ["hidden"]
            }
          }
        }
      ]
    },
    "onshow": {
      "description": "Dispatched when pin 'visibility' state changes from 'hidden' to 'visible'.",
      "parameters": [
        {
          "name": "detail",
          "type": "object",
          "description": "Contains the new visibility state of the component.",
          "properties": {
            "visibility": {
              "type": "Visibility",
              "values": ["visible"]
            }
          }
        }
      ]
    },
    "onpin": {
      "description": "Dispatched when pin 'status' changes from 'unpinned' to 'pinned'.",
      "parameters": [
        {
          "name": "detail",
          "type": "object",
          "description": "Contains the new status of the component.",
          "properties": {
            "status": {
              "type": "Status",
              "values": ["pinned"]
            }
          }
        }
      ]
    },
    "onunpin": {
      "description": "Dispatched when pin 'status' changes from 'pinned' to 'unpinned'.",
      "parameters": [
        {
          "name": "detail",
          "type": "object",
          "description": "Contains the new status of the component.",
          "properties": {
            "status": {
              "type": "Status",
              "values": ["unpinned"]
            }
          }
        }
      ]
    }
  }
}
```
