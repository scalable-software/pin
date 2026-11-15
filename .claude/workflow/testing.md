# Testing

This document describes how a developer tests a component while building it: what to test, where the tests go, how they are written, in which order, and how they are committed.

It is a workflow, not a set of rules for the component itself. The rules for each construct are in `.claude/policies/`. Branching, pull requests and releases are in `workflow.md`.

Every example is from the `pin` component, except those for data, a computed state and a rich operation, which come from the `title`, since the pin has none of them. They illustrate how a test is written; a component's tests come from its own specification.

---

# 1) What We Test

Every construct is tested for three things.

| Category | The question it answers | Example |
|---|---|---|
| **Existence** | Is it there? | `Visibility.HIDDEN` exists; `pin.visibility` getter exists |
| **Value** | Does it hold the right values? | `Visibility.HIDDEN` is `hidden`; `pin.visibility` starts as `Visibility.VISIBLE` |
| **Behaviour** | Does it do the right thing? | setting `pin.visibility` to `Visibility.HIDDEN` sets the `visibility` attribute |

All three are written as granular `then` statements, one assertion each. They differ in what protects the component:

- **Existence** is also guaranteed by the compiler. A missing metadata key does not compile, and `implements Meta` makes the build fail when a state, data item, operation or event named in the metadata is missing from the class. Existence tests therefore document the component — they make the test report an inventory of it — more than they protect it.
- **Value** is protected only by tests. Nothing else notices when `Visibility.HIDDEN` stops being `hidden`, although the stylesheet and the specification both depend on that exact word.
- **Behaviour** is protected only by tests.

The chain from specification to behaviour, and what checks each link:

```text
specification  →  metadata  →  class  →  behaviour
               value tests   compiler   behaviour tests
```

# 2) Where Tests Live

A component has three test files, one for each source file.

| Test file | Tests | Categories |
|---|---|---|
| `<component>.meta.test.ts` | the vocabulary in `<component>.meta.ts` | existence, value |
| `<component>.validation.test.ts` | the validators in `<component>.validation.ts` | existence, behaviour |
| `<component>.test.ts` | the component in `<component>.ts` and its template | existence, value, behaviour |

Tests are not shared between the three files.

# 3) How a Test Is Written

## 3.1) The vocabulary

Tests use four words from the test helper. Each maps to a Jasmine function and adds a prefix, so a test reads as a sentence.

| Keyword | Maps to | Purpose |
|---|---|---|
| `given` | `describe`, prefixed `Given` | the precondition all contained tests share |
| `and` | `describe`, prefixed `and` | a further precondition |
| `when` | `describe`, prefixed `when` | the action that is taken |
| `then` | `it`, prefixed `then` | one assertion: the outcome that is expected |

- Every assertion is in a `then`, and a `then` holds one assertion.
- Setup goes in `beforeEach`, in any `given`, `and` or `when`.
- A description names identifiers in backticks, exactly as they appear in the code: `` `pin.status` ``, `` `Status.PINNED` ``.
- Read from the outside in, the descriptions form one sentence that could have come from the specification.

## 3.2) The suite wrappers

Each top-level suite uses the wrapper for its concern. The wrapper records the concern and the name on every spec, for the JSON test report.

| Wrapper | Concern | The name comes from |
|---|---|---|
| `metadata(name, spec)` | metadata vocabulary | `Metadata.*` from the helper, or `State.*` for a value list |
| `validation(name, spec)` | a validator | the name of what it validates, such as `State.*` |
| `configuration(name, spec)` | a static member of the class | `Configuration.*` from the helper |
| `utility(name, spec)` | a static utility | `Utilities.*` from the helper |
| `composition(name, spec)` | structure and cached elements | `Composition.*` from the helper |
| `state(name, spec)` | a state | `State.*` |
| `data(name, spec)` | a data item | `Datum.*` |
| `operation(name, spec)` | an operation | `Operation.*` |
| `events(name, spec)` | an event | `Event.*` |
| `gesture(name, spec)` | a gesture | `Gesture.*` |

