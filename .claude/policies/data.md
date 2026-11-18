# Data

This document defines an implementation policy for **component data**, then illustrates how specifications are implemented by applying this policy.

This document is intentionally **data** only, but part of a set of implementation policies which together defines the policies which should be followed to transform specifications into an implementation which is predictable, maintainable, and production-ready at scale.

---

# How to Read This Policy

Rules in this policy fall into three strengths. Read each rule with its strength in mind:

- **Principles** are non-negotiable. They derive from framework correctness or TDD discipline and hold for every component. A conflict with a principle is a defect.
- **Templates** are invariant skeletons with explicit variation points. The skeleton applies to every component; specific steps activate or deactivate based on the component's declared classification (e.g., attribute-backed vs non-attribute, readonly vs writable, payload-bearing vs payload-free). Variation is part of the template, not a deviation from it.
- **Conventions** are canonical defaults that keep implementations readable across components. A second component may deviate when its shape genuinely warrants it; the deviation should be explained at review time, not forbidden by the policy.

When applying this policy to a new component, classify each rule before reconciling conflicts. A conflict with a principle is a defect; a conflict with a template means a variation point needs to be made explicit; a conflict with a convention is a documented deviation.

The examples in this policy come from the component whose implementation shows a rule best: most from the pin, the one complete component in this package, and others from a component that has what the pin lacks, such as the title's data, or from an invented case. They show how a rule turns into a specification entry, code and tests. They are illustrations, not a model to copy: a component's states, operations, events, gestures, tests and specification come from its own requirements, never from the example's. Apply the rules, and the principles behind them, in the context of the component in front of you.

---

# 1) Data Contract Must Be Declared in the Specification

Each component specification must declare its data contract under `Data`.

`Data` must be an object whose property names are the canonical data names, in lowerCamelCase.

Each data definition must include:

- `type`
- `description`
- `default`
- `readonly`

A data definition of a structure must also include:

- `properties`

Interpretation:

- `type` is the PascalCase name of the data's type in metadata, such as `Metadata` or `Document`
- `description` defines what the data is, in the words of the business
- `default` is the value the data has before any is created or loaded; `null` means the data can be unloaded (Section 9)
- `readonly` defines whether the outside may assign the data (Section 7)
- `properties` declares the fields of a structure; each field has a `type` and a `description`, and may have `values`, its own `properties`, or `items`

A field's `type` is `string`, `number` or `boolean`, `array` for a list, or the PascalCase name of a value domain, a format or a structure declared in metadata, such as `Type` or `Uuid`. A field with a value domain lists its `values`, as a state does.

Example specification:

```json
"Data": {
  "metadata": {
    "type": "Metadata",
    "description": "The metadata of the clinical pathway.",
    "properties": {
      "id": {
        "type": "Uuid",
        "description": "The unique identifier of the clinical pathway."
      },
      "name": {
        "type": "string",
        "description": "The name of the clinical pathway; empty until the user names it."
      },
      "type": {
        "type": "Type",
        "description": "The kind of map the title holds.",
        "values": ["pathway"]
      }
    },
    "default": null,
    "readonly": false
  }
}
```

The specification declares what the data is, never how it is shown. A placeholder shown while the data has no name is presentation: it belongs to the template, the stylesheet or the component's lexicon, never to a field's declaration.

This defines the public data contract that the implementation must honor.

# Template Variation Points

The classification of each declared data item determines which sub-rules of this policy activate when it is implemented:

- **Structure vs scalar** — a structure declares `properties`; its validator checks every field and rejects undeclared ones (Section 4). A scalar has no `properties`; its validator is one of the kinds the validation policy describes.
- **`readonly: false` vs `readonly: true`** — writable data has a public setter (Sections 7, 8); readonly data has only a getter and is assigned through a private path.
- **`default: null` vs a value** — `null` activates the unloaded state (Section 9). Data with a value as its default holds that value from construction, and Section 9 does not apply.
- **Derived state** — when a state is computed from the data, the data's mutation path synchronizes it (Section 10).
- **Created on connect** — when the specification declares a `create` operation and the component must hold data once it is on the page, the component creates it when connected (Section 13).
- **Editing surface** — when the template lets the user edit the data, Section 14 applies.

