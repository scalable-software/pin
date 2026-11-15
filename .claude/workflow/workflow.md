# Workflow

This document describes how a piece of work moves from an idea to a release, and on to the close of its card. It is the map: it gives the whole path in order, and it holds the two parts that have no document of their own, branches and commits.

Each stage of the path has its own document.

| Document | What it covers |
|---|---|
| `requirements.md` | recording the intent: features and stories |
| `specifications.md` | deriving the contract from a story |
| `testing.md` | building and proving each construct, test first |
| `github.md` | issues, pull requests and releases |
| `demo.md` | the demo page: what it shows, how it is built, and when it changes |
| `governance.md` | cards and posts: how work arrives from the board, and how it is reported back |

What a component must look like is not workflow. That is in `.claude/policies/`.

---

# 1) The Path

For each piece of work:

| # | Step | Described in |
|---|---|---|
| 1 | Write the user story and its acceptance criteria | `requirements.md`, `github.md` |
| 2 | Open the issue, titled with its type | `github.md` |
| 3 | Update `main` and create the branch `<family>/<title>` | Section 2 |
| 4 | Triage the change when it is not obvious: find out what it touches before changing anything | — |
| 5 | Record the story in the requirements file, when it lasts | `requirements.md` |
| 6 | Declare what the story needs in the specification | `specifications.md` |
| 7 | Build each construct, test first, in the order of the concerns, running the check that fits each change | Sections 3 to 5, `testing.md` |
| 8 | Update the README and the API docs where the change made them inaccurate | Section 6 |
| 9 | Push the branch and open the pull request | `github.md` |
| 10 | Wait for the test check to pass | `github.md` |
| 11 | **Human:** review and merge, with the issue title as the merge title | `github.md` |
| 12 | Switch to `main` and pull; test when behaviour could have changed | `github.md` |

For each release, by the human, or by the developer when the human asks, that time:

| # | Step | Described in |
|---|---|---|
| 13 | Decide to release and choose the level | `github.md` |
| 14 | Check the number and what the package will contain | `github.md` |
| 15 | `npm version <level>`, then push with the tag | `github.md` |
| 16 | Write the title and the notes for the consumer, and create the release | `github.md` |
| 17 | Watch the publish workflow and confirm the version on npm | `github.md` |

After each release:

| # | Step | Described in |
|---|---|---|
| 18 | Close the cards whose work the release contains, and report in their threads | `governance.md` |

The work arrives as a card, and ends when its card is closed: `governance.md` §5 gives the card's part in the steps of the path. Work without a card starts at step 1 and ends at step 17.

Not every piece of work takes every step. A story that does not last skips step 5. A story that changes nothing the component offers skips step 6. A chore may go from step 4 straight to the change.

# 2) Branches

## 2.1) One piece of work, one branch

A branch carries one piece of work: the one its issue describes. It starts from an up-to-date `main` and is named `<family>/<title>`, the title in lower case with hyphens.

```text
git switch main
git pull origin main
git switch -c story/flat-appearance
```

## 2.2) The family

The family says what kind of work the branch carries. It is the type of the issue, in lower case.

| Family | The work | FAIL/PASS pairs |
|---|---|---|
| `feature/` | a new feature: all of its stories, one after another | one for each fact; none for a story that changes no behaviour |
| `story/` | one persona's need | one for each fact; none when the story changes no behaviour |
| `fix/` | a defect in behaviour that already exists | always: the first pair reproduces the defect; none when the fix changes only the layout |
| `refactor/` | code restructured without changing its behaviour | none: the existing tests must stay green |
| `upgrade/` | a dependency or tool moved to a newer version | none |
| `chore/` | maintenance that changes no behaviour | none |
| `docs/` | documentation only | none |
| `ai/` | agent instructions and context | none |

A pair is needed only where a commit changes behaviour that a test can observe.

A fix that changes only the layout, in style rules that no state selects, has no pair: no spec reads how the component is drawn (`testing.md` §8). It is one `STYLE:` commit, checked in the browser with values that show the defect, and the pull request says what was checked.

## 2.3) Keep branches short and merge them in order

A branch that is built on another unmerged branch cannot be merged, or even reviewed on its own, until the one beneath it is. Finish and merge a branch before starting the next one whenever the next does not strictly need it.

# 3) Commits

## 3.1) One concern, one commit

Every commit changes one thing, and its message is:

```text
PREFIX: message
```

The prefix names the concern. The message says what is now true.

A commit carries no `Co-Authored-By` trailer: it never names Claude as a co-author (`github.md` §2).

## 3.2) The prefixes

