# The Component Framework — A Guide

This guide explains how components in this framework work and why they are built the way
they are. It is written for a developer who is new to the framework. The policies in
`.claude/policies/` are the rules; this guide is the explanation behind them.

The examples come from the `pin` component (`<pin-button>`), the reference implementation
of the framework. Where the pin has no example of something, the guide says so and uses an
illustration instead.

---

## Composition

### What composition is

Composition is **what a component is made of**: its parts, and how they sit inside each
other.

The pin is made of four parts:

```text
template
└── div.icon
    ├── svg.unpinned
    └── svg.pinned
```

| Part | What it is |
|---|---|
| `template` | the container that holds the pin's markup |
| `div.icon` | the area the user clicks |
| `svg.unpinned` | the picture shown when the pin is not pinned |
| `svg.pinned` | the picture shown when the pin is pinned |

Composition says what exists. It says nothing about how a part looks, what condition the
component is in, or what happens on a click. Those belong to the stylesheet, to state and
to gestures.

### How a part is named

A part is named the way CSS would select it: its element type, a dot, its class. So
`div.icon` is a `div` with the class `icon`. The name is the same in the specification, in
the template and in the stylesheet, so you can follow a part from one file to the next.

### Where composition is written down

| File | Job | For the icon |
|---|---|---|
| `pin.specifications.json` | Declares the parts and their nesting | `"div.icon": { "contains": [...] }` |
| `pin.template.html` | Builds them | `<div class="icon" ...>` |
| `pin.style.css` | Styles them | `.icon { ... }` |
| `pin.ts` | Keeps a reference to the ones it needs | `this.elements.icon` |

### The template builds the structure

The markup lives in its own file:

```html
<template id="pin-button">
  <div class="icon" tabindex="0" role="button">
    <svg class="unpinned">...</svg>
    <svg class="pinned">...</svg>
  </div>
</template>
```

The component never builds these elements in code. It copies the template into itself when
it is created, and that is the only way its structure comes into being. If the structure
must change, the template changes.

One thing is asked of whoever uses the component: load the template before defining the
component, because a component created without its template has nothing to copy.

```typescript
await Pin.Template.load("pin.template.html");
customElements.define(Pin.Tag, Pin);
```

### What the specification says about a part, and what it leaves out

```json
"div.icon": {
  "description": "The main container of the pin component.",
  "type": "div",
  "class": "icon",
  "cached": true,
  "attributes": { "tabindex": "0", "role": "button" },
  "contains": ["svg.unpinned", "svg.pinned"]
}
```

It declares what the part is, what is inside it, and any attribute that carries meaning.
It leaves out everything about appearance.

To decide whether an attribute belongs in the specification, ask one question: **would the
component behave differently, or become harder to use, if the attribute were removed?**

| Attribute | If it were removed | In the specification? |
|---|---|---|
| `tabindex`, `role` on the icon | the keyboard could no longer reach it | yes |
| `height`, `width`, `fill` on a picture | it would only look different | no |

### Both pictures are always there

The template contains both pictures, pinned and unpinned, at all times. Nothing is added
or removed when the pin is toggled. The stylesheet decides which one is visible, by
looking at the `status` attribute:

```css
:host([status="pinned"]) .pinned {
  display: inline-block;
}
:host([status="pinned"]) .unpinned {
  display: none;
}
```

This is the general pattern. Composition provides every part the component could ever
show. State says which condition applies. The stylesheet turns the condition into what is
visible. The component's code never shows or hides a part itself.

### Keeping a reference to a part

The component needs to reach some parts from its code, for instance to listen for a click
on the icon. A part marked `"cached": true` in the specification gets a reference:

```typescript
protected elements: { icon: HTMLDivElement | null } = { icon: null };

protected _cache = () => {
  this.elements.icon = this.root.querySelector(".icon");
};
```

Only the parts the code actually uses are cached. The two pictures are not: the stylesheet
handles them and the code never touches them.

