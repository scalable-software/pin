# Validation

This document defines an implementation policy for **component validation**, then illustrates how specifications are implemented by applying this policy.

This document is intentionally **validation** only, but part of a set of implementation policies which together defines the policies which should be followed to transform specifications into an implementation which is predictable, maintainable, and production-ready at scale.

---

# How to Read This Policy

Rules in this policy fall into three strengths. Read each rule with its strength in mind:

- **Principles** are non-negotiable. They derive from framework correctness or TDD discipline and hold for every component. A conflict with a principle is a defect.
- **Templates** are invariant skeletons with explicit variation points. The skeleton applies to every component; specific steps activate or deactivate based on the component's declared classification (e.g., attribute-backed vs non-attribute, readonly vs writable, payload-bearing vs payload-free). Variation is part of the template, not a deviation from it.
- **Conventions** are canonical defaults that keep implementations readable across components. A second component may deviate when its shape genuinely warrants it; the deviation should be explained at review time, not forbidden by the policy.

When applying this policy to a new component, classify each rule before reconciling conflicts. A conflict with a principle is a defect; a conflict with a template means a variation point needs to be made explicit; a conflict with a convention is a documented deviation.

---

# 1) Validation Must Be Implemented in a Dedicated File

All validation logic for a component must live in a single dedicated file: `<component>.validation.ts`.

Policy:

- validation logic must not be inlined in `<component>.ts`
- validation logic must not be defined in `<component>.meta.ts`
- `<component>.validation.ts` is the authoritative location for all validation logic in the component

This separation gives each file a single clear responsibility:

- `<component>.meta.ts` declares value domains
- `<component>.validation.ts` enforces value domains
- `<component>.ts` invokes validation inside the mutation path

# Template Variation Points

Validators vary only by the check they perform, which fits the kind of value (Section 6):

- **Enum** — the value is on a list. This is the most common case and is illustrated by the pin's validators.
- **Format** — the value has the right shape, such as a UUID.
- **Range** — the value lies between limits, such as a number between a minimum and a maximum.
- **Structure** — each field of an object passes its own check (see the data policy for the `Metadata` example).

The dedicated-file rule (Section 1), the `Validate`-class structure (Sections 2–3), the metadata-sourced domain rule (Section 4), the signature (Section 5), the throw-on-invalid rule (Section 7), the canonical error format (Section 8), the scope (Section 9), and the placement (Section 10) are the same for every kind.

# 2) All Validators Belong to a Single Exported Class Named `Validate`

All validation methods for a component must be defined as members of a single exported class.

Policy:

- the class name must always be `Validate`
- the class must be exported from `<component>.validation.ts`
- all validators for the component must belong to this single class
- the class must not contain non-validation logic

Example:

```typescript
export class Validate {
  public static visibility = (value: unknown) => { ... };
  public static status = (value: unknown) => { ... };
}
```

# 3) Validators Must Be Public Static Arrow Function Class Properties

Each validator must be defined as a `public static` arrow function class property on the `Validate` class.

Policy:

- validators must be `public` — they are invoked from `<component>.ts`
- validators must be `static` — they are called on the class directly, without instantiation
- validators must be defined as arrow function class properties — consistent with the implementation pattern used across operations and handlers
- validators must not be prototype methods

Example:

```typescript
export class Validate {
  public static visibility = (value: unknown) => {
    ...
  };
}
```

# 4) Validators Must Source Their Domain from Metadata

Validators enforce the value domains declared in `<component>.meta.ts`. They must not define allowed values independently.

Policy:

- validators must import the relevant value domain objects from `<component>.meta.ts`
- the set of valid values is derived from the imported metadata, not from hardcoded literals inside `<component>.validation.ts`
- `<component>.meta.ts` is the single source of truth for allowed values
- if the allowed values change in metadata, validation must reflect that change automatically

Example:

```typescript
import { Visibility, Status } from "./pin.meta.js";

export class Validate {
  public static visibility = (value: unknown) => {
    const valid = Object.values(Visibility).includes(value as Visibility);
    ...
  };
}
```

# 5) Validator Signature Must Accept `unknown` and Return the Narrowed Type

A value that arrives from outside can be anything: a string from an attribute, `null` from a removed attribute, or any value a caller passes. The input type of a validator is therefore `unknown`.

The return type must be the narrowed TypeScript type defined by the corresponding value domain in metadata.

Policy:

- the input type is `unknown`
- the return type is the TypeScript domain type (e.g., `Visibility`, `Status`)
- on valid input, the validator returns the value cast to the narrowed type
- on invalid input, the validator throws — it must not return a fallback or a default value
- a validator is pure: it reads only its arguments, never the component

Example:

```typescript
public static visibility = (value: unknown) => {
  const valid = Object.values(Visibility).includes(value as Visibility);
  if (!valid) throw new Error(`Invalid visibility value: ${value}`);
  return value as Visibility;
};
```

