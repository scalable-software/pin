---
name: close
description: Report back once the human has released - check the release, close the cards whose work it contains with their last link, reply in each card's thread, and answer the posts the work settles. Also answers waiting posts without closing a card.
argument-hint: "[version; the latest tag when empty | reply]"
disable-model-invocation: true
---

# Close

Close the cards whose work a release contains, and say so in their threads.

## Input

`$ARGUMENTS`, one of:

| Argument | Does |
|---|---|
| a version, such as `0.3.0`; the latest tag when empty | closes the cards whose work that release contains |
| `reply` | closes nothing: it answers the waiting posts that `/inbox` found |

## Read

| For | Read |
|---|---|
| when a card is closed, and the reports | `.claude/workflow/governance.md` §5, §6 |
| the tags | `.claude/workflow/governance.md` §4.3 |
| the calls | `.claude/workflow/governance.md` §8 |
| the release, its title and its notes | `.claude/workflow/github.md` §9 |

## Steps

1. **Find the work:** read the release, and the merges it contains. Each merge title is the title of a piece of work, and of its card when it has one.

   ```text
   gh release view v<version>
   git log <previous tag>..v<version> --merges --format=%s
   ```

2. **Find the cards** with those titles in this repository's bucket. A merge without a card is named in the report; it is not carded from here. A card already completed is left as it is, and named in the report.
3. **Check the release.** Wait until the publish workflow has finished (`gh run list --limit 3`): a release that is still publishing has not failed. Then each of these must hold.

   | Check | How |
   |---|---|
   | Published | `npm view <package>@<version> version` returns the version |
   | Contents | in a temporary folder, `npm pack <package>@<version>` and unpack it: a name the release adds or changes is in `dist`. The number alone proves nothing |
   | Only `dist` | the package holds `dist` and the files npm always adds |
   | Title | the release's title is the titles of its merges, joined with ` + ` (`github.md` §9.4) |

   When a check fails, stop and close nothing. Reply in each card's thread with `[BLOCKED]` and the check that failed, and tell the human.

4. **Close each card:** add the release as its last link, tick the checklist items that are done, and set its progress to `100`. An item that is not done stays unticked, and the report names it.
5. **Reply in each card's thread** with the report after closing (`governance.md` §6). For `Consumers`, take what a consumer must do from the release notes, and name the repositories whose `package.json` depends on this package.
6. **Answer the posts the work settles,** each with its tag.

With `reply`, take only the last step: answer each waiting post with its tag. `[DONE]` says it is handled, `[REPLIED]` answers it, `[BLOCKED]` says what it waits on, and `[DECLINED]` says who should act instead.

## Stop

Stop and report to the human: each check and its result, each card closed, and each reply posted.

## Done when

- Each card whose work the release contains is completed, with the release as its last link, and its thread has the report.
- Each post the work settles has its tag.
- No card outside this repository's bucket has changed.