The name is always a constant, never a string.

## 3.3) The order of suites

Suites follow the order of the specification.

- **`<component>.meta.test.ts`:** `Tag`, `Attributes`, `State` followed by one suite for each value list, `Datum` followed by the value domains and formats its fields use, such as `Type` and `Uuid`, `Operation`, `Event`, `Gesture` followed by any list a gesture condition uses, such as `Key`.
- **`<component>.validation.test.ts`:** one suite for each validator, in the order they are declared.
- **`<component>.test.ts`:** configuration, utilities, composition, states, data, operations, events, gestures.

## 3.4) Setting up the component

A suite that needs the component in the page builds it in three nested steps, and takes it down again in reverse.

```typescript
state(State.VISIBILITY, () => {
  given("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("a HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        // specs here
      });
    });
  });
});
```

Every spec gets a new component, so a spec does not need to put a state back when it is done.

The outermost block is `given` for suites about structure and contract — metadata, validation, state, data, and the template and stylesheet suites — and `and` for suites about runtime behaviour: cached elements, operations, events and gestures.

# 4) The Working Loop

Work on one construct at a time, in the order of the sequence: composition, state, validation, operation, event, style, gesture. For each construct:

1. **Declare it.** Write the existence and value specs for the construct. Run the suite and see it fail. Commit. Write the code that declares the construct. Run the suite and see it pass. Commit.
2. **Give it its behaviours, one at a time.** Write the specs for one behaviour. Run, see them fail, commit. Write the code for that behaviour. Run, see them pass, commit.
3. **Complete the picture.** When a spec you want already passes the moment you write it, add it in a `TESTING:` commit.

Run the suite with `npm test`. A run that does not compile counts as a failing run: the first spec for anything new fails that way, because it names something that does not exist yet. When a run fails, the compiled test output is left behind; remove it with `npm run clean.test` before committing.

A FAIL commit must fail for the reason the spec states, and a PASS commit must pass the whole suite. Check both before committing.

# 5) What Goes in One Commit

A `then` statement is the unit of a test. It is not the unit of a commit. A commit pair holds **one fact about one construct**, and a fact may take several `then` statements to state.

| Pair | What it holds | How many |
|---|---|---|
| Declaration | every existence and value spec of the construct | one for each construct |
| Behaviour | every spec of one behaviour | one for each behaviour |

- **Existence and value are committed together.** They are written in the same line of code: a metadata key cannot be declared without its value, and a getter arrives with its default. A separate value pair could never fail.
- **The metadata and the class are committed together.** With `implements Meta`, a name in the metadata without its member on the class does not build.
- **A state's setter arrives with its first behaviour.** Declaring it earlier would mean committing an empty setter. The spec that the setter exists goes in that first behaviour pair.
- **Never combine two constructs in one pair,** and never combine a declaration with a behaviour.

The message names the construct for a declaration, and states the outcome for a behaviour. Both commits of a pair carry the same message.

```text
STATE: `visibility` exists with values `visible` and `hidden` -> FAIL
STATE: `visibility` exists with values `visible` and `hidden` -> PASS
STATE: set `pin.visibility` to `Visibility.HIDDEN` updates state -> FAIL
STATE: set `pin.visibility` to `Visibility.HIDDEN` updates state -> PASS

OPERATION: `hide` exists -> FAIL
OPERATION: `hide` exists -> PASS
OPERATION: Invoke `pin.hide` sets `pin.visibility` to `Visibility.HIDDEN` -> FAIL
OPERATION: Invoke `pin.hide` sets `pin.visibility` to `Visibility.HIDDEN` -> PASS

EVENT: `onhide` exists -> FAIL
EVENT: `onhide` exists -> PASS
```

The subject line stays short. When the individual facts of a declaration are worth having in the history, list them in the body of the commit.

# 6) What to Test for Each Construct

## 6.1) Metadata

