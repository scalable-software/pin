# GitHub: Issues, Pull Requests and Releases

This document describes how a piece of work moves through GitHub: from an issue, through a pull request, to a release.

It is a workflow. How the work itself is done is described elsewhere: how to test it in `testing.md`, and what a component must look like in `.claude/policies/`.

The examples are from the `pin` component.

---

# 1) One Title From Start to Finish

Every piece of work has one title, and that title appears at every stage.

| Stage | Example |
|---|---|
| Issue | `STORY: Flat Appearance` |
| Branch | `story/flat-appearance` |
| Pull request | `STORY: Flat Appearance` |
| Merge commit | `STORY: Flat Appearance` |
| Release notes | `New: … (#17)` |

The title is chosen once, when the issue is opened. Everything after it is derived from it, never the other way round.

# 2) Who Does What

| Step | Who |
|---|---|
| Define the work, open the issue, create the branch, do the work, open the pull request | the developer |
| Review and merge the pull request | the human |
| Decide on a release and make it | the human |

The human may ask the developer to merge once the test check has passed. That is a decision made each time, not a standing permission.

# 3) Define the Work

Before anything is opened on GitHub, the work is written down as a user story with acceptance criteria.

**The story** says who needs something, when, what, and why:

```text
As a <persona>, when <context>, I want <need>, so that <value>.
```

**The acceptance criteria** say what must be true when the work is done, each one as Given, When, Then:

```text
Given <condition>, When <action>, Then <expectation>.
```

Work that does not look like a feature is still written this way. Upgrading a dependency is a valid story: it has a persona, a need and a value.

Then ask one question: **does this story describe something that stays true for the life of the component?**

- If it does, it also goes in `<component>.requirements.md`.
- If it describes a one-time event, such as an upgrade, it lives in its issue only.

# 4) Open the Issue

The issue is opened before the branch is created.

## 4.1) The type

The title starts with the type of the work. The type is the family of the branch that will carry it, in capitals.

| Type | Branch family | The work |
|---|---|---|
| `FEATURE` | `feature/` | a new feature: all of its stories, delivered together |
| `STORY` | `story/` | one persona's need |
| `FIX` | `fix/` | a defect in behaviour that already exists |
| `CHORE` | `chore/` | maintenance that changes no behaviour |
| `DOCS` | `docs/` | documentation only |
| `UPGRADE` | `upgrade/` | a dependency or tool moved to a newer version |
| `REFACTOR` | `refactor/` | code restructured without changing its behaviour |
| `AI` | `ai/` | agent instructions and context |

A story is always a valid choice when the work has a persona, a need and a value.

## 4.2) The title and the body

The title is `TYPE: Title`. The body is the story, then the acceptance criteria.

```markdown
As a **host application**, when I place the pin inside a toolbar, I want it to appear without its own border and shadow, so that the toolbar reads as one surface.

## Acceptance criteria

- **Given** a pin with no `appearance` attribute, **When** it is rendered, **Then** `pin.appearance` is `floating` and the pin shows its border and shadow.
- **Given** a pin, **When** `appearance` is set to `flat`, by attribute or by property, **Then** `pin.appearance` is `flat` and the pin shows no border and no shadow.
```

The type is carried by the title. Issues have no labels.

## 4.3) A feature and its stories

A feature is a group of stories.

- The feature has a parent issue, `FEATURE: <title>`.
- Each story has its own issue, with its own acceptance criteria, as a sub-issue of the feature.
- A story that belongs to no feature stands alone.

Parent issues with sub-issues have not yet been used in practice.

# 5) Create the Branch

The branch starts from an up-to-date `main` and is named after the issue: the family, then the title in lower case with hyphens.

```text
git switch main
git pull origin main
git switch -c story/flat-appearance
```

The branch follows the grouping of the work:

- the stories of one feature are delivered together on one `feature/<title>` branch, one after another, never interleaved;
- a story that stands alone is delivered on its own `story/<title>` branch.

# 6) Open the Pull Request

## 6.1) Before opening it