These are declared variation points of the template. A data item whose classification activates a combination not described here is a signal that this list needs to be extended, not that the data item deviates from the template.

# 2) Data Must Represent Component-Owned Content

This framework distinguishes:

- `Data`: content the component holds for its host, such as a record, a document or a selection
- `States`: a finite runtime condition, such as visibility, status or mode
- `Operations`: callable public actions
- `Events`: observable semantic outcomes
- `Gestures`: interaction inputs

Policy:

- data describes content; it is not a finite condition, an action, an outcome or an input
- a member whose value is an object or a list is data, never state: a state's values are primitives (see the state policy, Section 2), and only data has the Clone step that keeps such a value the component's own (Section 8)
- a condition that is computed from the data, such as whether it has a name, is declared as a state, not as part of the data; that state is readonly, because only the component can compute it
- data must not be used to declare state, operations, events or gestures

# 3) Data Names, Shapes and Formats Must Be Declared in Metadata

For every data item declared in the specification, the implementation must define corresponding metadata in `<component>.meta.ts`.

Policy:

- every declared data item has a key in `Datum`, whose value is the canonical data name
- `Datum` contains only declared data names
- every declared data item has a type in metadata, named as the specification's `type`
- every field with a value domain has a domain object, as a state's value domain does
- every field with a format has a pattern in metadata, so that the validator never holds a literal pattern
- the metadata must export a `Data` type, and `Meta` includes it, so that the compiler fails the build when a declared data item has no getter on the class (see the operation policy, Section 3)
- the names pair up as for the other constructs: `Datum` names one data item, as `State` names one state, and `Data` is the record of all of them, as `States` is
- a data name may override one every HTML element already has; the override is allowed but must be deliberate, and the metadata tests record it, as they do for states, operations and events

Example pattern:

```typescript
export const Datum = {
  METADATA: "metadata",
} as const;

export type Datum = (typeof Datum)[keyof typeof Datum];

export const Uuid = {
  PATTERN: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
} as const;

export type Uuid = string;

export const Type = {
  PATHWAY: "pathway",
} as const;

export type Type = (typeof Type)[keyof typeof Type];

export type Metadata = {
  id: Uuid;
  name: string;
  type: Type;
};

export type Data = Record<Datum, unknown>;

export type Meta = States & Data & Operations & Events;
```

# 4) Data Validation Must Check the Whole Structure

For every declared data item, the implementation must define a validator in `<component>.validation.ts`. The validation policy defines the validator's form: a public static arrow function on `Validate` that accepts `unknown`, throws on invalid input, and returns the narrowed value. This section defines only what is particular to a structure.

Policy:

- a value that is not a plain object is rejected with `Invalid {name} value: {value}`
- a field the specification does not declare is rejected, never dropped: the host maps a richer record to the declared shape itself
- every declared field passes its own check, as the validation policy describes for its kind: an enum is on its list, a format matches its pattern from metadata, a scalar has its runtime type
- a nested structure or a list is checked the same way, field by field and item by item
- a failing field is reported as `Invalid {name} value: {field} is {problem}`, where the problem is `required` for an absent field, `invalid` for a field that fails its check, and `not declared` for an undeclared field
- `null` is not a valid value of the data: the validator rejects it like any other value that is not an object (Section 9)

Example:

```typescript
public static metadata = (value: unknown) => {
  // Structure
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new Error(`Invalid metadata value: ${value}`);

  const { id, name, type, ...rest } = value as Record<string, unknown>;

  // Undeclared fields
  const undeclared = Object.keys(rest)[0];
  if (undeclared)
    throw new Error(`Invalid metadata value: ${undeclared} is not declared`);

  // Declared fields
  if (id === undefined) throw new Error("Invalid metadata value: id is required");
  if (typeof id !== "string" || !Uuid.PATTERN.test(id))
    throw new Error("Invalid metadata value: id is invalid");

  if (name === undefined) throw new Error("Invalid metadata value: name is required");
  if (typeof name !== "string")
    throw new Error("Invalid metadata value: name is invalid");

  if (type === undefined) throw new Error("Invalid metadata value: type is required");
  if (!Object.values(Type).includes(type as Type))
    throw new Error("Invalid metadata value: type is invalid");

  return value as Metadata;
};
```