The reference is named after the part's class: `div.icon` becomes `elements.icon`.

### A reference is empty until the component is on the page

`_cache` runs when the component is added to the page. Until then, every reference is
`null`. That is why the type says `HTMLDivElement | null`, and why the code writes
`this.elements.icon?.addEventListener(...)` with a question mark.

This matters more than it looks. A setter can run before the component is on the page, for
example when an attribute is already present in the markup. So a setter must never depend
on a cached reference.

### Changing a part changes the contract

Because the same name runs through four files, renaming or removing a part is never a
one-line change. Renaming `div.icon` means changing the specification, the template, the
stylesheet, the cache and every gesture that names it as its target. Treat a part's name
like the name of a state or an operation: other things depend on it.

### Mistakes to avoid

- **Building elements in the component's code.** The template builds the structure.
- **Showing or hiding a part from code.** Reflect the state and let the stylesheet decide.
- **Putting sizes or colours in the specification.** They belong to the template or the
  stylesheet.
- **Leaving out an attribute the component depends on.** `tabindex` and `role` are part of
  the contract.
- **Using a cached reference in a setter.** It may still be `null`.
- **Caching a part the code never uses.** Cache only what is needed.
- **Looking a part up with `querySelector` wherever it is needed.** Look it up once, in
  `_cache`.

### Where the rules are

| Topic | Policy |
|---|---|
| The rules for composition | `.claude/policies/composition.md` |
| How a gesture names its target | `.claude/policies/gesture.md` |
| Which tests composition needs | `.claude/workflow/testing.md`, Section 8 |
| The pin's composition | `specifications/pin.specifications.json`, `src/pin.template.html` |

---


## State

### What state is

A state is a **named condition of a component that has a fixed set of possible values**.

The pin has three:

| State | Possible values | Starts as |
|---|---|---|
| `visibility` | `visible`, `hidden` | `visible` |
| `status` | `pinned`, `unpinned` | `unpinned` |
| `appearance` | `floating`, `flat` | `floating` |

This section uses `visibility` and `status` as its examples. `appearance` is the simplest
of the three: it changes how the pin looks and nothing else, so it has no operation and no
event.

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
public pin = () => {
  this.status = Status.PINNED;
};
public toggle = () => {
  this.status =
    this.status === Status.PINNED ? Status.UNPINNED : Status.PINNED;
};
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
- **Validating in an operation a value that goes on to a setter.** The setter already
  validates it.
- **Typing a value as a string.** Use the constant from `pin.meta.ts`.
- **Leaving out the guard.** Without it, setting a state to the value it already has would
  send a second event.

### Where the rules are

| Topic | Policy |
|---|---|
| The rules for state, with every flavour | `.claude/policies/state.md` |
| How validators are written | `.claude/policies/validation.md` |
| Which tests a state needs | `.claude/workflow/testing.md` |
| How events follow from state changes | `.claude/policies/event.md` |
| The pin's own state | `specifications/pin.specifications.json`, `src/pin.ts` |

---

## Validation

### What validation is

Validation is **checking a value that comes in from outside before the component accepts
it**.

A component cannot trust what it is given. Markup can contain a typo
(`status="pined"`), and other code can pass anything at all. Validation is the gate: a
value that passes is safe to use everywhere inside the component, and a value that fails
never gets in.

### What is validated, and what is not

One rule decides it:

> **Check what comes in from outside. Trust what the component makes itself.**

| Value | Comes from | Validated? |
|---|---|---|
| `pin.status = "pinned"` | outside, through the property | yes |
| `<pin-button status="pinned">` | outside, through the attribute | yes |
| A parameter passed to an operation | outside | yes, once (see below) |
| A UUID the component generates | the component | no |
| A state only the component sets | the component | no |

The pin has three values that come in from outside, `visibility`, `status` and `appearance`,
so it has three validators.

### Where a validator lives