The validator bridges from the unnarrowed boundary type to the narrowed domain type — or throws. There is no third path.

# 6) The Check Must Fit the Kind of Value

Every validator has the same three lines: a check, a throw, and a return. Only the check differs, and every limit it tests against comes from `<component>.meta.ts`.

| Kind | The check | Metadata |
|---|---|---|
| Enum | the value is on the list | `Status` |
| Format | the value has the right shape | `Uuid.PATTERN` |
| Range | the value lies between limits | `Zoom.MIN`, `Zoom.MAX` |
| Structure | each field passes its own check | the field types |

Policy:

- for an enum, use `Object.values(Domain).includes(value as Domain)` — it derives the valid values directly from the metadata object and does not maintain a separate list
- for a format or a range, test the runtime type first, then the shape or the limits
- a value of the wrong runtime type is rejected, not converted: an attribute always arrives as a string, so a non-string attribute-backed state converts in its Normalize step, before validation
- matching is exact: a value that differs in case or carries whitespace is rejected

Enum:

```typescript
public static status = (value: unknown) => {
  const valid = Object.values(Status).includes(value as Status);
  if (!valid) throw new Error(`Invalid status value: ${value}`);
  return value as Status;
};
```

Format:

```typescript
public static id = (value: unknown) => {
  const valid = typeof value === "string" && Uuid.PATTERN.test(value);
  if (!valid) throw new Error(`Invalid id value: ${value}`);
  return value as Id;
};
```

Range:

```typescript
public static zoom = (value: unknown) => {
  const valid =
    typeof value === "number" && value >= Zoom.MIN && value <= Zoom.MAX;
  if (!valid) throw new Error(`Invalid zoom value: ${value}`);
  return value as Zoom;
};
```

# 7) Invalid Input Must Throw a Descriptive Error

When a value fails validation, the validator must throw.

Policy:

- the validator must throw a `new Error(...)` on invalid input
- the validator must not return a fallback value on invalid input
- the validator must not silently ignore invalid input
- the thrown error must carry a message that identifies what was invalid and what was received

# 8) Error Messages Must Follow a Canonical Format

The error message thrown by a validator must follow this format:

```
Invalid {name} value: {value}
```

Where:

- `{name}` is the camelCase canonical name of the validated property as declared in the specification
- `{value}` is the actual received value, interpolated at runtime using a template literal

Policy:

- every validator in the component must use this format consistently
- the property name in the message must match the canonical name from the specification
- the received value must always be included in the message

Example:

```typescript
throw new Error(`Invalid visibility value: ${value}`);
throw new Error(`Invalid status value: ${value}`);
```

A structure cannot be printed as one value. When a field of a structure fails, the message names the field and its problem instead:

```
Invalid {name} value: {field} is {problem}
```

```typescript
throw new Error("Invalid metadata value: id is required");
```

# 9) Validation Scope Covers Every Value That Enters From Outside

A validator exists for every value that enters the component from outside. A value the component produces itself is trusted and has no validator.

Policy:

- a writable state or data item has a validator, because its setter accepts outside values
- an operation parameter that the operation uses itself has a validator
- a readonly value that only the component sets has no validator
- a generated value, such as a new UUID or a timestamp, has no validator

# 10) A Value Is Validated Once, Where It First Lands

Validators are called by `<component>.ts` at the first place an outside value lands: a setter, or an operation that uses a parameter itself.

Policy:

- a setter validates its value, as the second step of the mutation order, after normalization and before the guard: **Normalize → Validate → Guard → Mutate → Reflect**
- an operation validates a parameter it uses itself, before first use
- an operation does not validate a parameter it passes to a setter — the setter does
- attribute handlers and gesture handlers never validate — they pass the value on
- the return value of the validator — the narrowed typed value — must replace the raw input for the remainder of the path
- if validation throws, the state must not change; for attribute-backed state the setter's `finally` block still reflects, so the attribute returns to the state

| What an operation does with a parameter | Who validates |
|---|---|
| passes it to a setter | the setter |
| uses it itself, with no setter in between | the operation, before first use |
| has no parameter | nobody |

The mutation order is defined authoritatively in the state policy. The validation policy governs the implementation of the validator itself, not the order it is called in.

Example showing the validator's position in the mutation path:

```typescript
public set visibility(visibility: Visibility | null) {
  try {
    // Normalize
    visibility = visibility ?? Visibility.VISIBLE;

    // Validate — narrowed return value replaces the raw input
    visibility = Validate.visibility(visibility);

    // Guard
    if (this._visibility === visibility) return;

    // Mutate
    this._visibility = visibility;
  } finally {
    // Reflect
    this._reflect(Attributes.VISIBILITY, this._visibility, Visibility.VISIBLE);
  }
  ...
}
```