The validator does not copy the value. Copying belongs to the mutation path (Section 5), so the validator stays pure.

# 5) The Component Must Own Its Data

Once data is accepted, only the component may change it. Neither the caller that passed it in nor a reader that receives it may change it in place.

Policy:

- the canonical value is stored in a private backing field, and the getter returns that field
- the mutation path stores a deep-frozen copy of the validated value, made with `structuredClone`, never the value that came in
- the getter and every event `detail` hand out the stored value itself; because it is frozen, they need no copy of their own
- because the stored value is frozen, an assignment to one of its fields throws in module code instead of changing the data unseen
- the copy is made after validation, so that only plain, declared data reaches `structuredClone`, and every rejection carries the canonical message
- the copy comes first, so that the component freezes its own copy and never the value that came in: freezing that would change an object the caller still holds
- the setter copies in its Clone phase and freezes in its Mutate phase (Section 8)
- the freeze is made by the base component's `_freeze(value)`, which freezes a value and everything inside it; until the base component provides it, the component defines `_freeze` itself, as a protected member of the class with the same signature, never as a function loose in the module, so that the base component's version can replace it without other change

`_freeze`, as the base component is to provide it:

```typescript
/**
 * Freeze a value and everything inside it.
 */
protected _freeze = <T>(value: T): T => {
  if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    Object.values(value).forEach(this._freeze);
  }
  return value;
};
```

A primitive is already immutable: `structuredClone` and `_freeze` return it unchanged, so scalar data follows the same path.

# 6) Data Is Not Attribute-Backed

Policy:

- data is never declared in `Attributes` and never observed through `attributeChangedCallback`
- data is never reflected to an attribute; when the stylesheet must react to the data, a state computed from it is declared and reflected instead (Section 10)

# 7) Data Must Declare Its External Access Contract

Every data item has a public getter. Its `readonly` declaration decides whether it also has a public setter.

- **`readonly: false`** — a public setter, which is the single path every assignment from outside and every operation goes through
- **`readonly: true`** — no public setter; the component assigns the data through a private path that follows the same mutation order (Section 8)

Readonly does not mean the data never changes. It means the data is not writable from the outside: the component retains ownership of every change.

For data that can be unloaded, the getter's type includes `null` and the setter's does not: the outside may read that there is no data, but never assign it (Section 9).

```typescript
private _metadata: Metadata | null = null;

public get metadata(): Metadata | null {
  return this._metadata;
}
public set metadata(metadata: Metadata) {
  // Section 8
}
```

# 8) The Data Mutation Path Is Normalize → Validate → Clone → Mutate → Synchronize

For writable data, the mutation path must follow this order:

1. **Normalize** — converts an incoming value into the shape validation expects, when the data needs it
2. **Validate** — enforces the declared contract (Section 4)
3. **Clone** — copies the validated value with `structuredClone`, so that what is stored is the component's own (Section 5)
4. **Mutate** — freezes the copy with `_freeze` and stores it
5. **Synchronize** — updates what is derived from the data (Section 10)

A mutation path may omit phases that are not needed for a given data item, but the order of any phases that are used must remain Normalize → Validate → Clone → Mutate → Synchronize.

Clone sits after Validate, so that only checked, plain data reaches `structuredClone`, and before Mutate, so that the freeze never touches the value that came in. Scalar data whose value is a primitive may omit it: a primitive cannot be changed in place, so its copy would be the value itself.

Policy:

- the data mutation path has no Guard: a copy is never identical to what came in, and synchronizing again is safe, because every derived state guards itself
- the data mutation path dispatches no event: data events belong to the operations that bring the data in or change it (Section 15)
- if validation throws, nothing is stored and nothing is synchronized
- the setter's parameter carries the name of the data, as a state setter's does

