# Specifications

This document describes how a component's specification is derived from its requirements: what the specification is, how a story is turned into entries in it, how the result is checked, and how the change is committed.

It is a workflow. The form of each entry — its fields and what they mean — is defined by the policy for that construct, in `.claude/policies/`. Writing the story comes first and is described in `requirements.md`.

The example throughout is the `Flat Appearance` story of the `pin` component.

---

# 1) What the Specification Is

The specification is the component's public contract, in one file: `specifications/<component>.specifications.json`.

It answers one question: **what does the component offer to the outside?** It does not say why, which is the requirements file's job, or how, which is the code's.

It has one section for each kind of construct, and each section has a policy that defines its entries.

| Section | It declares | Policy |
|---|---|---|
| `Composition` | the parts the component is made of | `composition.md` |
| `States` | the conditions the component can be in | `state.md` |
| `Operations` | the actions the outside can ask for | `operation.md` |
| `Events` | the outcomes the outside is told about | `event.md` |
| `Gestures` | what a user can do to it | `gesture.md` |

Above the sections it names the component: `Component`, `Package`, `Description` and `Tag`.

# 2) The Specification Follows the Requirements

The order is fixed: the story, then the specification, then the code.

- The specification is changed only after the story is written, and before any code or test.
- A story that changes nothing about what the component offers changes nothing in the specification. Upgrading a dependency is such a story.
- The specification is never written from the code. If the two differ, one of them is wrong.

There is one other reason to change it: the specification itself does not follow the policy for one of its sections. That is a correction of its form. It needs no story, and it changes nothing the component does.

# 3) From a Story to the Specification

Start from the story and its acceptance criteria. The story says what is needed; the criteria say what must be true when it is done.

> As a **host application**, when I place the pin inside a toolbar, I want it to appear without its own border and shadow, so that the toolbar reads as one surface.

Then go through the sections in order and ask one question for each.

| Section | The question | For this story |
|---|---|---|
| Composition | Does the component need a part it does not have, or does a part need to carry new meaning? | No. The same icon is drawn differently. |
| States | Must the component be in a condition it cannot be in today? | **Yes.** It must be either standing alone or lying flat. |
| Operations | Must the outside be able to ask for something by intent? | No. The host states which look it wants; there is no action to request. |
| Events | Must the outside be told that something happened? | No. The host chose the look itself. |
| Gestures | Must a user be able to cause it, or see a response to an interaction? | No. The user does not choose the look. |

Most stories touch one or two sections. A "no" is an answer, and it is worth being able to say why.

Go through them in this order, because each section can only refer to what an earlier one declares: a gesture names a part and an operation, and an event reports a change of state.

# 4) Writing an Entry

For each "yes", write the entry the way that section's policy defines it. The policy lists the fields; the story and its criteria supply the answers.

For the new state, the state policy asks for six things.

| Field | The question | The answer, and where it comes from |
|---|---|---|
| name | What is this condition called? | `appearance`: it governs how the pin looks and nothing else |
| `values` | What are all the conditions? | `floating` and `flat`: the two looks the story distinguishes |
| `default` | Which one applies when nothing is said? | `floating`: the first criterion says a pin with no attribute looks as it does today |
| `readonly` | May the outside set it? | `false`: the story's persona is the one who chooses |
| `attribute` | Does markup need to set it, or the stylesheet to react to it? | yes to both: the host writes it in markup, and the look is drawn by the stylesheet |
| `attribute.optional` | Is the attribute absent at the default? | `true`: existing pins carry no attribute and must stay unchanged |

The entry:

```json
"appearance": {
  "type": "Appearance",
  "description": "Indicates whether the component stands alone, with its own border and shadow, or lies flat inside another surface.",
  "values": ["floating", "flat"],
  "default": "floating",
  "readonly": false,
  "attribute": {
    "optional": true
  }
}
```

## 4.1) Choosing names

A name written in the specification is the name everywhere: in the metadata, on the class, in the markup and in the tests. So choose it here, once.

- Take it from the business the component serves, in the words the story uses.
- Say what the construct governs: `appearance` says that only the look changes.
- If the name is one every HTML element already has, using it overrides the browser's own. That is allowed, but it must be a decision.

## 4.2) What the specification leaves out

The story says "without its own border and shadow". Neither word appears in the entry.

How a state looks is the stylesheet's job. The specification declares the state the stylesheet reacts to, and its `description` says what the state means. The same holds for every section: the specification says what exists, never how it is drawn or built.

# 5) Checking the Result

Before committing, check the change four ways.

**Every acceptance criterion can be met by what is declared.**

| Criterion | Met by |
|---|---|
| a pin with no `appearance` attribute is `floating` | `default`, and `attribute.optional: true` |
| `appearance` can be set to `flat` by attribute or by property | `attribute`, and `readonly: false` |
| setting it back to `floating` removes the attribute | `attribute.optional: true` |
| any other value is rejected | `values` |
| pinning, unpinning, hiding and showing behave as before | nothing else was changed |

**Every new entry can be traced to a criterion.** An entry that no criterion asks for does not belong in this change.

**Nothing is declared twice.** A value that is a state is not also an operation; a look that the stylesheet draws is not also an attribute of a part.

**Each section follows its policy.** Every policy prints the schema for its section, and the specification is checked against all of them:

```text
npm run check.specification
```

The same check runs at the start of `npm test`, so a specification that breaks a policy stops the tests before they begin.

# 6) Committing the Change

- Every change to a specification is a `SPECIFICATIONS:` commit.
- There is one for each story. It comes after the story's `REQUIREMENTS:` commit and before any code or test.
- The message says what is now declared.

```text
REQUIREMENTS: Record the flat appearance story
SPECIFICATIONS: Declare the `appearance` state
```

From here the work follows the order of the specification's sections — composition, state, validation, operation, event, style, gesture — and `testing.md` describes how each construct is built and proven.

# 7) A Second Story, for Contrast

The same questions give different answers for a different story.

> As an **end user**, when I work with the keyboard, I want to reach the pin and pin or unpin with it, so that I do not need a pointing device.

| Section | For this story |
|---|---|
| Composition | **Yes.** The icon must be able to take focus and say what it is: it gains `tabindex` and `role`. |
| States | No. Pinned and unpinned already exist. |
| Operations | No. `toggle` already does what is needed. |
| Events | No. `onpin` and `onunpin` already report it. |
| Gestures | **Yes.** A key press on the icon must toggle the pin. |

```json
"div.icon": {
  "attributes": { "tabindex": "0", "role": "button" }
}
```

```json
"keydown": {
  "description": "User presses Enter on the focused icon to toggle the pin status.",
  "triggers": [
    { "target": "div.icon", "condition": "key is Enter", "operation": "toggle" }
  ]
}
```

One story added a state and nothing else. The other added no state at all, and reused an operation and two events that were already there. Asking every question each time is what finds that out.

# 8) Checklist

1. Write the story and its acceptance criteria first.
2. Change the specification after the story and before any code or test.
3. Leave the specification alone when the story changes nothing the component offers.
4. Go through the sections in order — composition, states, operations, events, gestures — and answer each question, including the ones answered "no".
5. Write each new entry as its policy defines it, taking every answer from the story or a criterion.
6. Choose each name once, here, from the words of the business.
7. Declare what exists; leave how it looks to the stylesheet and how it works to the code.
8. Check that every criterion can be met by what is declared, and that every new entry answers a criterion.
9. Run `npm run check.specification` to check every section against the schema in its policy.
10. Make one `SPECIFICATIONS:` commit for the story, after its `REQUIREMENTS:` commit.
