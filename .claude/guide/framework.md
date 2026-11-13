# The Component Framework — A Guide

This guide explains how components in this framework work and why they are built the way
they are. It is written for a developer who is new to the framework. The policies in
`.claude/context/` are the rules; this guide is the explanation behind them.

Every example comes from the `pin` component (`<pin-button>`), the reference
implementation of the framework.

---

## State

### What state is

A state is a **named condition of a component that has a fixed set of possible values**.

The pin has two:

| State | Possible values | Starts as |
|---|---|---|
| `visibility` | `visible`, `hidden` | `visible` |
| `status` | `pinned`, `unpinned` | `unpinned` |

At any moment each state has exactly one of its values. Together they answer the question
"what condition is this component in right now?"

State is not the same as data. State is a *condition* chosen from a short list (`pinned` or
`unpinned`). Data is *content* the component holds, such as a name or a record. If you can
list every possible value up front, it is state.

### One source of truth

Each state is stored in one place: a private field on the component.

```typescript
private _visibility: Visibility = Visibility.VISIBLE;
private _status: Status = Status.UNPINNED;
```

Everything else is derived from that field. The getter returns it. The attribute on the
element shows it. The events report changes to it. Nothing else is allowed to disagree with
it, and most of the rules below exist to keep that true.

### Where a state is written down

A state appears in four files. Each file has one job.

| File | Job | For `status` |
|---|---|---|
| `pin.specifications.json` | Declares that the state exists, and its flavour | `"status": { "values": ["pinned", "unpinned"], "default": "unpinned", ... }` |
| `pin.meta.ts` | Names the state and lists its values | `Status.PINNED`, `Status.UNPINNED` |
| `pin.validation.ts` | Rejects any value not on the list | `Validate.status(value)` |
| `pin.ts` | Holds the value and changes it | `_status`, `get status()`, `set status()` |

The values are never typed as loose strings in the component. You write `Status.PINNED`,
not `"pinned"`, so a typo is caught by the compiler and the list of values lives in one
place.

### The flavours of state

Two questions decide which flavour a state is. You answer them in the specification, and
the answers decide what code you write.

**Question 1: Does the state show on the element as an attribute?**

An attribute is what you see in the HTML: `<pin-button status="pinned">`. A state that
shows there is *attribute-backed*. It can be set in markup, and CSS can style the component
by it:

```css
:host([status="pinned"]) .pinned {
  display: inline-block;
}
```

A state that does not show on the element is *non-attribute* state. It exists only in
JavaScript.

Make a state attribute-backed when markup needs to set it or CSS needs to react to it.
Otherwise keep it off the element.

If the state is attribute-backed, there is a follow-up question: **is the attribute always
there?**

- **Compulsory** — the attribute is always present and always shows the current value.
  `status` is compulsory: a connected pin always has `status="pinned"` or
  `status="unpinned"`. Choose this when every value matters to the styling.
- **Optional** — the attribute is absent while the state has its default value, and present
  otherwise. `visibility` is optional: a visible pin has no `visibility` attribute at all,
  and a hidden pin has `visibility="hidden"`. Choose this when the default is the
  unremarkable case and should leave the markup clean.

**Question 2: May code outside the component set its value directly?**

- **Writable** — yes. The state has a public setter: `pin.status = Status.PINNED`.
- **Readonly** — no. The state can be read from outside, but only the component itself
  sets it. Readonly does not mean the value never changes; it means the outside cannot
  choose the value. The component may still offer an operation that leads to a change.

Put together:

| Flavour | In the specification | Example |
|---|---|---|
| Attribute-backed, optional, writable | `"attribute": { "optional": true }`, `"readonly": false` | `visibility` |
| Attribute-backed, compulsory, writable | `"attribute": { "optional": false }`, `"readonly": false` | `status` |
| Non-attribute, writable | no `attribute`, `"readonly": false` | a `locked` flag |
| Non-attribute, readonly | no `attribute`, `"readonly": true` | a `persisted` timestamp |
| Attribute-backed, readonly | `attribute` present, `"readonly": true` | a value the component generates and shows |

The pin uses only the first two. The other three are described in the state policy, but no
code in this repository exercises them yet.

### The ways to change a state

A writable, attribute-backed state can be changed from the outside in three ways.

**Through the property**, in JavaScript:

```typescript
pin.status = Status.PINNED;
```

**Through the attribute**, in markup or with `setAttribute`:

```html
<pin-button status="pinned"></pin-button>
```

**Through an operation**, a method the component offers for a specific change:

```typescript
pin.pin();      // status becomes pinned
pin.unpin();    // status becomes unpinned
pin.toggle();   // status becomes the other value
```