```typescript
public set metadata(metadata: Metadata) {
  // Validate
  metadata = Validate.metadata(metadata);

  // Clone
  metadata = structuredClone(metadata);

  // Mutate
  this._metadata = this._freeze(metadata);

  // Synchronize
  this._updateLabel();
  this._syncContent();
}
```

# 9) The Unloaded State Belongs to the Component

Data whose `default` is `null` has an unloaded state: it is `null` until it is created or loaded.

Policy:

- the backing field starts as `null`, and the getter's type includes `null`
- `null` is never accepted from outside: the setter's type excludes it, and the validator rejects it at runtime
- the specification may declare an operation that returns the data to the unloaded state; such an operation assigns the backing field through a private path and synchronizes, and no other code does
- an operation that needs the data does nothing while the data is unloaded, and dispatches no event

```typescript
public save = () => {
  if (!this.metadata) return;
  // ...
};
```

# 10) Synchronization Updates Derived State and Projections Only

The data's mutation path keeps two kinds of things in step with the data:

- **derived state** — a state whose value is computed from the data, such as `content`, which says whether there is a name
- **projections** — the parts of the composition that show the data, such as the label that shows the name

Policy:

- derived state is readonly: the outside never sets it, because only the component can compute it (see the state policy, Section 9)
- derived state has a public getter and a private setter: the outside reads it, and only the component sets it; the setter guards, mutates, reflects and dispatches as the state policy requires, and has no validator, because the component produces the value itself
- `private` is checked by the compiler only: at runtime the setter exists, and a caller in plain JavaScript can still assign the state; the specs therefore check it at compile time, with `@ts-expect-error` on an assignment from outside the component
- a projection writes to a cached element and allows for the cache being empty: the data can be assigned before the component is connected (see the composition policy, Section 5.1)
- synchronization never sets a state that the user or an operation chooses, such as `mode`: that state is set by operations, as an explicit step (Section 11)
- synchronization never writes to an editing surface while the user may be editing it (Section 14)

```typescript
private _updateLabel = () =>
  this.elements.metadata.label &&
  (this.elements.metadata.label.textContent =
    this.metadata?.name || this._localizer.lexicon.placeholder);

public get content(): Content {
  return this._content;
}
private set content(content: Content) {
  try {
    // Guard
    if (this._content === content) return;

    // Mutate
    this._content = content;
  } finally {
    // Reflect
    this._reflect(Attributes.CONTENT, this._content);
  }
}

private _syncContent = () =>
  (this.content = !this.metadata?.name ? Content.EMPTY : Content.NAME);
```

# 11) Operations Set the State the User Chooses

Some states are chosen by the user or by an operation, not computed from the data: the `mode` of a title is one. Data never sets such a state (Section 10). Instead, every operation that brings in, creates or accepts data decides what that state is afterwards, as an explicit step of its own.

Policy:

- an operation that creates data, or loads it, sets the chosen state the new data calls for
- an operation that only changes the data in place leaves the chosen state as it is
- an operation that finishes a workflow, such as saving, sets the chosen state the workflow ends in
- the step that sets the chosen state comes after the operation's own event (Section 15)

Applied to the `Title`:

| Operation | `mode` afterwards | Why |
|---|---|---|
| `create`, `reset` | `edit`, with the input focused | a new pathway has no name, so the user is asked for one straight away |
| `load`, with a name | `view` | the user opened an existing pathway; it also ends any edit of the previous one |
| `load`, without a name | `edit` | as for a new pathway |
| `update` | unchanged | it only accepts the typed name; the user is still editing |
| `save` | `view` | the edit is finished |
| `cancel`, with a saved name | `view` | back to the name it had |
| `cancel`, without a saved name | `edit`, the input cleared | there is nothing to go back to |

# 12) Operations Around Data Must Stay Thin

An operation that affects the data must not become a second mutation system.

Policy:

- an operation builds the next whole value and assigns it through the mutation path; it never changes a field of the stored value, which is frozen (Section 5)
- an operation does not validate data it passes to the setter: the setter validates it (see the operation policy, Section 7)
- an operation may call other operations, such as `save` calling `update`, or `reset` calling `create`
- an operation that replaces the data while the user is editing ends that edit, so that a value typed for the old data can never be accepted into the new one