For each list in `<component>.meta.ts`: `Tag`, `Attributes`, `State`, each value list, `Datum`, each value domain and format a data field uses, `Operation`, `Event`, `Gesture`, and any list a gesture condition uses. A format holds a pattern rather than values: its spec checks that the pattern matches a valid value and rejects an invalid one.

| Category | Specs |
|---|---|
| Existence | the list is defined; it is an object; each key exists |
| Value | each key holds the value the specification gives it |
| Value | for `State`, `Datum`, `Operation` and `Event`: the names that override one every HTML element already has, which is an empty list when there are none |

```typescript
metadata(State.VISIBILITY, () => {
  and("Visibility imported", () => {
    then("Visibility is defined", () => {
      expect(Visibility).toBeDefined();
    });

    and("Visibility is defined", () => {
      then("Visibility is an object", () => {
        expect(typeof Visibility).toBe("object");
      });

      when("Visibility is an object", () => {
        then("`Visibility.VISIBLE` exists", () => {
          expect(Visibility.VISIBLE).toBeDefined();
        });

        then("`Visibility.VISIBLE` is `visible`", () => {
          expect(Visibility.VISIBLE).toBe("visible");
        });

        then("`Visibility.HIDDEN` exists", () => {
          expect(Visibility.HIDDEN).toBeDefined();
        });

        then("`Visibility.HIDDEN` is `hidden`", () => {
          expect(Visibility.HIDDEN).toBe("hidden");
        });
      });
    });
  });
});
```

A value spec is the one place where a value is written as a literal. Everywhere else, tests use the constant.

A single value such as `Tag` has no keys: its suite checks that it is defined and that it holds its value.

## 6.2) Configuration, utilities and composition

| Suite | Specs |
|---|---|
| `configuration(Configuration.TAG, …)` and `ATTRIBUTES` | the static getter is defined; it returns the metadata constant |
| `utility(Utilities.TEMPLATE, …)` | the static property is defined; it is a `Template` |
| `composition(Composition.TEMPLATE, …)` | the component's root contains each declared part, nested as declared; each attribute declared under `attributes` is on the realized element |
| `composition(Composition.CSS, …)` | the root contains a link to the declared stylesheet |
| `composition(Composition.ELEMENT, …)` | each part declared `cached: true` is cached and is the realized element |

## 6.3) State

| Category | Specs | For |
|---|---|---|
| Existence | the getter exists | every state |
| Value | the getter returns the default | every state |
| Value | the attribute is absent at the default | optional attribute |
| Behaviour | the attribute exists and shows the default | compulsory attribute |
| Behaviour | the setter exists; setting a valid value updates the getter | writable state |
| Behaviour | setting an invalid value throws, with the exact message | writable state |
| Behaviour | setting `null` leaves the getter at the default | a state that normalizes |
| Behaviour | setting a value shows it on the attribute | writable, attribute-backed |
| Behaviour | setting the default removes the attribute | optional attribute |
| Behaviour | setting the attribute updates the getter | writable, attribute-backed |
| Behaviour | setting the attribute to an invalid value leaves the getter unchanged, restores the attribute, and reports the error with the exact message | writable, attribute-backed |
| Behaviour | removing the attribute restores it | compulsory attribute |
| Behaviour | assigning the state from outside the component does not compile | readonly state with a private setter |
| Behaviour | setting the attribute, to any value, restores it and reports no error | readonly, attribute-backed |
| Behaviour | a component added with the attribute in its markup starts at the default | readonly, attribute-backed |
| Behaviour | the state follows what it is computed from | computed state |

A readonly state's private setter is checked at compile time, as in Section 6.4: an assignment from outside, marked `// @ts-expect-error`.

An invalid value assigned to a property is caught in the test:

```typescript
when("`pin.visibility` is set to `invalid`", () => {
  let error: Error;
  beforeEach(() => {
    try {
      // @ts-expect-error
      pin.visibility = "invalid";
    } catch (err) {
      error = err as Error;
    }
  });

  then("an error is thrown", () => {
    expect(error).toBeDefined();
  });

  then("error message contains 'Invalid visibility value: invalid'", () => {
    expect(error.message).toBe("Invalid visibility value: invalid");
  });
});
```