All validators of a component sit in one file, as static functions of one class named
`Validate`.

| File | Job |
|---|---|
| `pin.meta.ts` | Says what is allowed: the list of values, the limits, the pattern |
| `pin.validation.ts` | Checks a value against what is allowed |
| `pin.ts` | Calls the validator at the right moment |

A validator never contains its own list of allowed values. It reads them from the metadata
file, so when a value is added there, validation follows without being touched.

### What a validator looks like

Every validator has the same three lines: a check, a throw, and a return.

```typescript
public static status = (value: unknown) => {
  const valid = Object.values(Status).includes(value as Status);   // check
  if (!valid) throw new Error(`Invalid status value: ${value}`);    // throw
  return value as Status;                                           // return
};
```

- **It accepts `unknown`.** The value could be a string, `null`, a number, anything. The
  type says so honestly, which forces the validator to check before it believes.
- **It throws on a bad value.** It never quietly replaces a bad value with a good one. A
  silent replacement would hide the mistake from the person who made it.
- **It returns the value with its proper type.** What goes in is `unknown`; what comes out
  is a `Status`. The setter continues with the returned value, so everything after
  validation works with a value that is known to be good.
- **It is pure.** It looks only at the value it is given, never at the component. That
  makes it trivial to test: call it with a value and see what comes back.

### The kinds of check

Only the check line differs from one validator to the next. There are four kinds.

| Kind | The check asks | Example |
|---|---|---|
| Enum | Is the value on the list? | `status` is `pinned` or `unpinned` |
| Format | Does the value have the right shape? | an id is a UUID |
| Range | Does the value lie between the limits? | a zoom level from 0.5 to 4 |
| Structure | Does every field pass its own check? | an object with an id and a name |

The pin only has enums. The next two examples are illustrations of the other kinds, not
code from the pin.

A format check, with the pattern kept in the metadata file as `Uuid.PATTERN`:

```typescript
public static id = (value: unknown) => {
  const valid = typeof value === "string" && Uuid.PATTERN.test(value);
  if (!valid) throw new Error(`Invalid id value: ${value}`);
  return value as Id;
};
```

A range check, with the limits kept in the metadata file as `Zoom.MIN` and `Zoom.MAX`:

```typescript
public static zoom = (value: unknown) => {
  const valid =
    typeof value === "number" && value >= Zoom.MIN && value <= Zoom.MAX;
  if (!valid) throw new Error(`Invalid zoom value: ${value}`);
  return value as Zoom;
};
```

Both first check the type of the value (`typeof`) and then its shape or its limits. The
type check comes first because the second check only makes sense for the right type.

### Where validation happens

A value is validated **once, at the first place it lands**. There are two such places.

**In a setter.** This is step 2 of the six steps in the State section. Every value that
reaches a writable state passes through it, whether it came from the property, the
attribute or an operation.

**In an operation, when the operation uses a parameter itself.** If an operation takes a
value and works with it directly, nothing else will check that value, so the operation
does.

An operation that passes its parameter to a setter does *not* validate. The setter will,
and checking the same value twice is wasted work and two places to keep in step.

| What an operation does with a parameter | Who validates |
|---|---|
| Passes it to a setter | the setter |
| Uses it itself, with no setter in between | the operation, before first use |
| Has no parameter | nobody; nothing came in |

The pin's operations are all in the last row. `pin.pin()` takes nothing; it assigns
`Status.PINNED` to the state, and the setter validates as it always does. So the pin has no
example of an operation that validates.

Attribute handlers and gesture handlers never validate. They only pass a value on.

### What a rejected value looks like

The error message always has the same form:

```text
Invalid {name} value: {value}
```

For example `Invalid status value: pined`. The name is the name of the state, and the value
is exactly what was received, so the message tells you what to fix.

An object cannot be printed as one value, so when one field of a structure fails, the
message names the field and its problem instead: `Invalid metadata value: id is required`.

