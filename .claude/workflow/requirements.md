# Requirements

This document describes how the intent of a component is recorded: what a requirements file contains, when a story is written into it, how a story is worded, and how the change is committed.

It is a workflow. What happens to a story after it is written — the issue, the branch, the pull request — is described in `github.md`.

The examples are from the `pin` component.

---

# 1) Where a Requirement Sits

Requirements are the first of four records of a component. Each answers one question, at its own level of detail.

| Record | Level | The question it answers | How long it lives |
|---|---|---|---|
| `<component>.requirements.md` | intent | Why does the component exist, and for whom? | the life of the component |
| the issue | work item | What counts as done? | until the work is delivered |
| `<component>.specifications.json` | contract | What is the public contract? | the life of the component |
| `test/unit/*` | proof | Is the contract honoured? | the life of the component |

Requirements stay at the level of intent. They never repeat what a lower record already says.

# 2) The Requirements File

Each component records its requirements in `specifications/<component>.requirements.md`, next to its specification.

- It contains requirements only. It does not explain what a requirements file is or how it is used; this document does that.
- It is versioned with the component, so intent, contract, implementation and tests change together.

# 3) What the File Contains

The file is a list of features, and each feature contains stories.

- **A feature** is a capability that delivers a benefit. It groups every story that serves that capability, whenever the story was written.
- **A story** is one persona's need.

Every file has at least one feature, and every story in the file sits under exactly one feature.

## 3.1) A feature

A feature is a second-level section titled `FEATURE: <title>`. It declares four things.

| Part | What it says |
|---|---|
| **Benefit** | the value the capability delivers, in one or two sentences |
| **Personas** | everyone its stories are written for, each with a one-line description |
| **In scope** | what the capability covers |
| **Out of scope** | what a reader might expect, but the capability deliberately does not cover |

Out of scope matters most where the component's responsibility ends and the host application's begins. Say so explicitly.

## 3.2) A story

A story is a third-level section titled `STORY: <title>`, under its feature. It contains the story statement and nothing else.

## 3.3) What stays out

| Not in the file | Where it belongs |
|---|---|
| acceptance criteria | the story's issue, and the tests once the work is delivered |
| states, data, operations, events, gestures, composition | the specification |
| implementation and test detail | the code and the tests |
| defects | a fix restores a requirement that already exists; it is not a requirement |

This keeps one home for each level of detail.

# 4) Writing a Story

A story has one form:

```text
As a <persona>, when <context>, I want <need>, so that <value>.
```

- `when <context>` may be left out when the need applies in every context.
- `so that <value>` is never left out. It is the reason the story exists.
- The story states a need, not a solution. It names no construct, no API and no implementation.
- A story may hold more than one statement when one deliverable serves several personas. Each statement uses the same form.

```markdown
### STORY: Pin and Unpin

As an **end user**, when an element is important to what I am doing, I want to pin it in
place and unpin it when I no longer need it, so that I control what stays on screen.

As a **host application**, I want to be told whenever the pin is pinned or unpinned, so that
I can fix or release the element accordingly.
```

# 5) Personas

A persona names the role of whoever has the need.

- Personas are declared by the feature. A story in the file uses only the personas its feature declares.
- For a component these are typically the person using it, the *end user*, and the application embedding it, the *host application*.
- Work on the package itself has no feature: a build change, an upgrade, a workflow. Its story is written for the *maintainer*, the person who builds, releases and keeps the component.

# 6) Does the Story Go in the File?

Not every story is recorded. Ask one question: **does this story describe something that stays true for the life of the component?**

| The story | Example | Where it lives |
|---|---|---|
| lasts | the pin can be operated by keyboard | the requirements file, and its issue |
| is a one-time event | the pin moves to a newer base component | its issue only |

A story that is recorded belongs to the feature whose capability it serves. A story that is not recorded has no feature.

# 7) A Feature in the File and a Feature in Delivery