An invalid value written to an attribute cannot be caught: the browser reports the error, and a reported error fails the spec unless it is spied on. The attribute change runs inside `jasmine.spyOnGlobalErrorsAsync`:

```typescript
when("`status` attribute is set to `invalid`", () => {
  let error: Error;
  beforeEach(async () => {
    await jasmine.spyOnGlobalErrorsAsync(async (reported) => {
      pin.setAttribute(Attributes.STATUS, "invalid");
      error = reported.calls.mostRecent()?.args[0];
    });
  });

  then("`status` attribute is `Status.UNPINNED`", () => {
    expect(pin.getAttribute(Attributes.STATUS)).toBe(Status.UNPINNED);
  });

  then("`pin.status` is `Status.UNPINNED`", () => {
    expect(pin.status).toBe(Status.UNPINNED);
  });

  then("error message contains 'Invalid status value: invalid'", () => {
    expect(error.message).toBe("Invalid status value: invalid");
  });
});
```

## 6.4) Data

The `pin` has no data, so the examples here are from the `title` and its `metadata`. A data suite uses the `data` wrapper, named by `Datum.*`.

| Category | Specs | For |
|---|---|---|
| Existence | the getter exists | every data item |
| Value | on a component that is never connected, the getter returns `null` | data that can be unloaded |
| Value | once connected, the getter returns the data the component created | data created on connect |
| Behaviour | the setter exists; setting a valid value: the getter equals it | writable data |
| Behaviour | the getter returns a copy: not the value that was set, and frozen | every data item |
| Behaviour | changing the value that was set, afterwards, leaves the getter unchanged | every data item |
| Behaviour | assigning a field of the getter's value throws a `TypeError` and changes nothing | every data item |
| Behaviour | setting an invalid value throws, with the exact message, and leaves the getter unchanged | writable data |
| Behaviour | setting `null` throws `Invalid {name} value: null` and leaves the getter unchanged | data that can be unloaded |
| Behaviour | assigning `null` does not compile | data that can be unloaded |
| Behaviour | setting a value updates each derived state and each projection | data with derived state or projections |
| Behaviour | setting a value leaves every state the user chooses as it was | a component with such a state |
| Behaviour | data loaded before the component is connected is kept, and drawn, once it is connected | every data item |
| Behaviour | data is kept when the component is removed and added again | every data item |

- When the component creates data on connect, the only component without data is one that is never connected. Make it with `document.createElement(Title.Tag)`, not `add`.
- Test data is valid data: a constant such as `ID` holds a real UUID, never `"1"`.

Ownership is tested on a value the spec keeps a reference to:

```typescript
when("`title.metadata` is set to `pathway`", () => {
  beforeEach(() => {
    title.metadata = pathway;
  });

  then("`title.metadata` is a copy, not `pathway` itself", () => {
    expect(title.metadata).not.toBe(pathway);
  });

  then("`title.metadata` is frozen", () => {
    expect(Object.isFrozen(title.metadata)).toBeTrue();
  });

  when("`pathway.name` is changed afterwards", () => {
    beforeEach(() => {
      pathway.name = "Changed";
    });

    then("`title.metadata.name` is still `Test`", () => {
      expect(title.metadata?.name).toBe("Test");
    });
  });
});
```

What the compiler must refuse is tested at compile time, with `@ts-expect-error` on the line it must refuse:

```typescript
then("assigning `null` to `title.metadata` does not compile", () => {
  const assign = () => {
    // @ts-expect-error: the setter of `metadata` does not accept `null`
    title.metadata = null;
  };
  expect(assign).toEqual(jasmine.any(Function));
});
```

The `then` checks nothing that matters at runtime, and the function is never called: the compiler does the check. If the setter accepted `null`, `@ts-expect-error` would have no error to expect, and the test file would not compile. The check needs `strictNullChecks`, without which `null` can be assigned to any type.