How the error reaches you depends on how the value came in. A bad value assigned to a
property is thrown to your code. A bad value written to an attribute is reported by the
browser. The table in the State section, under "What happens with a value that is not
allowed", shows each case.

### Two things that surprise people

- **Matching is exact.** `status="PINNED"` and `status=" pinned"` are rejected. The value
  must be exactly one of the listed values.
- **An attribute is always a string.** `zoom="2"` arrives as the string `"2"`, and the
  range check above rejects a string. A state that is not a string must convert the value
  in its Normalize step, before validation. Validation checks; it does not convert.

### Mistakes to avoid

- **Listing allowed values inside the validator.** They belong in the metadata file.
- **Returning a fallback instead of throwing.** A bad value must be reported, not hidden.
- **Ignoring the returned value.** Continue with what the validator returns.
- **Validating the same value twice.** If it goes to a setter, the setter checks it.
- **Reading the component inside a validator.** A validator sees only its arguments.
- **Validating a value the component made itself.** There is nothing to distrust.

### Where the rules are

| Topic | Policy |
|---|---|
| The rules for validators | `.claude/policies/validation.md` |
| Where validation sits in a setter | `.claude/policies/state.md`, Section 7 |
| Which tests a validator needs | `.claude/workflow/testing.md`, Section 6 |
| The pin's validators | `src/pin.validation.ts` |

---

## Operations

### What an operation is

An operation is **a named action the component offers to the outside**.

The pin offers five:

| Operation | What it does |
|---|---|
| `pin.hide()` | hides the pin |
| `pin.show()` | shows the pin |
| `pin.pin()` | pins it |
| `pin.unpin()` | unpins it |
| `pin.toggle()` | switches between pinned and unpinned |

Like a state, an operation is declared in the specification, named in the metadata file,
and written in the component.

### Why operations exist when you can set a state

`pin.pin()` and `pin.status = Status.PINNED` end in the same place. So why have both?

- **An operation says what you want, not which value to set.** The caller does not need to
  know that pinning is stored as a state called `status` with the value `pinned`.
- **An operation can decide the value for you.** `toggle()` looks at the current status and
  picks the other one. A property assignment cannot do that.
- **An operation can do several things as one action.** Saving something may update data,
  send an event and change a mode. The caller asks once.
- **Gestures reuse them.** A click on the pin's icon calls `toggle()`, so a user and a
  program go through the same code.

### The two types of operation

One question sorts every operation: **is its body a single assignment to a setter?**

| | Pass-through | Rich |
|---|---|---|
| Body | one assignment to one setter | anything more |
| Validates | never; the setter does | only a parameter it uses itself |
| Sends events | none of its own; the setter sends them | may send its own |
| Returns | nothing | what the specification declares |

The type tells you what the operation is allowed to do, so decide it before you write the
body.

### Pass-through operations

All five of the pin's operations are pass-throughs.

```typescript
public hide = () => {
  this.visibility = Visibility.HIDDEN;
};

public pin = () => {
  this.status = Status.PINNED;
};

public toggle = () => {
  this.status =
    this.status === Status.PINNED ? Status.UNPINNED : Status.PINNED;
};
```

Notice what is *not* there. No validation, no check whether anything changed, no attribute
update, no event. The setter does all of that, as the six steps in the State section
describe. A pass-through only hands a value on.

`toggle` first works out which value to assign, but it is still one assignment, so it is
still a pass-through.

Because the setter's guard stops a value that is already set, a pass-through is safe to
call twice. The second `pin.pin()` changes nothing and sends no second event.

### Rich operations

A rich operation does more than one assignment. The pin has none, so these examples come
from the `Title` component, a component that holds a name the user can edit.

Several steps, and an event of its own:

```typescript
public save = () => {
  if (!this.metadata) return;

  this.update();

  const detail = { metadata: this.metadata };
  this._dispatch(Event.ON_SAVE, detail);

  this.mode = Mode.VIEW;
};
```