---

# Policy Applied to Specification

The Pin component declares two writable state properties — `visibility` and `status` — both enums declared in `pin.meta.ts`. Both accept outside values through their setter, so both have a validator. None of the pin's operations takes a parameter, so no operation validates.

`pin.meta.ts` — value domain declarations:

```typescript
export const Visibility = {
  VISIBLE: "visible",
  HIDDEN: "hidden",
} as const;

export type Visibility = (typeof Visibility)[keyof typeof Visibility];

export const Status = {
  PINNED: "pinned",
  UNPINNED: "unpinned",
} as const;

export type Status = (typeof Status)[keyof typeof Status];
```

`pin.validation.ts` — the full implementation:

```typescript
import { Visibility, Status } from "./pin.meta.js";

export class Validate {
  public static visibility = (value: unknown) => {
    const valid = Object.values(Visibility).includes(value as Visibility);
    if (!valid) {
      throw new Error(`Invalid visibility value: ${value}`);
    }
    return value as Visibility;
  };

  public static status = (value: unknown) => {
    const valid = Object.values(Status).includes(value as Status);
    if (!valid) {
      throw new Error(`Invalid status value: ${value}`);
    }
    return value as Status;
  };
}
```

How the policy is applied:

- all validation lives in `pin.validation.ts` — not in `pin.ts` or `pin.meta.ts`
- a single exported `Validate` class contains both validators
- both validators are `public static` arrow function class properties
- both import their value domains from `pin.meta.ts` — no allowed values are hardcoded in `pin.validation.ts`
- both accept `unknown` and return the narrowed metadata type on success
- both use `Object.values(Domain).includes(value as Domain)` for membership checking
- both throw `new Error(...)` on invalid input — no fallback is returned
- both use the canonical error format: `` `Invalid {name} value: ${value}` ``
- `Validate` has exactly two methods because exactly two values enter the pin from outside

Invocation in `pin.ts`:

```typescript
// visibility setter — optional attribute-backed, writable
public set visibility(visibility: Visibility | null) {
  try {
    visibility = visibility ?? Visibility.VISIBLE;  // Normalize
    visibility = Validate.visibility(visibility);   // Validate
    if (this._visibility === visibility) return;    // Guard
    this._visibility = visibility;                  // Mutate
  } finally {
    this._reflect(Attributes.VISIBILITY, this._visibility, Visibility.VISIBLE); // Reflect
  }
  ...
}

// status setter — compulsory attribute-backed, writable
public set status(status: Status) {
  try {
    status = Validate.status(status);     // Validate (no normalization step)
    if (this._status === status) return;  // Guard
    this._status = status;                // Mutate
  } finally {
    this._reflect(Attributes.STATUS, this._status); // Reflect
  }
  ...
}
```

- `Validate.visibility` is called after normalization because the optional setter must first convert `null` (passed by `attributeChangedCallback` on attribute removal) to the default before validation can safely proceed
- `Validate.status` is called as the first step because the compulsory setter has no normalization step — `null` is not a valid status value and must be rejected by validation
- in both cases the narrowed return value replaces the raw input before the guard check

---

# Policy Checklist

A compliant component must:

1. Implement all validation logic in `<component>.validation.ts`.
2. Not inline validation logic in `<component>.ts` or `<component>.meta.ts`.
3. Export a single class named `Validate` from `<component>.validation.ts`.
4. Define all validators as members of the `Validate` class with no non-validation logic in the class.
5. Define each validator as a `public static` arrow function class property.
6. Import value domain objects from `<component>.meta.ts` — do not hardcode allowed values in validators.
7. Use the check that fits the kind of value: `Object.values(Domain).includes(value as Domain)` for an enum, the runtime type and then the shape or limits for a format or a range.
8. Accept `unknown` and keep the validator pure.
9. Return the narrowed TypeScript domain type on valid input.
10. Throw `new Error(...)` on invalid input — do not return a fallback or a default value.
11. Use the canonical error message format: `` `Invalid {name} value: ${value}` ``; for a failing field of a structure, `Invalid {name} value: {field} is {problem}`.
12. Use the camelCase canonical property name in the error message.
13. Include the actual received value in the error message.
14. Define a validator for every value that enters the component from outside: a writable state or data item, and an operation parameter the operation uses itself.
15. Do not define validators in `Validate` for readonly values that only the component sets.
16. Do not define validators in `Validate` for internally generated values.
17. Validate a value once, where it first lands: in the setter, or in an operation that uses the parameter itself — never in an attribute handler or a gesture handler.
18. In a setter, call the validator as the second step of the mutation path: after normalization, before the guard.
19. Replace the raw input with the narrowed return value of the validator for the remainder of the mutation path.
20. Ensure that if validation throws, mutation does not proceed.
