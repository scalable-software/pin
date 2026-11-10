# Requirements

This document defines an implementation policy for **component requirements**, then illustrates how the policy is applied to a component.

This document is intentionally **requirements** only, but part of a set of implementation policies which together define the policies which should be followed to transform specifications into an implementation which is predictable, maintainable, and production-ready at scale.

Requirements are the intent layer of a component: they record **why** the component exists and **which needs** it serves. Every other layer is derived from them.

---

# How to Read This Policy

Rules in this policy fall into three strengths. Read each rule with its strength in mind:

- **Principles** are non-negotiable. They derive from framework correctness or TDD discipline and hold for every component. A conflict with a principle is a defect.
- **Templates** are invariant skeletons with explicit variation points. The skeleton applies to every component; specific steps activate or deactivate based on the component's declared classification (e.g., attribute-backed vs non-attribute, readonly vs writable, payload-bearing vs payload-free). Variation is part of the template, not a deviation from it.
- **Conventions** are canonical defaults that keep implementations readable across components. A second component may deviate when its shape genuinely warrants it; the deviation should be explained at review time, not forbidden by the policy.

When applying this policy to a new component, classify each rule before reconciling conflicts. A conflict with a principle is a defect; a conflict with a template means a variation point needs to be made explicit; a conflict with a convention is a documented deviation.

---

# 1) Requirements Must Be Declared in a Dedicated File

Each component must declare its requirements in `specifications/<component>.requirements.md`, next to `<component>.specifications.json`.

Policy:

- the requirements file is the durable record of the component's intent
- the requirements file contains requirements only — it must not explain what a requirements file is or how it is used; that explanation belongs to this policy
- the requirements file is versioned with the component, so intent, contract, implementation, and tests evolve together

# 2) Each Artefact Answers One Question

Requirements are one layer in a chain of artefacts. Each artefact answers exactly one question at its own level of detail:

| Artefact | Level | Answers | Lifetime |
|---|---|---|---|
| `<component>.requirements.md` | Intent | Why does the component exist, and for whom? | Life of the component |
| Issue | Work item | What counts as done? | Until the story is delivered |
| `<component>.specifications.json` | Contract | What is the public contract? | Life of the component |
| `test/unit/*` | Proof | Is the contract honoured? | Life of the component |

Policy:

- requirements must stay at the level of intent
- requirements must not repeat what a lower layer already records

# 3) Requirements Must Not Contain Acceptance Criteria

Acceptance criteria define when a story is done. They belong to the story's issue while the story is in progress, and to the tests once it is delivered.

Policy:

- requirements must not contain Given/When/Then acceptance criteria
- requirements must not describe constructs — state, data, operations, events, gestures, or composition; these belong to the specification
- requirements must not describe implementation or verification detail
- acceptance criteria are written in the story's issue (see the workflow policy)

This keeps one durable home for each level of detail: intent in the requirements, contract in the specification, criteria in the tests.

# 4) Requirements Must Be Structured as Features Containing Stories

The backlog levels used by this framework are:

- **Feature** — a capability that delivers a benefit; a group of stories. A feature is too large to deliver in one merge and is complete when all of its stories are delivered.
- **Story** — one persona's need, small enough to deliver and verify on one branch.

Policy:

- every requirements file declares at least one feature
- every story belongs to exactly one feature
- a feature is never delivered directly; it is delivered through its stories
- defects are not requirements: a fix restores a requirement that already exists and is not recorded in the requirements file

# 5) A Feature Must Declare Its Benefit, Personas, and Scope

Each feature is a level-two section titled `FEATURE: <title>` and must declare:

- **Benefit** — the value the capability delivers, in one or two sentences
- **Personas** — every persona its stories are written for, each with a one-line role description
- **In scope** — what the capability covers
- **Out of scope** — what a reader might reasonably expect but the capability deliberately does not cover

Policy:

- personas are declared per feature; a story must only use personas declared by its feature
- personas name the role of whoever has the need — for a component this is typically the person using it (*end user*) and the application embedding it (*host application*)
- out of scope must be explicit wherever the component's responsibility ends and the host application's begins

# 6) A Story Must Be Expressed in the Canonical User Story Form

Each story is a level-three section titled `STORY: <title>` beneath its feature, containing the story statement in the canonical form:

```
As a <persona>, when <context>, I want <need>, so that <value>.
```

Policy:

- the persona must be declared by the feature
- `when <context>` may be omitted when the need applies in every context
- `so that <value>` must not be omitted — it is the reason the story exists
- a story may contain more than one statement when a single deliverable serves several personas; each statement uses the canonical form
- the story states a need, not a solution — it must not name constructs, APIs, or implementation

# 7) Story Titles Must Be Predictably Transformed Across Layers

A story's title is the link between the requirements and the delivery chain defined in the workflow policy.

Transformation pattern:

| Layer | Example |
|---|---|
| Requirements | `### STORY: Visibility Control` |
| Issue title | `STORY: Visibility Control` |
| Branch | `story/visibility-control` |
| Merge commit | `STORY: Visibility Control` |

Policy:

- the story title in the requirements file and the issue title must be identical
- the issue body repeats the story statement and adds its Given/When/Then acceptance criteria
- a feature may be tracked as a parent issue titled `FEATURE: <title>` whose sub-issues are its stories
- `FEATURE` never appears on a branch, commit, or merge commit

# 8) Requirements Changes Are Recorded Through `REQUIREMENTS:` Commits

Policy:

- every change to a requirements file is a `REQUIREMENTS:` commit
- a new story is recorded through the first commit on its `story/<title>` branch, unless it is already recorded
- one `REQUIREMENTS:` commit per story
- renaming a story is a change across every layer of the transformation pattern in Section 7 and must keep those layers aligned

---

# Policy Applied to a Component

`specifications/pin.requirements.md`:

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

How the policy is applied:

- the file lives at `specifications/pin.requirements.md`, next to `pin.specifications.json`
- the file contains requirements only — no explanation of the file itself
- one feature declares its benefit, personas, and scope
- out of scope marks where the pin's responsibility ends and the host application's begins
- every story uses a persona declared by the feature and the canonical user story form
- no story contains acceptance criteria, constructs, or implementation detail
- each story title is identical to its issue title and merge-commit title

---

# Policy Checklist

A compliant component must:

1. Declare requirements in `specifications/<component>.requirements.md`.
2. Keep the requirements file free of explanation about the file itself.
3. Keep requirements at the level of intent.
4. Exclude acceptance criteria from the requirements file — write them in the story's issue.
5. Exclude constructs and implementation detail from the requirements file.
6. Declare at least one feature as `## FEATURE: <title>`.
7. Declare each feature's benefit, personas, in scope, and out of scope.
8. Declare each story as `### STORY: <title>` beneath exactly one feature.
9. Express each story as `As a <persona>, when <context>, I want <need>, so that <value>.`
10. Use only personas declared by the story's feature.
11. Never omit `so that <value>`.
12. Keep fixes out of the requirements file.
13. Keep each story title identical across requirements, issue, and merge commit, and kebab-cased in the branch.
14. Record every requirements change through a `REQUIREMENTS:` commit, one per story.
