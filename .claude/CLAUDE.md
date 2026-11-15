# Pin

This repository is `@scalable.software/pin`: the `<pin-button>` web component. It is also the **reference component**.

The guide, the policies and the workflows in `.claude/` hold for every component, and each repository applies them in the context of its own component. They are illustrated with the pin and, where the pin has no example, with the title. The pin shows how the pieces link: a rule, the specification entry it shapes, the code that follows it and the test that proves it. It is an illustration, not a model to copy: another component's states, operations, events, gestures, tests and specification come from its own requirements, never from the pin's. When the policies and the code here disagree, one of them is wrong; say so.

The package in `.claude/` is the canon. It is changed in the title first, then copied here and to every web component. Propose a change to it in the title, not here; this repository's own file is this `CLAUDE.md`.

It is built on the base component, `@scalable.software/component`, which lives in another repository. Never change it from here. When the pin needs something from it, describe the change for the human.

## Starting a session

The human opens a session with **`Yo`**. That is not the signal to start working.

1. **Prepare.** Check the branch and the working tree. Work out which piece of work comes next. Read only the documents that work needs (see "Where to find what"). Change nothing.
2. **Report.** Say what you will work on, your plan, what you checked, which documents you read, and what is unclear. Then stop.
3. **Start on `Go`.** Only the word `Go` is approval; it may be scoped ("Go, first step only").

The pin has no bucket on the Planner boards. Its work comes from the human directly, without a card (`governance.md` §5): it starts at step 1 of the path and writes nothing on the board.

## What always applies

- **Propose before changing a document in `.claude/`.** Say what you would change and why, and change it when the human agrees.
- **Test first.** See a spec fail before writing the code that makes it pass.
- **One concern in each commit,** named by its prefix. Commit when the human asks.
- **The human merges and releases.** Do not push, open or merge a pull request, open an issue, or release unless asked.
- **Keep the example identical.** `.claude/examples/` holds an exact copy of `src/`, `specifications/` and `test/`. When one of those changes, copy the change in the same branch. Every other repository reads the pin through that copy.
- **Check, then claim.** Run the suite or try it in a browser before saying something works, and say what you did not check.

## Commands

| Command | What it does |
|---|---|
| `npm test` | checks the specification, compiles, and runs the suite in headless Chrome |
| `npm run check.specification` | checks the specification against the schema in each policy |
| `npm run build` | compiles to `dist/` |
| `npm run serve` | builds and opens the demo page |
| `npm run document` | regenerates the API docs in `docs/` |
| `npm run clean.test` | removes compiled test output; run it after a failed `npm test` |

## Layout

| Path | Holds |
|---|---|
| `specifications/` | the requirements file and the specification |
| `src/` | the component, its metadata, its validators, its template and its stylesheet |
| `test/unit/` | three test files: metadata, validation, component |
| `demo/` | the demo page |
| `docs/` | generated API docs; never edit by hand |
| `.claude/` | the guide, the policies, the add-on guides, the workflows, the skills, the example copy |

## Where to find what

Three sets of documents describe how components are built here. **Do not read them up front.** Each is long. Read the one that matches the work in front of you, when that work starts, and read only the part you need.

### The guide: why it works this way

`.claude/guide/framework.md` explains the framework to someone new, one section for each construct: Composition, State, Data, Validation, Operations, Events, Gestures.

Read a section when you need to understand how a construct works before changing it, or when you have to explain it to someone.

### The policies: what a component must look like

One file for each construct, in `.claude/policies/`. Each ends with a checklist. All except `validation.md` also end with the schema for their section of the specification.

| Before you add or change… | Read |
|---|---|
| a part of the template, or a cached element | `composition.md` |
| data: its type, its validator, or an operation that creates, loads or changes it | `data.md` |
| a state, its setter or its attribute | `state.md` |
| a validator, or anything that rejects a value | `validation.md` |
| an operation | `operation.md` |
| an event, or an `on…` property | `event.md` |
| a gesture, a listener or a handler | `gesture.md` |

`data.md` is illustrated with the title, not the pin, because the pin has no data.

### The add-ons: how a component uses one

One file for each add-on, in `.claude/add-ons/`. Each explains the pieces an add-on brings, who owns each of them, and how they work together. They are guides, not policies: they have no checklist to audit against and no schema. The pin uses no add-on.

| When you… | Read |
|---|---|
| add a text that depends on the language, or change how a component follows the language | `localizer.md` |

### The workflows: how the work is done

One file for each stage, in `.claude/workflow/`.

| When you… | Read |
|---|---|
| start a piece of work, create a branch, or write a commit | `workflow.md` |
| write or change a user story | `requirements.md` |
| change the specification | `specifications.md` |
| write tests, or decide what goes in one commit | `testing.md` |
| open an issue or a pull request, or prepare a release | `github.md` |
| change the demo page | `demo.md` |
| take up a card, read or answer a post, or close a card | `governance.md` |

`workflow.md` is the map: it gives the whole path from a story to a release, and points to the other six. Start there when you are unsure which one applies.

### Also in `.claude/`

- `examples/` — the exact copy of the implementation, for other repositories to read. In this repository, read `src/`, `specifications/` and `test/` directly.