A parameter that is passed on to a setter:

```typescript
public load = (metadata: Metadata) => {
  this.metadata = metadata;

  const detail = { metadata: this.metadata };
  this._dispatch(Event.ON_LOAD, detail);
};
```

`load` does not validate `metadata`. It assigns it to the setter, and the setter validates,
so checking it here would check it twice. An operation validates a parameter only when it
uses that parameter itself, with no setter in between. Neither component has such an
operation yet.

A rich operation may:

- take several steps and call other operations (`save` calls `update`)
- send an event of its own, when the event is about the action and not about one state
- return a value, when the specification says so

A rich operation may not go around a setter. It changes a state or data by assigning to
it, never by writing the private field, so the setter's rules still apply.

### What an operation returns

An operation returns what its specification declares, and nothing else. For every
pass-through that is nothing: the specification says `"returns": "void"`.

This is why operations have a block body, with braces. A one-line version would look
neater but would quietly return the value it assigns:

```typescript
public hide = () => (this.visibility = Visibility.HIDDEN);   // returns "hidden"
```

A returned value is part of the component's public face. Someone can start using it, and
then it can never be taken away without breaking their code.

### Why an operation is an arrow function

Operations are written as `public hide = () => { ... }`, not as an ordinary method. An
arrow function remembers which component it belongs to, so it still works when it is
handed to someone else:

```typescript
button.addEventListener("click", pin.toggle);   // works; an ordinary method would not
```

### How the component is held to its list

The metadata file names the operations:

```typescript
export const Operation = {
  HIDE: "hide",
  SHOW: "show",
  PIN: "pin",
  UNPIN: "unpin",
  TOGGLE: "toggle"
} as const;
```

Nothing would stop the class from forgetting one of them, or misspelling it. So the
metadata file also exports a type that says "a component with these names", and the class
promises to match it:

```typescript
// pin.meta.ts
export type States = Record<State, unknown>;
export type Operations = Record<Operation, (...parameters: any[]) => unknown>;
export type Events = Record<Event, EventListener | null>;

export type Meta = States & Operations & Events;

// pin.ts
import { type Meta } from "./pin.meta.js";

export class Pin extends Component implements Meta {
```

If the class is missing a name from the metadata, the code does not build, and the message
says which one:

```text
Property 'unpin' is missing in type 'Pin' but required in type 'Operations'.
```

`Meta` covers states and events the same way: every state must have its getter, and every
event its `on…` property.

The check runs in one direction. The class must have everything the metadata names; it may
have more. And it only proves that a member exists. Whether `unpin` really unpins is still
for the tests to show.

### Mistakes to avoid

- **Writing an operation on one line without braces.** It returns the assigned value.
- **Checking or validating in a pass-through.** The setter does it.
- **Sending a state's event from an operation.** The setter sends it, once, after a real
  change.
- **Writing the private field from an operation.** Assign to the state, so its rules run.
- **Repeating an operation's logic in a gesture handler.** The handler calls the operation.
- **Adding an operation to the class but not to the specification and the metadata.** It
  builds, but it is undeclared.

### Where the rules are

| Topic | Policy |
|---|---|
| The rules for operations | `.claude/policies/operation.md` |
| When an operation validates | `.claude/policies/validation.md`, Section 10 |
| Which tests an operation needs | `.claude/workflow/testing.md`, Section 10 |
| The pin's operations | `src/pin.ts` |

---

## Events

### What an event is

An event is **the component telling the outside that something happened**.

The pin sends four:

| Event | Sent when | Detail |
|---|---|---|
| `onhide` | the pin becomes hidden | `{ visibility: "hidden" }` |
| `onshow` | the pin becomes visible | `{ visibility: "visible" }` |
| `onpin` | the pin becomes pinned | `{ status: "pinned" }` |
| `onunpin` | the pin becomes unpinned | `{ status: "unpinned" }` |