## 6.5) Validation

One suite for each validator.

| Category | Specs |
|---|---|
| Existence | `Validate` is defined; the validator exists |
| Behaviour | for each valid value: no error is thrown, and the value is returned |
| Behaviour | for an invalid value: an error is thrown, with the exact message |

The value is set in one `beforeEach`, the validator is called in a `try`/`catch` in the next, and the error and the result are asserted in separate `then` statements.

A structure, such as `metadata`, has one valid value with every field, and one invalid value for each rule the data policy gives it (Section 4): a value that is not a plain object, an undeclared field, and for each field, one that is absent (`required`) and one that fails its check (`invalid`).

```typescript
and("`value` is `invalid`", () => {
  let value: any;
  beforeEach(() => {
    value = "invalid";
  });

  when("`Validate.visibility(value)` is called", () => {
    let error: unknown | undefined;
    beforeEach(() => {
      try {
        Validate.visibility(value);
      } catch (err) {
        error = err;
      }
    });

    then("an error is thrown", () => {
      expect(error).not.toBeUndefined();
    });

    then("error message contains 'Invalid visibility value: invalid'", () => {
      expect((error as Error).message).toEqual("Invalid visibility value: invalid");
    });
  });
});
```

## 6.6) Operations

| Category | Specs |
|---|---|
| Existence | the operation exists on the component |
| Behaviour | invoking it produces the outcome the specification's `description` states, read from the state's getter |
| Behaviour | it returns what the specification's `returns` declares: for `void`, the result is `undefined` |

- When the outcome only shows from a particular starting state, that state is set first: `show` is tested on a hidden pin.
- An operation that goes both ways, such as `toggle`, is tested in each direction.
- An operation that sets a state the user chooses, such as the title's `mode`, is tested from each starting point that ends differently: `load` with a name, and without one.
- An operation that needs data is tested on a component without data, a component that is never connected: it does nothing and sends no event.
- When an operation calls another, or sets a state after its own event, the order of the events is part of its outcome. Record it with `onevent`, which receives every event the component sends:

```typescript
let order: string[];
beforeEach(() => {
  order = [];
  title.onevent = (event: { type: string }) => order.push(event.type);
  title.save();
});

then("the events are `onupdate`, `onsave`, then `onview`", () => {
  expect(order).toEqual([Event.ON_UPDATE, Event.ON_SAVE, Event.ON_VIEW]);
});
```

## 6.7) Events

| Category | Specs |
|---|---|
| Existence | the `on…` setter exists, checked with `hasSetter` |
| Behaviour | the listener is called when the event's outcome occurs |
| Behaviour | the listener is called with the `detail` the specification declares |
| Behaviour | a second listener replaces the first: the old one is not called, the new one is |
| Behaviour | a value that is not a function throws with `Invalid {event} value: {value}`, and the previous listener is still called |
| Behaviour | setting a state to the value it already has does not call the listener again |
| Behaviour | for an event that carries data: the `detail` holds the stored value, `toBe` the getter's value and frozen, never the value passed in |

- Listeners are spies: `jasmine.createSpy`.
- The payload is asserted with `toHaveBeenCalledWith(jasmine.objectContaining({ detail: { … } }))`.
- When the event needs a starting state, that state is set before the listener is assigned, so the listener does not record the change that set it up.

## 6.8) Gestures

For each behavioural gesture, every trigger is tested end to end: the interaction on the realized element, the state that results, and the event that follows.

| Category | Specs |
|---|---|
| Existence | covered by the metadata suite: `Gesture.CLICK` exists |
| Behaviour | the interaction on the target changes the state as the triggered operation would |
| Behaviour | the event that follows is dispatched |
| Behaviour | for a trigger with a condition: an interaction that does not meet it changes nothing |

- The element is found by selector, `pin.root.querySelector(".icon")`, not through the cache, so the test proves the wiring against the real structure.
- A click is made with `.click()`. A key press is made by dispatching a `KeyboardEvent` with the key from the metadata.
- A gesture that toggles is tested in both directions, the second inside the first.