The first two name the new value. An operation names an *intent*, and the component decides
what value that means: `toggle()` reads the current status and picks the opposite.

A user can also change a state without any code, through a gesture. Clicking the pin's icon
calls `toggle()`, so a gesture is an operation started by the user.

The framework sends all of them through the same code. An operation assigns to the state:

```typescript
public pin = () => (this.status = Status.PINNED);
public toggle = () =>
  (this.status =
    this.status === Status.PINNED ? Status.UNPINNED : Status.PINNED);
```

When an attribute changes, the browser calls the component, and the component hands the new
value to the setter:

```typescript
protected _attributeHandlers = {
  [Attributes.VISIBILITY]: (value: Visibility | null) => (this.visibility = value),
  [Attributes.STATUS]: (value: Status) => (this.status = value)
};
```

```text
pin.status = "pinned"  ───────────────┐
                                      │
setAttribute("status", "pinned")  ────┼──▶  set status(...)
                                      │
pin.pin()  ◀── click on the icon  ────┘
```

This is the most important idea in the state design: **the setter is the only place a
state changes.** The attribute handlers contain no rules, and neither do the operations;
they only pass a value on. So every rule about changing a state is written once, in its
setter.

Which of the three ways exist depends on the flavour:

| Flavour | Property | Attribute | Operation |
|---|---|---|---|
| Attribute-backed, writable | yes | yes | if the component offers one |
| Non-attribute, writable | yes | no | if the component offers one |
| Readonly | no | no | if the component offers one |

For a readonly state, an operation is the only way the outside can cause a change. The
outside still cannot choose the value; it asks, and the component decides.

### What the setter does

Every setter follows the same six steps, in the same order.

```typescript
public set status(status: Status) {
  try {
    status = Validate.status(status);         // 2. Validate

    if (this._status === status) return;      // 3. Guard

    this._status = status;                    // 4. Mutate
  } finally {
    this._reflect(Attributes.STATUS, this._status);   // 5. Reflect
  }

  const detail = { status };                                         // 6. Dispatch
  status === Status.PINNED && this._dispatch(Event.ON_PIN, detail);
  status === Status.UNPINNED && this._dispatch(Event.ON_UNPIN, detail);
}
```

1. **Normalize** — turn an input that means "the default" into the default. `status` has
   no such input, so it skips this step. `visibility` has one; see below.
2. **Validate** — reject any value that is not on the list. `Validate.status` throws an
   error for a bad value and returns the value otherwise.
3. **Guard** — if the state already has this value, stop. Nothing changed, so nothing else
   should happen.
4. **Mutate** — store the new value in the private field. This is the moment the state
   changes.
5. **Reflect** — make the attribute show the state.
6. **Dispatch** — announce the change by sending an event. This step only runs when the
   state really changed. Events are covered in their own section of this guide.

### Why Reflect sits in `finally`

Steps 1 to 4 are inside `try`. Step 5 is inside `finally`, which means **it always runs**:
when the value was accepted, when the guard stopped it, and when validation threw an error.

The reason is the attribute path. When someone writes `status="bogus"` on the element, the
DOM has *already changed* by the time the setter is called. The setter rejects the value,
so the state stays `unpinned`, but the element now says `bogus`. The attribute and the
state disagree, and the CSS that depends on the attribute shows the wrong thing.

Because Reflect always runs, the setter puts the attribute back:

```text
setAttribute("status", "bogus")
  → setter validates, rejects, state stays "unpinned"
  → finally: attribute is restored to "unpinned"
```

Two details in that `finally` line matter:

- It passes `this._status`, the private field, **not** the `status` parameter. After a
  rejected value the parameter still holds `"bogus"`. The field holds the truth.
- Step 6, Dispatch, comes **after** the `finally` block. A rejected value and a guarded
  value both leave the setter through `finally` and never reach it, so no event is sent for
  a change that did not happen.

### What `_reflect` does

`_reflect` comes from the base component. It makes one attribute show one state:

```typescript
this._reflect(Attributes.STATUS, this._status);
this._reflect(Attributes.VISIBILITY, this._visibility, Visibility.VISIBLE);
```

The third argument is the difference between compulsory and optional:

- **Without it** (compulsory): the attribute is set to the state's value.
- **With it** (optional): if the state equals that value, the attribute is removed;
  otherwise the attribute is set to the state's value.

`_reflect` only writes when the attribute differs from the state. This is not just tidy.
Writing an attribute, even with the value it already has, makes the browser call the
component again, which calls the setter again. A write that always happened would go round
in a circle. Never call `setAttribute` or `removeAttribute` for a state yourself; always go
through `_reflect`.