An event reports an outcome, not an action. `onpin` does not mean "someone clicked"; it
means "the pin is now pinned", however that came about.

### Why events exist

The pin does not know what pinning is for. It only knows it was pinned. The application
around it decides what that means, for example keeping a panel open. Events are how the
component hands that moment over without knowing who is listening.

This keeps the two sides apart. The component never calls into the application, and the
application never reaches into the component to watch its state.

### Listening to an event

There are two ways.

**Through the property**, for one handler:

```typescript
pin.onpin = (event) => console.log(event.detail.status);
```

**Through `addEventListener`**, for as many as you like:

```typescript
pin.addEventListener("onpin", (event) => console.log(event.detail.status));
```

Note the name in the second form. The event is called `onpin`, with the `on`. Listening
for `"pin"` hears nothing.

### The `on…` property holds one handler

Assigning a handler replaces the one that was there. Assigning `null` removes it.

```typescript
pin.onpin = first;
pin.onpin = second;   // first is gone; only second is called
pin.onpin = null;     // nothing is called
```

The property is write-only. You can assign to it, but reading `pin.onpin` does not give
the handler back.

### What a handler receives

The handler receives the event, and the event carries a `detail` object describing what
happened. The specification declares what each event's detail contains.

```typescript
pin.onpin = (event) => {
  event.detail.status;   // "pinned"
};
```

Read the detail, not the component. If an earlier handler has already reacted, by
unpinning again for instance, `pin.status` may have moved on by the time your handler
runs. The detail still says what this event was about.

### When an event is sent

Sending the event is the sixth step of the setter, Dispatch, from the State section:

```typescript
  // Dispatch
  const detail = { status };
  status === Status.PINNED && this._dispatch(Event.ON_PIN, detail);
  status === Status.UNPINNED && this._dispatch(Event.ON_UNPIN, detail);
```

It comes last, after the state has changed and the attribute shows it. So a handler always
sees the component in its new condition.

An event is only sent for a real change:

| What happened | Event sent? |
|---|---|
| The state changed to a new value | yes |
| The state was set to the value it already had | no |
| The value was rejected | no |

This is why `pin.pin()` called twice sends `onpin` once.

Because the setter sends the event, it does not matter how the change came about. A
property assignment, an attribute, an operation and a click all send the same event.

A rich operation may send an event of its own, when the event is about the action and not
about one state. The Operations section shows `save` doing that.

### How the `on…` property is written

Each event has a private field for its handler and a setter that goes through
`_subscribe`, a method from the base component:

```typescript
private _onpin: EventListener | null = null;

public set onpin(handler: EventListener | null) {
  this._onpin = this._subscribe(Event.ON_PIN, this._onpin, handler);
}
```

`_subscribe` checks the new handler, removes the old one, adds the new one, and returns
what the field should now hold. The component never calls `addEventListener` or
`removeEventListener` for its own events.

A handler is a value coming in from outside, so it is checked like any other. Something
that is not a function is rejected, and the handler that was there stays in place:

```typescript
pin.onpin = "text";   // throws: Invalid onpin value: text
```

### How an event behaves

- **It stays on the component.** An event does not travel up to parent elements. You
  listen on the pin itself, not on something around it.
- **It cannot be cancelled.** An event reports something that has already happened.
- **A failing handler does no damage.** If a handler throws, the browser reports the
  error, the other handlers still run, and the state change stands.

### One handler for everything: `onevent`

Every component also has `onevent`, which receives every event the component sends:

```typescript
pin.onevent = (event) => console.log(event.type, event.detail);
```

It runs after the event's own handlers. It is meant for code that follows a component as a
whole instead of picking out single events.

### Two events every component sends

The base component sends two events on every component, without the component declaring
them:

| Event | Sent when |
|---|---|
| `connected` | the component has been added to the page and set up |
| `disconnected` | the component has been removed from the page |

