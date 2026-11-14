---
name: build
description: Build what the specification declares, test first, one construct at a time in the order of the concerns, as FAIL/PASS commit pairs. Use whenever a story or fix is ready to implement in a component built on `@scalable.software/component` - adding or changing a part, state, validator, operation, event, style or gesture - even when the request only says "implement" or "add".
argument-hint: "[story title, or one construct]"
---

# Build

Turn the specification change on this branch into code, one proven fact at a time.

## Input

`$ARGUMENTS`: the story, or one construct of it. With none, build everything the branch's specification change declares.

## Before you start

- You are on the work's own branch, and the tree is clean.
- The specification change is committed. A fix or a refactor has none.
- `npm test` passes.

When one of these does not hold, say which and stop.

## Read

Read each document when its step starts, and only the part named. Never read all the policies up front: each is long, and most work touches one or two.

| For | Read |
|---|---|
| the loop, and what goes in one pair | `.claude/workflow/testing.md` §4, §5 |
| a construct built from start to finish | `.claude/workflow/testing.md` §7 |
| prefixes and messages | `.claude/workflow/workflow.md` §3 |
| the order of the concerns | `.claude/workflow/workflow.md` §4 |

| Concern | Policy in `.claude/policies/` | What to test: `testing.md` |
|---|---|---|
| `COMPOSITION` | `composition.md` | §6.2 |
| `STATE` | `state.md` | §6.1, §6.3 |
| `VALIDATION` | `validation.md` | §6.4 |
| `OPERATION` | `operation.md` | §6.1, §6.5 |
| `EVENT` | `event.md` | §6.1, §6.6 |
| `STYLE` | `gesture.md` §9, §10 for a visual gesture | none: §8 |
| `GESTURE` | `gesture.md` | §6.1, §6.7 |

In a policy, read "How to Read This Policy", the numbered rules the construct needs, and the checklist. When a rule is unclear, read that construct's section of `.claude/guide/framework.md`.

## Steps

1. **List the work.** Compare the specification with `main` to find the constructs to build. Put them in the order of the concerns and show the list.
2. **For each construct, read** its policy and its part of `testing.md`.
3. **Declare it,** as one pair: the existence and value specs, then the metadata and the class member together.
4. **Give it its behaviours,** one pair for each behaviour.
5. **Complete the picture.** A spec that passes the moment it is written goes in a `TESTING:` commit.
6. **Go through the policy's checklist** before moving to the next construct.
7. **Style** has no specs. Commit one rule at a time, and look at the result with `npm run serve`.
8. **Copy the change to `.claude/examples/`,** when the repository has that folder, as an `AI:` commit.
9. **Close the branch** as `workflow.md` §6 describes: the README, the API docs, the demo page, each a `DOCUMENTATION:` commit.

One pair, every time:

```text
write the spec  →  npm test fails, for the reason the spec states  →  npm run clean.test  →  commit "… -> FAIL"
write the code  →  npm test passes, the whole suite                →  commit "… -> PASS"
```

Asking for a build is asking for these commits. Push nothing.

## Stop

Stop and report when:

- a spec fails for a reason other than the one it states, or cannot be made to fail;
- the specification turns out to be wrong or incomplete: the code never leads it, so go back to `/specify`;
- a policy and the code disagree: one of them is wrong, and the human decides which;
- the work needs a change in the base component: describe the change, and do not make it.

## Done when

- Every construct in the list is built, and its policy's checklist holds.
- `npm test` passes and `npm run build` compiles.
- The example copy is identical, where there is one.

Report the pairs you committed, and what you did not check. The next step is `/pull-request`.
