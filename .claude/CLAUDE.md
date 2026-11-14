# Pin

This repository is `@scalable.software/pin`: the `<pin-button>` web component. It is also the **reference component** — the example that the guide, the policies and the workflows in `.claude/` are written against. When they and the code disagree, one of them is wrong; say so.

It is built on the base component, `@scalable.software/component`, which lives in another repository. Never change the base component from here. When the pin needs something from it, describe the change for the human.

## Starting a session

The human opens a session with **`Yo`**. That is not the signal to start working.

1. **Prepare.** Check the branch and the working tree. Work out which piece of work comes next. Read only the documents that work needs (see "Where to find what"). Change nothing.
2. **Report.** Say what you will work on, your plan, what you checked, which documents you read, and what is unclear. Then stop.
3. **Start on `Go`.** Only the word `Go` is approval; it may be scoped ("Go, first step only").

## What always applies

- **Propose before changing a document in `.claude/`.** Say what you would change and why, and change it when the human agrees.
- **Test first.** See a spec fail before writing the code that makes it pass.
- **One concern in each commit,** named by its prefix. Commit when the human asks.
- **The human merges and releases.** Do not push, open or merge a pull request, open an issue, or release unless asked.
- **Keep the example identical.** `.claude/examples/` holds an exact copy of `src/`, `specifications/` and `test/`. When one of those changes, copy the change in the same branch.
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
| `.claude/` | the guide, the policies, the workflows, the example copy |

## Where to find what

Three sets of documents describe how components are built here. **Do not read them up front.** Each is long. Read the one that matches the work in front of you, when that work starts, and read only the part you need.

### The guide: why it works this way

`.claude/guide/framework.md` explains the framework to someone new, one section for each construct: Composition, State, Validation, Operations, Events, Gestures.

Read a section when you need to understand how a construct works before changing it, or when you have to explain it to someone.

### The policies: what a component must look like

One file for each construct, in `.claude/policies/`. Each ends with a checklist. All except `validation.md` also end with the schema for their section of the specification.

| Before you add or change… | Read |
|---|---|
| a part of the template, or a cached element | `composition.md` |
| a state, its setter or its attribute | `state.md` |
| a validator, or anything that rejects a value | `validation.md` |
| an operation | `operation.md` |
| an event, or an `on…` property | `event.md` |
| a gesture, a listener or a handler | `gesture.md` |

The data policy, `.claude/context/data.md`, is not reviewed yet. Treat it as a draft. The pin has no data.

### The workflows: how the work is done

One file for each stage, in `.claude/workflow/`.

| When you… | Read |
|---|---|
| start a piece of work, create a branch, or write a commit | `workflow.md` |
| write or change a user story | `requirements.md` |
| change the specification | `specifications.md` |
| write tests, or decide what goes in one commit | `testing.md` |
| open an issue or a pull request, or prepare a release | `github.md` |

`workflow.md` is the map: it gives the whole path from a story to a release and points to the other four. Start there when you are unsure which one applies.

### Also in `.claude/`

- `examples/` — the exact copy of the implementation, for other repositories to read. In this repository, read `src/`, `specifications/` and `test/` directly.