They have no `on…` property of their own. They reach `onevent` like any other event.

### Naming an event

An event name starts with `on` and says what happened: `onpin`, `onhide`.

Name it after what it means in the business, even when the browser already uses that name
on every element, as it does for `onchange` and `onload`. Be aware of what happens then: on
your component the name means your event, not the browser's. That is allowed, but it must
be a decision. A test in the metadata tests lists every state, operation and event name
that overrides a browser name, so one cannot slip in by accident.

And as with operations, the class is held to its list: every event named in the metadata
must have its `on…` property, or the code does not build. The Operations section explains
how, under "How the component is held to its list".

### Mistakes to avoid

- **Listening for `"pin"` instead of `"onpin"`.** The name includes the `on`.
- **Reading the component instead of the detail.** The state may have changed again.
- **Sending a state's event from an operation or a handler.** The setter sends it.
- **Sending an event before the change is made.** Dispatch is the last step.
- **Calling a handler directly instead of dispatching.** Go through `_dispatch`.
- **Adding or removing the listener yourself in an `on…` setter.** Use `_subscribe`.
- **Expecting a parent element to hear the event.** It stays on the component.

### Where the rules are

| Topic | Policy |
|---|---|
| The rules for events | `.claude/policies/event.md` |
| Where Dispatch sits in a setter | `.claude/policies/state.md`, Section 7 |
| Which tests an event needs | `.claude/workflow/testing.md`, Section 11 |
| The pin's events | `specifications/pin.specifications.json`, `src/pin.ts` |

---

## Gestures

### What a gesture is

A gesture is **something a user does to the component**: a click, a key press, moving the
pointer over it.

The pin has three:

| Gesture | What the user does | What happens |
|---|---|---|
| `click` | clicks the icon | the pin toggles |
| `keydown` | presses Enter while the icon has focus | the pin toggles |
| `hover` | moves the pointer over the icon | the icon changes colour |

A gesture is an input. It is not the same as an event, which is an outcome: `click` is
what the user did, `onpin` is what it led to.

### Two kinds of gesture

**Behavioural gestures** make the component do something. `click` and `keydown` are
behavioural. They are written in the component, in TypeScript.

**Visual gestures** only change how the component looks. `hover` is visual. It is written
in the stylesheet, and the component's code knows nothing about it.

The specification shows which is which. A behavioural gesture has `triggers`; a visual one
has `effects`:

```json
"click": {
  "description": "User clicks the icon to toggle the pin status.",
  "triggers": [{ "target": "div.icon", "operation": "toggle" }]
},
"hover": {
  "description": "Changes the button appearance when hovered.",
  "effects": {
    "properties": ["background-color", "border-color", "box-shadow", "fill"],
    "target": "div.icon"
  }
}
```

### What a trigger says

`triggers` is a list. Each trigger answers three questions:

| Field | Question | In the pin |
|---|---|---|
| `target` | Which part of the component is listened on? | `div.icon` |
| `operation` | Which operation does it lead to? | `toggle` |
| `condition` | What else must be true? Optional. | `key is Enter` |

It is a list because one gesture can be listened for in several places. A component with
three buttons has one `click` gesture with three triggers, one for each button.

### The chain from gesture to event

Every behavioural gesture goes through the same four steps:

```text
gesture  →  handler  →  operation  →  setter
```

1. The browser notices the gesture and calls the component's **handler**.
2. The handler calls an **operation**.
3. The operation assigns to a state, which runs its **setter**.
4. The setter changes the state, updates the attribute and sends the event.

So a click is not special. It ends in exactly the same code as `pin.toggle()` called from a
program. That is why a click and a method call always behave the same.

### Listening: attach and detach

The component starts listening when it is added to the page and stops when it is removed.
There is one line in each method for every trigger:

```typescript
protected _addEventListeners = () => {
  this.elements.icon?.addEventListener(Gesture.CLICK, this._handleIconClick);
  this.elements.icon?.addEventListener(Gesture.KEYDOWN, this._handleIconKeydown);
};

protected _removeEventListeners = () => {
  this.elements.icon?.removeEventListener(Gesture.CLICK, this._handleIconClick);
  this.elements.icon?.removeEventListener(Gesture.KEYDOWN, this._handleIconKeydown);
};
```

Three things to notice:

- **The names come from the metadata.** `Gesture.CLICK`, not `"click"`.
- **The target is a cached element.** `this.elements.icon` is the part the composition
  declares as `div.icon`.
- **Whatever is added is removed.** The two methods mirror each other line for line.

### The handler

Each trigger has its own handler, named after its target and its gesture:

```typescript
private _handleIconClick = () => this.toggle();

private _handleIconKeydown = (event: KeyboardEvent) =>
  event.key === Key.ENTER && this.toggle();
```

A handler has one job: turn what the browser gives it into a call to an operation.

- The click handler has nothing to decide, so it just calls `toggle()`.
- The keydown handler has a condition. Every key press arrives here, so it looks at which
  key it was and only calls `toggle()` for Enter.

Two rules keep handlers small:

- **The event stops at the handler.** The handler takes what it needs from the browser's
  event. The operation never sees the event.
- **A handler always calls an operation.** It never changes a state itself and never sends
  an event. If the behaviour is not something the outside should be able to call, the
  handler calls a private operation, named with an underscore, such as `_change`.

### Why the listener gets a handler, not the operation

It would be shorter to write `addEventListener(Gesture.CLICK, this.toggle)`. Do not. The
browser passes its event to whatever you register, so the operation would receive an event
as its first argument. For `toggle`, which takes nothing, that happens to be harmless. For
an operation that takes a value, it would be a bug.

### Keyboard gestures need focus

A key press goes to the element that has focus. A user moves focus with the Tab key, and
Tab only stops at elements that can take focus. A `div` cannot, unless the template says
so:

```html
<div class="icon" tabindex="0" role="button">
```

- `tabindex="0"` puts the icon in the Tab order, so a keyboard user can reach it.
- `role="button"` tells a screen reader that it is something to activate.

Without `tabindex`, the `keydown` gesture would be declared, wired and tested, and no user
could ever trigger it. Whenever something can be clicked, ask how a keyboard user gets to
it.

### Visual gestures

`hover` needs no code in the component. The stylesheet does it:

```css
@media (hover: hover) {
  :host([status="unpinned"]) .icon:hover {
    background-color: var(--button-unpinned-hover-background-color);
    border-color: var(--button-hover-border-color);
    box-shadow: var(--button-hover-shadow);
  }
}
```

The rule reads the `status` attribute to pick its colours, which works because the setter
keeps that attribute showing the state. But it only reads. A visual gesture never changes a
state, calls an operation or sends an event.

Visual gestures are not tested, because a test cannot hover.

### Mistakes to avoid

- **Registering an operation as the listener.** Register the handler.
- **Doing the work in the handler.** The handler calls an operation.
- **Changing a state or sending an event from a handler.** The setter does both.
- **Writing `"click"` or `"Enter"` as a string.** Use `Gesture.CLICK` and `Key.ENTER`.
- **Adding a listener without removing it.** Every trigger has a line in both methods.
- **A keyboard gesture on something that cannot take focus.** Add `tabindex="0"`.
- **Making a visual gesture do something.** If it needs behaviour, it is a behavioural
  gesture and belongs in the specification as one.

### Where the rules are

| Topic | Policy |
|---|---|
| The rules for gestures | `.claude/policies/gesture.md` |
| Which operation a handler may call | `.claude/policies/operation.md`, Section 12 |
| Which tests a gesture needs | `.claude/workflow/testing.md`, Section 12 |
| The pin's gestures | `specifications/pin.specifications.json`, `src/pin.ts`, `src/pin.style.css` |
