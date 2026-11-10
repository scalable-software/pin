# Workflow

This document defines the implementation policy for **branching, commit sequencing, and TDD discipline**. It is the authoritative reference for how work is recorded in git history. The reference standard is the commit history of the `scalable.software/pin` component — the canonical example of this policy applied end to end.

---

# How to Read This Policy

Rules in this policy fall into three strengths:

- **Principles** are non-negotiable: the FAIL-before-PASS ordering, the one-concern-per-commit rule, the prefix vocabulary, and the identical-title traceability chain.
- **Templates** are invariant skeletons with variation points: the per-layer commit sequences activate per story depending on which layers the story touches.
- **Conventions** are canonical defaults: branch naming families, message grammar details. Deviations should be explainable at review time.

---

# 1) Traceability Chain

Work is traceable from the requirement that motivates it to the merge commit that delivers it. One title is predictably transformed across every layer:

```
<component>.requirements.md  →  issue  →  branch  →  layer commits  →  merge commit
```

| Layer | Story example | Fix example |
|---|---|---|
| Requirements | `### STORY: Visibility Control` | — |
| Issue title | `STORY: Visibility Control` | `FIX: Hidden pin still clickable` |
| Issue body | user story + Given/When/Then acceptance criteria | defect description + Given/When/Then acceptance criteria |
| Branch | `story/visibility-control` | `fix/hidden-pin-still-clickable` |
| Layer commits | `REQUIREMENTS:`, `STATE:`, `OPERATION:`, `EVENT:` … | `STATE:`, `EVENT:` … |
| Merge commit | `STORY: Visibility Control` | `FIX: Hidden pin still clickable` |

- The issue title and the merge-commit title are **identical**.
- The branch slug is the kebab-case of the title without its prefix.
- The requirements policy (`requirements.md`) defines the requirements file; this policy defines everything from the issue onward.

**Backlog levels:**

- **Feature** — a capability that delivers a benefit; a group of stories. It is declared as a `FEATURE:` section in `<component>.requirements.md` and may be tracked as a parent issue whose sub-issues are its stories. A feature is never delivered in a single merge, so `FEATURE` never appears on a branch, a commit, or a merge commit. A feature is complete when all of its stories are merged.
- **Story** — one persona's need, small enough to deliver and verify on one branch.
- **Fix** — a defect against behaviour that already exists.

# 2) Branching

- One story or fix per branch. Behavioral work is never committed directly to `main`; documentation-only changes may be.
- **Backlog branch families** mirror the backlog item type of the issue they deliver:
  - `story/<title>` — a user story declared in `<component>.requirements.md`
  - `fix/<title>` — a defect against existing behaviour
- **Non-backlog branch families** in use:
  - `migration/<component>` — component metadata migrations (see migration.md)
  - `machine/<name>` — work on the Machine host component or machine internals
  - `workflow/<name>` — app workflow work
  - `upgrade/<name>`, `refactor/<name>` — as named
  - `ai/<name>` — agent instructions and context
- A branch closes with its final `DOCUMENTATION:` commits. The closure title goes on the **merge commit** only, never on a commit added to the branch: `STORY: <title>` for stories, `FIX: <title>` for fixes, `MIGRATION: <summary>` for migrations.
- Version commits are produced by `npm version` (message is the bare version, e.g. `0.14.0`) and pushed together with their tag: `git push origin main --follow-tags`.

## 2.1) Branch Lifecycle

A backlog branch moves through the following steps, in order:

1. **Issue first** — the branch is created only after its issue exists. The branch name is derived from the issue title, never the other way round.
2. **Create** — the specialist doing the work creates the branch, after the human's `Go`, from an up-to-date `main`:
   ```
   git switch main
   git pull origin main
   git switch -c story/visibility-control
   ```
3. **Work** — commits follow the pipeline order (Section 6). The branch is pushed to origin with upstream tracking on its first push (`git push -u origin story/visibility-control`) and may be pushed at any time after that.
4. **Close** — when the branch ends with its final `DOCUMENTATION:` commits and every gate passes, the specialist pushes it and opens a pull request:
   - the pull request title is identical to the issue title: `STORY: Visibility Control`
   - the pull request body links the issue with a closing keyword: `Closes #1`
5. **Merge** — the human merges the pull request with a **merge commit** whose title is the closure title. Squash and rebase merges are not used: they would erase the FAIL/PASS history that records the component's contract.
6. **Retain** — merged branches are kept on origin, as the canonical `pin` history shows.

Non-backlog branches follow the same lifecycle; where they have no issue, step 1 does not apply and the pull request body describes the change instead of linking an issue.

# 3) Commit Anatomy

Every commit message is:

```
PREFIX: message [-> FAIL | -> PASS]
```

- `PREFIX` is an ALL-CAPS concern word followed by a colon.
- `message` is super-succinct and, for behavioral commits, **is the test sentence** (see Section 5).
- TDD pairs carry the `-> FAIL` / `-> PASS` suffix; both commits of a pair use the **identical message**, differing only in the suffix.

Canonical prefixes, in pipeline order where applicable:

| Prefix | Concern |
|---|---|
| `REQUIREMENTS:` | Adding or changing a `*.requirements.md` file |
| `SPECIFICATIONS:` | Adding or changing a `*.specifications.json` file |
| `COMPOSITION:` | Template structure, cached element references |
| `STYLE:` | CSS — one commit **per rule/selector block** |
| `STATE:` | State vocabulary, value domains, state contracts, machine regions/transitions |
| `DATA:` | Data vocabulary, context, canonical data behavior |
| `VALIDATION:` | Validators in `*.validation.ts` |
| `OPERATION:` | Public operations |
| `EVENT:` | Event vocabulary, subscription properties, emission |
| `GESTURE:` | Gesture vocabulary and wiring |
| `TESTING:` | Test-only changes: coverage completion for existing behavior, test refactors, description alignment |
| `CONFIG:` | Tooling and runner configuration (karma, wallaby, importmaps, `.mcp.json`) |
| `PACKAGE:` | Dependencies, exports/imports surface, package metadata, file removal in favor of packages |
| `DOCUMENTATION:` | Docs: README, workflows.md, policy files, gate records, generated API docs |
| `AI:` | Agent instructions and context (`.claude/**`) |
| `STORY:` | Merge-commit title for `story/<title>` branches — identical to the issue title |
| `FIX:` | Merge-commit title for `fix/<title>` branches — identical to the issue title |
| `MIGRATION:` | Merge-commit title for `migration/<component>` branches |

`STORY:`, `FIX:`, and `MIGRATION:` are closure titles: they appear only on merge commits.

# 4) TDD Pairs and Granularity

**The granularity unit is one assertion, not one layer.** Each observable fact about the component gets its own FAIL/PASS pair. A layer therefore produces a *sequence* of small pairs, not one bundled pair.

The canonical per-construct sequence (from the pin history):

1. vocabulary constant exists — one pair per constant and per member:
   - `STATE: \`Visibility\` exists -> FAIL` / `-> PASS`
   - `STATE: \`Visibility.VISIBLE\` exists -> FAIL` / `-> PASS`
2. API member exists:
   - `STATE: \`pin.visibility\` getter exists -> FAIL` / `-> PASS`
   - `STATE: \`pin.visibility\` setter exists -> FAIL` / `-> PASS`
3. each behavior, one pair per assertion:
   - `STATE: \`pin.visibility\` getter returns \`Visibility.VISIBLE\` -> FAIL/PASS`
   - `STATE: set \`pin.visibility\` to \`Visibility.HIDDEN\` updates state -> FAIL/PASS`
   - `STATE: set \`pin.visibility\` to \`null\` updates state to \`Visibility.VISIBLE\` -> FAIL/PASS`
   - `STATE: set \`pin.visibility\` to \`Visibility.HIDDEN\` sets \`visibility\` attribute to \`Visibility.HIDDEN\` -> FAIL/PASS`
   - `STATE: set \`visibility\` attribute to \`Visibility.HIDDEN\` sets \`pin.visibility\` to \`Visibility.HIDDEN\` -> FAIL/PASS`

Operations follow the same trio: `\`Operation.PIN\` exists` → `\`pin.pin\` method exists` → `Invoke \`pin.pin\` sets \`pin.status\` to \`Status.PINNED\`` — each a pair.

Non-TDD layers are still atomic single commits: one `REQUIREMENTS:` commit per story; one `STYLE:` commit per CSS rule; one `CONFIG:` commit per configuration entry; one `PACKAGE:` commit per dependency concern.

# 5) The Message Is the Test Sentence

For behavioral commits, the message is the BDD description of the behavior being pinned — not a summary of the edit:

- identifiers appear in backticks exactly as they appear in code: `` `pin.status` ``, `` `Status.PINNED` ``, `` `Operation.TOGGLE` ``
- the sentence states the observable outcome: *what is true after the transition*, not *what was changed in which file*
- reading `git log --oneline` in reverse must reconstruct the component's contract assertion-by-assertion, without opening any file

Good: `EVENT: \`pin.onpin\` listener is called when \`pin.status\` changes from \`Status.UNPINNED\` to \`Status.PINNED\` -> PASS`

Bad: `EVENT: implement pin events` (bundled, no contract information, no identifiers)

# 6) Pipeline Ordering

Commits within a story or fix follow the implementation pipeline where the touched layers apply:

```
REQUIREMENTS → SPECIFICATIONS → COMPOSITION → STYLE → STATE → VALIDATION → OPERATION → EVENT → GESTURE → DOCUMENTATION → merge (STORY | FIX)
```

- A story branch opens with the `REQUIREMENTS:` commit that records the story in `<component>.requirements.md`, unless the story is already recorded there.
- A fix branch normally has no `REQUIREMENTS:` commit: a defect is measured against requirements that already exist.

After the merge: version commit (`npm version`), then trailing `PACKAGE:` / `DOCUMENTATION:` chores (API docs generation, README updates).

# 7) Policy Checklist

1. Every story or fix starts as an issue whose title is `STORY: <title>` or `FIX: <title>` and whose body carries Given/When/Then acceptance criteria.
2. Every story is recorded in `<component>.requirements.md` under its feature, with the same title as its issue.
3. One branch per story or fix, named `story/<title>` or `fix/<title>`; other work uses an established non-backlog family.
4. Create a backlog branch only after its issue exists, from an up-to-date `main`, after the human's `Go`.
5. Close the branch with a pull request whose title is identical to the issue title and whose body contains `Closes #<issue>`.
6. Merge with a merge commit — never squash or rebase — and keep the merged branch on origin.
7. Every commit: `PREFIX: message`, one concern, one atomic change.
8. Every behavioral change: FAIL commit first, PASS commit second, identical message, `->` suffix.
9. One assertion per pair — vocabulary member, API member existence, and each behavior separately.
10. Message is the test sentence with backticked identifiers.
11. Non-TDD layers: one atomic change per commit (per story, per CSS rule, per config entry).
12. Layer commits follow pipeline order.
13. The branch closes with `DOCUMENTATION:` commits; the merge commit carries the closure title, identical to the issue title.
14. `FEATURE` names a group of stories only — never a branch, commit, or merge commit.
15. Version via `npm version`; push with `--follow-tags`.