Create builds a valid value:

```typescript
public create = () => {
  this.metadata = { id: crypto.randomUUID(), name: "", type: Type.PATHWAY };

  const detail = { metadata: this.metadata };
  this._dispatch(Event.ON_CREATE, detail);

  this.edit();
};
```

Load passes its parameter to the setter, which validates it:

```typescript
public load = (metadata: Metadata) => {
  this.metadata = metadata;

  const detail = { metadata: this.metadata };
  this._dispatch(Event.ON_LOAD, detail);

  this.metadata?.name ? this.view() : this.edit();
};
```

Update builds the next value from the stored one:

```typescript
public update = () => {
  if (!this.metadata) return;

  this.metadata = { ...this.metadata, name: this._readName() };

  const detail = { metadata: this.metadata };
  this._dispatch(Event.ON_UPDATE, detail);
};
```

# 13) The Data Life Cycle Must Survive Connection

A component can be given data before it is on the page, and it can be taken off the page and put back. Neither may lose its data.

Policy:

- data assigned before the component is connected is kept when it is connected
- a component that must hold data once it is on the page creates it on connect only when it has none, through its declared `create` operation
- a component that is removed and connected again keeps its data
- on connect, the component draws every projection of its data, because a projection made before connection had no element to draw on
- a component whose host is expected to load the data after connection says so in its documentation

```typescript
protected _initialize = () => {
  // ...
  this.metadata ? this._draw() : this.create();
};

private _draw = () => {
  this._updateLabel();
  this._syncName();
};
```

# 14) An Editing Surface Holds Tentative Values, Never Data

When the template lets the user edit the data, the editing control is a surface for a tentative value. It is never the data.

Policy:

- the data is the source of truth; the editing surface is not
- an operation that starts editing writes the data into the surface
- an operation that accepts the edit reads the surface and assigns the next whole value through the mutation path
- an operation that cancels the edit writes the data back into the surface
- while the user is editing, a derived state may follow the surface instead of the data, so that the component shows whether the tentative value could be accepted; accepting or cancelling the edit computes it from the data again
- an operation that accepts the edit does nothing, and dispatches no event, when the tentative value cannot be accepted: a rule that is only drawn by the stylesheet, such as a disabled save button, is not a rule

```typescript
public edit = () => {
  this._syncName();
  this._focusName();
  this.mode = Mode.EDIT;
};

public change = () => {
  this.content = !this._readName() ? Content.EMPTY : Content.NAME;
  this._dispatch(Event.ON_CHANGE);
};

public save = () => {
  if (!this.metadata || !this._readName()) return;

  this.update();

  const detail = { metadata: this.metadata };
  this._dispatch(Event.ON_SAVE, detail);

  this.mode = Mode.VIEW;
};

public cancel = () => {
  this._syncName();
  this._syncContent();
  this._dispatch(Event.ON_CANCEL);

  this.metadata?.name && (this.mode = Mode.VIEW);
};
```

# 15) Data Events Report Accepted Outcomes

Data events are dispatched by the operations that bring the data in, create it or change it. The event policy defines how an event is declared, subscribed to and dispatched; this section defines only what is particular to data.

Policy:

- a data event is dispatched only after the mutation path has accepted the value
- its `detail` carries the stored value, `{ metadata: this.metadata }`, never the operation's parameter: the parameter is not the copy the component owns
- when one operation calls another, events arrive in the order of the work: the inner operation's events first, then the outer operation's own event, then the events of any state the outer operation sets afterwards (Section 11)

Applied to the `Title`:

| Operation | Events, in order |
|---|---|
| `create` | `oncreate`, `onedit` |
| `load` | `onload`, then `onview` or `onedit` |
| `save` | `onupdate`, `onsave`, `onview` |
| `reset` | `oncreate`, `onedit`, `onreset` |

A state event appears only when the state actually changes.

# 16) Naming Must Be Predictably Transformed Across Layers

Policy:

- the specification defines the canonical data name, and it is the name everywhere
- a data name should not also name a composition part or a cache group; where it does, the shared name is a documented deviation

Transformation pattern:

| Layer | Example |
|---|---|
| Specification | `metadata` |
| Metadata vocabulary | `Datum.METADATA = "metadata"` |
| Metadata type | `type Metadata = { ... }` |
| Validation | `Validate.metadata(...)` |
| Component API | `get metadata()` / `set metadata(...)` |
| Event payload | `detail.metadata` |

---

# Policy Applied to Specification

Specification fragment:

```json
"Data": {
  "metadata": {
    "type": "Metadata",
    "description": "The metadata of the clinical pathway.",
    "properties": {
      "id": {
        "type": "Uuid",
        "description": "The unique identifier of the clinical pathway."
      },
      "name": {
        "type": "string",
        "description": "The name of the clinical pathway; empty until the user names it."
      },
      "type": {
        "type": "Type",
        "description": "The kind of map the title holds.",
        "values": ["pathway"]
      }
    },
    "default": null,
    "readonly": false
  }
}
```

How this specification is implemented:

- `metadata`
    - a structure, writable, that can be unloaded
    - declared in metadata as `Datum.METADATA`, with its type `Metadata`, the format `Uuid` and the value domain `Type`
    - validated by `Validate.metadata`, which checks every field and rejects undeclared ones
    - stored as a deep-frozen copy in `_metadata`, made with `structuredClone` and frozen with `_freeze`
    - `null` until it is created or loaded; the setter never accepts `null`
    - synchronizes the derived state `content` and the label; never `mode`
    - created on connect only when the title has none, and drawn on connect when it has
    - brought in by `create` and `load`, changed by `update`, accepted by `save`, and replaced by `reset`
    - reported by `oncreate`, `onload`, `onupdate` and `onsave`, each carrying the stored value

Implementation:

```typescript
// title.meta.ts
export const Datum = {
  METADATA: "metadata",
} as const;

export type Datum = (typeof Datum)[keyof typeof Datum];

export type Metadata = {
  id: Uuid;
  name: string;
  type: Type;
};

export type Data = Record<Datum, unknown>;

// title.ts
private _metadata: Metadata | null = null;

public get metadata(): Metadata | null {
  return this._metadata;
}
public set metadata(metadata: Metadata) {
  // Validate
  metadata = Validate.metadata(metadata);

  // Clone
  metadata = structuredClone(metadata);

  // Mutate
  this._metadata = this._freeze(metadata);

  // Synchronize
  this._updateLabel();
  this._syncContent();
}

protected _initialize = () => {
  // ...
  this.metadata ? this._draw() : this.create();
};
```

How the implementation applies the policy:

- the specification declares the data contract under `Data`, and its schema is checked with the other sections
- metadata declares the vocabulary, the type, the format and the value domain, and `Meta` includes `Data`
- the validator checks the whole structure, and every rejection carries the canonical message
- the component owns the data: callers and readers receive a frozen value they cannot change
- the outside can read that there is no data, but never assign it
- the setter synchronizes only what is derived from the data; operations choose the mode
- the data survives being assigned before connection, and being moved on the page
- the editing surface is tentative, and saving an empty name does nothing
- events carry the stored value, in the order of the work

---

# Policy Checklist

A compliant component must:

