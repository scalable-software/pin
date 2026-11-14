---
name: release
description: Prepare a release - list what was merged since the last one, choose the level, check the version number and the package contents, and write the notes for the consumer. Makes the release only after the human approves.
argument-hint: "[patch | minor | major]"
disable-model-invocation: true
---

# Release

Prepare everything a release needs, so the human can decide with the facts in front of them.

## Input

`$ARGUMENTS`: the level, when the human has already chosen it. Otherwise recommend one.

## Read

| For | Read |
|---|---|
| the level, the checks, the commands, the notes | `.claude/workflow/github.md` §9 |

## Steps

1. **Check the starting point.** You are on `main`, it is up to date with the remote, and the tree is clean. `npm test` passes.
2. **List the changes:** every merge since the last tag, with its issue number.

   ```text
   git log <last tag>..main --merges --format=%s
   ```

3. **Choose the level** by asking what a consumer of the package has to do.
4. **Check the number.** A number that was published once can never be used again, even after it was removed. Read the registry's whole history, not only the current versions:

   ```text
   npm view <package> time
   ```

5. **Check the contents:** `npm pack --dry-run`. The package holds only what is meant to be public.
6. **Write the notes** for the consumer: what they must do first, then one line for each change, starting with `New`, `Changed`, `Removed` or `Fixed`, ending with its issue number.

## Stop

Stop and show the level with its reason, the number, the package contents and the notes. Publishing cannot be undone, so change nothing until the human approves.

On approval:

```text
npm version <level>
git push origin main --follow-tags
gh release create v<version> --title v<version> --notes-file <file>
```

Then watch the publish workflow, and confirm with `npm view <package> version`.

## Done when

- The release exists on the tag, and the publish workflow has passed.
- The registry reports the new version.