- The work is done and the suite passes.
- The README and the API docs are updated where the change made them inaccurate.
- `main` has no unpushed commits. If it has, push them first, or they appear inside the pull request.
- If the branch was built on another branch that is not merged yet, wait for that one to be merged. Otherwise the pull request shows both sets of commits.

## 6.2) The pull request

Push the branch, then open the pull request against `main`.

- **The title** is identical to the issue title. It becomes the title of the merge commit.
- **The description** says only what the history does not: `Closes #<issue>`, followed by a line or two naming work on the branch that goes beyond the issue.
- **No generated-by footer.**

```markdown
Closes #17

The flat pin also loses its rounded corners, and the demo page shows it inside a toolbar.
```

## 6.3) The test check

The pull request runs the test suite. Wait for it to pass.

The check takes a few seconds to appear on a new pull request. "No checks reported" straight after opening does not mean none will run.

# 7) The Merge

The human reviews the pull request and merges it.

- The merge is a **merge commit**, so every commit on the branch is kept in the history.
- Its title is the issue title, and its body repeats the title.
- The branch is kept after the merge.
- The issue closes by itself, through `Closes #<issue>`.

A feature branch is merged with the title of the feature: `FEATURE: <title>`.

# 8) After the Merge

```text
git switch main
git pull origin main
```

Then run `npm test`, but only when the branch could have changed how the component behaves.

| The branch changed | Run the tests on `main`? |
|---|---|
| source code, or a dependency | yes |
| packaging, or documentation | no |

# 9) The Release

A release is made by the human. It contains every merge since the previous release.

## 9.1) Choose the level

The largest change sets the level. Ask what a consumer of the package has to do.

| Level | The consumer must |
|---|---|
| Patch | do nothing: fixes, packaging, documentation |
| Minor | do nothing, and gains a capability |
| Major | change their own code or setup |

Below `1.0.0`, a change the consumer must act on is a minor. `1.0.0` declares the public contract stable.

## 9.2) Check the number and the contents

- **The number must never have been published.** A version number that was published once can never be used again, even after it was removed. Read the registry's full history before choosing: `npm view <package> time`.
- **The package must contain only what is meant to be public.** List it with `npm pack --dry-run`.

## 9.3) Make the release

1. `npm version <level>`. This creates the version commit, whose message is the bare version, and the tag.
2. `git push origin main --follow-tags`.
3. Create the GitHub release on the new tag. Creating it starts the publish workflow, which runs the tests and publishes to npm.
4. Watch the publish workflow, and confirm the version on npm with `npm view <package> version`.

## 9.4) Write the notes for the consumer

- The title is the tag, for example `v0.2.2`.
- The description opens with what the consumer must do, when there is anything.
- Then one line for each change, in the consumer's terms, ending with its issue number.
- Each line starts with `New`, `Changed`, `Removed` or `Fixed`, in that order.
- A change with no effect on the consumer says so.

```markdown
Requires `@scalable.software/component` `^0.5.0`.

- New: `onevent`, one handler for every event the pin dispatches, from base component 0.5.0 (#9)
- New: TypeScript types are declared in `exports` (#11)
- Changed: the publish and test workflows are updated; the package is unaffected (#13, #15)
- Removed: everything except the built files in `dist/` from the published package (#11)
```

# 10) Checklist

For each piece of work:

1. Write the user story and its acceptance criteria.
2. Decide whether the story lasts; if it does, record it in the requirements file.
3. Open the issue, titled `TYPE: Title`, with the story and the criteria as its body.
4. Update `main` and create the branch `<family>/<title>`.
5. Do the work, and update the README and API docs where the change made them inaccurate.
6. Push `main` first if it has unpushed commits; wait if the branch is built on an unmerged one.
7. Push the branch and open the pull request: the issue's title, `Closes #<issue>`, a line or two, no footer.
8. Wait for the test check to pass.
9. **Human:** review and merge with a merge commit titled with the issue title.
10. Switch to `main` and pull; run the tests when behaviour could have changed.

For each release, by the human:

11. Decide to release and choose the level.
12. Check that the number was never published, and what the package will contain.
13. `npm version <level>`, then `git push origin main --follow-tags`.
14. Write the notes for the consumer and create the release on the tag.
15. Watch the publish workflow and confirm the version on npm.