### The optional flavour: `visibility`

The `visibility` setter has the same six steps, with two differences.

```typescript
public set visibility(visibility: Visibility | null) {
  try {
    visibility = visibility ?? Visibility.VISIBLE;      // 1. Normalize

    visibility = Validate.visibility(visibility);

    if (this._visibility === visibility) return;

    this._visibility = visibility;
  } finally {
    this._reflect(
      Attributes.VISIBILITY,
      this._visibility,
      Visibility.VISIBLE                                // absent when visible
    );
  }

  const detail = { visibility };
  visibility === Visibility.HIDDEN && this._dispatch(Event.ON_HIDE, detail);
  visibility === Visibility.VISIBLE && this._dispatch(Event.ON_SHOW, detail);
}
```

**It normalizes.** When an attribute is removed, the browser tells the component the new
value is `null`. For an optional state, "no attribute" means "the default", so the setter
turns `null` into `Visibility.VISIBLE` before validating. It uses `??`, which only replaces
`null` and `undefined`. Any other bad value still reaches validation and is rejected.

**It passes the default to `_reflect`.** That is what makes the attribute disappear when
the pin is visible.

A compulsory state does neither. For `status`, a missing attribute is not a valid request,
so `null` goes to validation and is rejected like any other bad value.

### What happens with a value that is not allowed

The state never changes to a bad value. What differs is how you find out.

| How the bad value arrived | State | Attribute | How the error surfaces |
|---|---|---|---|
| `pin.status = "bogus"` | unchanged | unchanged | thrown to your code; you can `catch` it |
| `setAttribute("status", "bogus")` | unchanged | restored | reported by the browser as an uncaught error |
| `removeAttribute("status")` (compulsory) | unchanged | restored | reported by the browser as an uncaught error |
| `removeAttribute("visibility")` (optional) | becomes the default | absent | no error; this is a valid request |

The second and third rows cannot throw to the code that changed the attribute. That is how
browsers treat custom elements, not a choice of this framework. In a test, a reported error
fails the spec unless the test catches it with `jasmine.spyOnGlobalErrorsAsync`; the
testing policy shows the pattern.

### How a state starts

A state's starting value is the initial value of its private field.

For an **optional** state there is nothing more to do: the default is shown by the
attribute being absent.

For a **compulsory** state the attribute has to be put in place. The browser does not allow
a component to add attributes to itself while it is being created, so this happens when the
component is connected to the page:

```typescript
protected _initialize = () => {
  this._reflect(Attributes.STATUS, this._status);
};
```

When the markup already carries the attribute, as in `<pin-button status="pinned">`, the
browser passes it to the setter *before* the component is connected. By the time
`_initialize` runs, the state is already `pinned`, the attribute already shows it, and
`_reflect` writes nothing.

One consequence is worth remembering: **a setter can run before the component is
connected.** At that point the component's cached elements do not exist yet, so a setter
must not depend on them.

### How state connects to the rest of a component

- **Styling** reads state through attribute selectors, as in
  `:host([visibility="hidden"]) { display: none; }`. The component never sets styles from
  JavaScript to show a state; it reflects the attribute and CSS does the rest.
- **Operations** change state by assigning to it. `pin.hide()` is
  `this.visibility = Visibility.HIDDEN` and nothing more.
- **Events** are sent by the setter, after a real change. This is why calling `pin.pin()`
  twice sends `onpin` once: the second call stops at the guard.
- **Gestures** call operations. A click calls `toggle()`, which assigns to `status`.

So a click, a method call, a property assignment and an attribute change all end in the
same setter, and behave identically from there.

### Mistakes to avoid

- **Calling `setAttribute` or `removeAttribute` for a state.** Use `_reflect`.
- **Passing the parameter to `_reflect`.** Pass the private field.
- **Dispatching an event inside the `try` block.** Dispatch after `finally`.
- **Putting logic in an attribute handler or an operation.** It belongs in the setter.
- **Validating in an operation.** The setter already validates.
- **Typing a value as a string.** Use the constant from `pin.meta.ts`.
- **Leaving out the guard.** Without it, setting a state to the value it already has would
  send a second event.

### Where the rules are

| Topic | Policy |
|---|---|
| The rules for state, with every flavour | `.claude/context/state.md` |
| How validators are written | `.claude/context/validation.md` |
| Which tests a state needs | `.claude/context/testing.md` |
| How events follow from state changes | `.claude/context/event.md` |
| The pin's own state | `specifications/pin.specifications.json`, `src/pin.ts` |
