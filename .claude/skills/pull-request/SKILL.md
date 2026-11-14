---
name: pull-request
description: Check that the current branch is ready, push it, open its pull request with the issue's title, and wait for the test check.
argument-hint: "[issue number]"
disable-model-invocation: true
---

# Pull Request

Hand the finished branch to the human for review.

## Input

`$ARGUMENTS`: the issue number. Without one, find the open issue whose title matches the branch. Without an issue, stop and point to `/story`.

## Read

| For | Read |
|---|---|
| what must hold first, the pull request, the check | `.claude/workflow/github.md` §6 |
| the merge, and what follows it | `.claude/workflow/github.md` §7, §8 |

## Steps

1. **Check the branch.** Each must hold; when one does not, say which and stop.
   - `npm test` passes and `npm run build` compiles.
   - The tree is clean.
   - The README and the API docs are accurate.
   - `.claude/examples/` is identical to `src/`, `specifications/` and `test/`, where the repository has it.
   - `main` has no unpushed commits.
   - The branch is not built on a branch that is still unmerged.
2. **Push the branch.**
3. **Open the pull request** against `main`.
   - The title is the issue's title, character for character.
   - The body is `Closes #<issue>`, then a line or two naming work that goes beyond the issue.
   - No generated-by footer.
4. **Wait for the test check:** `gh pr checks --watch`. "No checks reported" straight after opening means the check has not appeared yet; run it again.

## Stop

Stop when the check has passed, and report the pull request's link. The human reviews and merges.

Merge only when the human asks, this time. Then:

- merge with a merge commit whose title is the issue's title and whose body repeats it;
- keep the branch;
- switch to `main`, pull, and run `npm test` when the branch could have changed behaviour.

## Done when

- The pull request is open, with the issue's title, and its check has passed.
- You have reported what was checked and what was not.