```typescript
when("user presses `Key.ENTER` on `div` with class `icon`", () => {
  let onpin: jasmine.Spy;
  beforeEach(() => {
    onpin = jasmine.createSpy("onpin");
    pin.onpin = onpin;
    const icon = pin.root.querySelector(".icon") as HTMLElement;
    icon.dispatchEvent(new KeyboardEvent(Gesture.KEYDOWN, { key: Key.ENTER }));
  });

  then("`pin.status` is `Status.PINNED`", () => {
    expect(pin.status).toEqual(Status.PINNED);
  });

  then("`onpin` is called", () => {
    expect(onpin).toHaveBeenCalled();
  });
});
```

# 7) A Construct From Start to Finish

The `appearance` state, as this workflow builds it. Each line is a pair unless it says `TESTING`.

```text
STATE: `appearance` exists with values `floating` and `flat`
       metadata: Attributes.APPEARANCE, State.APPEARANCE, Appearance and its two keys, each with its value
       component: the getter exists and returns Appearance.FLOATING; the attribute is absent
STATE: set `pin.appearance` to `Appearance.FLAT` updates state
       the setter arrives here, with the spec that it exists
VALIDATION: `Validate.appearance(value)` returns `value` if `value` is valid
VALIDATION: `Validate.appearance(value)` throws error if `value` is `invalid`
VALIDATION: set `pin.appearance` to `invalid` throws error
STATE: set `pin.appearance` to `null` updates state to `Appearance.FLOATING`
STATE: set `pin.appearance` to `Appearance.FLAT` sets `appearance` attribute to `Appearance.FLAT`
STATE: set `appearance` attribute to `Appearance.FLAT` sets `pin.appearance` to `Appearance.FLAT`
STATE: set `appearance` attribute to `invalid` removes `appearance` attribute
TESTING: set `pin.appearance` to `Appearance.FLOATING` removes `appearance` attribute
TESTING: set `appearance` attribute to `invalid` keeps `pin.appearance` at `Appearance.FLOATING` and reports error
```

Nine pairs and two `TESTING` commits. Every pair after the first asserts something a user of the component could observe.

# 8) What Is Not Tested

- **Visual gestures.** A test cannot hover, so a gesture declared with `effects` has no specs.
- **Styles.** No spec reads how the component is drawn. A style rule that a state selects, such as `:host([mode="view"]) .label`, is covered by that state's specs, which check the attribute the rule selects on. A layout rule that no state selects, such as how far a part may shrink, has nothing a spec can read: a defect in one is fixed with a `STYLE:` commit alone, and checked in the browser (`workflow.md` §2.2).

Not yet described here, because neither the `pin` nor the `title` has one: tests for a state that is not attribute-backed.

# 9) Checklist

1. Test every construct for existence, value and behaviour.
2. Keep the three test files apart: metadata, validation, component.
3. Write every assertion as its own `then`, inside the wrapper for its concern, named by a constant.
4. Order suites as the specification orders its sections.
5. Build the component in the page in the three nested steps, and take it down in reverse.
6. Write a value as a literal only in a value spec; use the constant everywhere else.
7. Work on one construct at a time: declare it, then give it its behaviours one at a time.
8. See every FAIL fail for the stated reason and every PASS pass the whole suite before committing.
9. Commit one fact about one construct in each pair: the declaration, then each behaviour.
10. Commit existence and value together, and the metadata together with the class.
11. Let a state's setter arrive with its first behaviour.
12. Give both commits of a pair the same message: the construct for a declaration, the outcome for a behaviour.
13. Add a spec that already passes in a `TESTING:` commit.
14. Catch an invalid property value with `try`/`catch`, and an invalid attribute value with `jasmine.spyOnGlobalErrorsAsync`.
15. Test a data item for ownership, the unloaded state, connection and what follows from it.
16. Check at compile time what the compiler must refuse, with `@ts-expect-error` on the line it must refuse.