| Prefix | The concern |
|---|---|
| `REQUIREMENTS:` | the requirements file |
| `SPECIFICATIONS:` | the specification |
| `COMPOSITION:` | the template and the cached elements |
| `STATE:` | a state: its metadata, getter, setter and reflection |
| `DATA:` | a data item: its metadata, getter, setter, ownership and synchronization |
| `VALIDATION:` | a validator, and a setter or operation rejecting a value |
| `OPERATION:` | an operation |
| `EVENT:` | an event: its metadata, subscription property and dispatch |
| `STYLE:` | the stylesheet |
| `GESTURE:` | a gesture: its metadata, listener and handler |
| `TESTING:` | specs for behaviour that already exists |
| `DOCUMENTATION:` | the README, the demo page and the generated API docs |
| `PACKAGE:` | dependencies and package metadata |
| `CONFIG:` | tooling: the test runner, the build, the workflows |
| `AI:` | agent instructions and context, in `.claude/` |

The type of an issue — `STORY`, `FEATURE`, `FIX`, `CHORE` and the others — is never a commit prefix. It appears once, as the title of the merge commit.

## 3.3) The message

**A pair** states one fact about the component. Both commits carry the same message and differ only in the suffix.

```text
STATE: set `pin.appearance` to `Appearance.FLAT` updates state -> FAIL
STATE: set `pin.appearance` to `Appearance.FLAT` updates state -> PASS
```

- Identifiers are in backticks, exactly as they appear in the code.
- The message states an outcome — what is true afterwards — not what was edited.
- What belongs in one pair is described in `testing.md`: one fact about one construct.

**A single commit** says what it does, starting with a verb.

```text
SPECIFICATIONS: Declare the `appearance` state
STYLE: `:host([appearance="flat"]) .icon` has no border colour and no shadow
DOCUMENTATION: Describe the `appearance` state in the README
```

**How small a single commit is:**

| Concern | One commit for each |
|---|---|
| `REQUIREMENTS:`, `SPECIFICATIONS:` | story |
| `STYLE:` | rule |
| `CONFIG:`, `PACKAGE:` | setting or dependency |
| `TESTING:` | fact |

The version commit is made by `npm version`. Its message is the bare version, such as `0.2.2`.

## 3.4) What the history is for

Read from oldest to newest, the commits of a branch state the component's contract one fact at a time, without opening a file. That is the test of a good message: could someone rebuild the specification from the log?

# 4) The Order of the Concerns

A feature or story is built in this order. Each concern uses only what came before it.

```text
REQUIREMENTS → SPECIFICATIONS → COMPOSITION → STATE → DATA → VALIDATION → OPERATION → EVENT → STYLE → GESTURE → DOCUMENTATION
```

- Composition comes first because everything else refers to its parts.
- Data comes after state, because a data item synchronizes the states computed from it.
- An operation changes a state or data, so they exist first; an event reports that change, so it comes after both.
- Style comes after the states it reacts to, and a gesture comes last because it calls an operation on a part.

A concern the work does not touch is skipped.

Within a construct, the next concern may be needed before the current one is finished. A state's setter rejects a value by calling its validator, so the validator's commits come in the middle of the state's. Follow the order as far as each fact allows, and never write code that the next fact does not need yet.

# 5) Building, Test First

Each construct is declared, and then given its behaviours one at a time, with a failing run before every change. `testing.md` describes the loop, what to test for each kind of construct, and what goes in one commit.

Two checks run before any test: the specification is checked against the schema of each policy, and the code is compiled. A branch is ready when `npm test` passes and the build compiles.

## 5.1) The order of a class's members

Every class in `src/` lists its members in this order:

1. static getters, then static properties, in the order of the example: `Tag`, `Attributes`, `Template`
2. static methods
3. private properties
4. protected properties
5. public properties
6. the constructor
7. public getters and setters: first the pairs that are public on both sides, then each public getter whose setter is private
8. protected getters and setters
9. private getters and setters
10. public methods
11. protected methods, with `_attributeHandlers` first, beside the lifecycle hooks, although its value is an object
12. private methods

A member whose value is a function, such as `public hide = () => …`, is a method. A getter and its setter always stay together. A commit that only moves members back into this order changes no behaviour, and is never mixed with one that does.

# 6) Closing the Branch

Before the pull request, bring everything that describes the component back in step with it.

- **The README,** where the change made it inaccurate.
- **The API docs,** regenerated with `npm run document` when the public surface changed.
- **The demo page,** when there is something new to see, as `demo.md` describes.

These are the last commits on the branch, each a `DOCUMENTATION:` commit. The branch has no closing commit of its own: its title is given to the merge commit.

# 7) Checklist

1. Follow the path in order: story, issue, branch, requirement, specification, constructs, documentation, pull request.
2. Carry one piece of work on one branch, named `<family>/<title>`, started from an up-to-date `main`.
3. Merge a branch before building another on top of it, whenever possible.
4. Change one thing in each commit, and name its concern in the prefix.
5. Never use an issue type as a commit prefix; it belongs to the merge commit.
6. Write a pair wherever a commit changes behaviour a test can observe: FAIL first, then PASS, with the same message.
7. State an outcome in the message, with identifiers in backticks.
8. Build in the order of the concerns, skipping the ones the work does not touch.
9. Close the branch with its `DOCUMENTATION:` commits, with `npm test` passing and the build compiling.
10. List a class's members in the order of §5.1: static, private, protected and public properties, the constructor, the getters and setters, then the methods.