1. Declare all data under `Data` in the specification, each item with `type`, `description`, `default` and `readonly`, and each structure with `properties`.
2. Declare what the data is, never how it is shown: a placeholder is presentation, not a field's default.
3. Keep conditions computed from the data out of the data: declare them as states.
4. Give every data item a key in `Datum`, a type in metadata, a domain object for each field with values, and a pattern for each field with a format.
5. Export `Data` and include it in `Meta`, so that a declared data item without a getter fails the build.
6. Record, in the metadata tests, any data name that overrides one every HTML element already has.
7. Validate each data item in `<component>.validation.ts` with a validator that accepts `unknown`.
8. Check the whole structure: reject what is not a plain object, reject undeclared fields, and check every declared field by its kind.
9. Report a failing field as `Invalid {name} value: {field} is {problem}`, with `required`, `invalid` or `not declared`.
10. Store a deep-frozen copy of the validated value, made with `structuredClone` and frozen with `_freeze`, and hand out that stored value from the getter and in every event.
11. Keep data out of `Attributes`, attribute observation and reflection.
12. Give every data item a public getter, and a public setter only when it is writable.
13. Implement the mutation path as normalize → validate → clone → mutate → synchronize, with no guard and no dispatch.
14. Keep `null` out of every value accepted from outside; let only the component, or a declared operation, unload the data.
15. Make an operation that needs the data do nothing, and dispatch nothing, while the data is unloaded.
16. Keep derived state readonly, with a public getter and a private setter, and check the setter at compile time; synchronize projections with an allowance for an empty cache.
17. Never let the data set a state the user or an operation chooses; let each operation set it, as an explicit step after its own event.
18. Build the next whole value in every operation, and never change a field of the stored value.
19. End an edit when an operation replaces the data the user is editing.
20. Keep data assigned before connection; create data on connect only when there is none; draw every projection on connect.
21. Keep the editing surface tentative, and make an operation that accepts it do nothing when the tentative value cannot be accepted.
22. Dispatch data events from operations, after the value is accepted, with the stored value in `detail`, in the order of the work.
23. Keep the data name identical across specification, metadata, validation, component API and event payload, and avoid sharing it with a composition part.

---

# Component Data Specification Schema

JSON Schema:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://scalable.software/schema/component-data.schema.json",
  "title": "Component Data",
  "description": "Schema for the Data object in a component specification.",
  "type": "object",
  "propertyNames": {
    "type": "string",
    "pattern": "^[a-z][a-zA-Z0-9]*$",
    "description": "Canonical data name in lowerCamelCase, for example: metadata, document, selection."
  },
  "additionalProperties": {
    "type": "object",
    "description": "A data definition.",
    "required": ["type", "description", "default", "readonly"],
    "additionalProperties": false,
    "properties": {
      "type": {
        "type": "string",
        "pattern": "^[A-Z][a-zA-Z0-9]*$",
        "description": "PascalCase name of the data's type in metadata, for example: Metadata, Document."
      },
      "description": {
        "type": "string",
        "minLength": 1,
        "description": "What the data is, in the words of the business."
      },
      "properties": {
        "$ref": "#/$defs/fields"
      },
      "default": {
        "description": "The value before any is created or loaded. null means the data can be unloaded."
      },
      "readonly": {
        "type": "boolean",
        "description": "Whether the data is externally writable. If true, the data is externally readable but internally owned."
      }
    }
  },
  "$defs": {
    "fields": {
      "type": "object",
      "description": "The declared fields of a structure.",
      "minProperties": 1,
      "propertyNames": {
        "type": "string",
        "pattern": "^[a-z][a-zA-Z0-9]*$",
        "description": "Canonical field name in lowerCamelCase, for example: id, name, type."
      },
      "additionalProperties": {
        "$ref": "#/$defs/field"
      }
    },
    "field": {
      "type": "object",
      "description": "A field of a structure, or the item of a list.",
      "required": ["type", "description"],
      "additionalProperties": false,
      "properties": {
        "type": {
          "type": "string",
          "minLength": 1,
          "description": "string, number, boolean, array, or the PascalCase name of a value domain, a format or a structure in metadata, for example: Uuid, Type."
        },
        "description": {
          "type": "string",
          "minLength": 1,
          "description": "What the field is."
        },
        "values": {
          "type": "array",
          "minItems": 1,
          "description": "The allowed values of a field with a value domain."
        },
        "properties": {
          "$ref": "#/$defs/fields"
        },
        "items": {
          "$ref": "#/$defs/field"
        }
      }
    }
  }
}
```

Example JSON:

```json
{
  "Data": {
    "metadata": {
      "type": "Metadata",
      "description": "The metadata of the clinical pathway.",
      "properties": {
        "id": {
          "type": "Uuid",
          "description": "The unique identifier of the clinical pathway."
        },
        "name": {
          "type": "string",
          "description": "The name of the clinical pathway; empty until the user names it."
        },
        "type": {
          "type": "Type",
          "description": "The kind of map the title holds.",
          "values": ["pathway"]
        }
      },
      "default": null,
      "readonly": false
    }
  }
}
```