The word *feature* is used for two things, and they are kept apart.

**In the requirements file**, a feature is a capability. It keeps collecting stories for as long as the component lives.

**In delivery**, what is delivered together depends on when the stories were written.

| The stories | Delivered on | Merged as |
|---|---|---|
| defined together, as a new feature | one `feature/<title>` branch, one story after another | `FEATURE: <title>` |
| one story added to a feature that already exists | its own `story/<title>` branch | `STORY: <title>` |
| one story that is in no feature | its own `story/<title>` branch | `STORY: <title>` |

So a story can sit under a feature in the file and still be delivered alone.

# 8) Adding a Story

1. Write the story in its one form.
2. Decide whether it lasts. If it does not, it goes in its issue only, and the steps below do not apply.
3. Add it to the file as `### STORY: <title>`, under the feature whose capability it serves.
4. Read that feature's benefit, in scope and out of scope again. A new story often widens the scope; update those parts in the same change.
5. Commit the change as the first commit on the story's branch.

A new feature is added the same way: its section with benefit, personas and scope, then its stories.

# 9) The Title Is the Link

A story's title connects the requirements file to everything that follows. It is the same at every stage.

| Stage | A story | A feature delivered as a whole |
|---|---|---|
| Requirements file | `### STORY: Visibility Control` | `## FEATURE: Pinnable UI Elements` |
| Issue | `STORY: Visibility Control` | `FEATURE: Pinnable UI Elements`, with its stories as sub-issues |
| Branch | `story/visibility-control` | `feature/pinnable-ui-elements` |
| Merge commit | `STORY: Visibility Control` | `FEATURE: Pinnable UI Elements` |

Renaming a story means renaming it at every stage that already exists.

# 10) Committing the Change

- Every change to a requirements file is a `REQUIREMENTS:` commit.
- There is one `REQUIREMENTS:` commit for each story, and it carries the changes to the feature's scope that the story brings.
- It is the first commit on the story's branch, unless the story is already recorded.

```text
REQUIREMENTS: Record the flat appearance story
```

# 11) A Requirements File

`specifications/pin.requirements.md`, shortened:

```markdown
# Pin — Requirements

## FEATURE: Pinnable UI Elements

**Benefit** — Product teams get a single drop-in control that lets users keep important
on-screen elements fixed in place or release them, without building and styling that control
themselves.

**Personas**

- **End user** — the person who sees the pin and decides whether an element stays in place.
- **Host application** — the application that embeds the pin, decides when it is relevant,
  and acts on its outcomes.

**In scope**

- Expressing and reporting the pinned or unpinned intent for one element.
- ...

**Out of scope**

- Actually fixing or releasing the element on screen — the host application does this in
  response to the pin's events.
- ...

---

### STORY: Visibility Control

As a **host application**, when pinning is not relevant to the current context, I want to
hide the pin and show it again later, so that the end user only sees controls that apply.

### STORY: Pin and Unpin

...
```

# 12) Checklist

1. Record requirements in `specifications/<component>.requirements.md`, and nothing else in that file.
2. Keep requirements at the level of intent: no acceptance criteria, no constructs, no implementation, no defects.
3. Group stories under features; give every feature its benefit, personas, in scope and out of scope.
4. Write every story as `As a <persona>, when <context>, I want <need>, so that <value>.`, and never leave out the value.
5. Use only the personas the story's feature declares; write work on the package itself for the maintainer.
6. Record a story only when it stays true for the life of the component.
7. Put a recorded story under the feature whose capability it serves.
8. When a story is added, read the feature's benefit and scope again and update them in the same commit.
9. Deliver stories defined together on one feature branch; deliver a story added later, or one in no feature, on its own story branch.
10. Keep the title identical in the requirements file, the issue and the merge commit, and in lower case with hyphens in the branch.
11. Make one `REQUIREMENTS:` commit for each story, as the first commit on its branch.
