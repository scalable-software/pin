---
name: specify
description: Derive the specification change from a user story - create the branch, record the story in the requirements file, declare what it needs in the specification and check the result. Use whenever a story or issue is ready to be turned into states, operations, events, gestures or composition, before any code or test is written.
argument-hint: "[issue number or story title]"
---

# Specify

Take one story from its issue to a checked change in the specification. Write no code and no test.

## Input

`$ARGUMENTS`: the issue number or the story title. Read the story and its acceptance criteria from the issue (`gh issue view <number>`). Without an issue, stop and point to `/story`.

## Read

Read each document when its step starts, and only the part named.

| For | Read |
|---|---|
| the branch and its family | `.claude/workflow/workflow.md` §2 |
| recording the story | `.claude/workflow/requirements.md` §6, §8 |
| the five questions, writing an entry, the checks | `.claude/workflow/specifications.md` §3, §4, §5 |
| the fields of an entry | the policy for that section in `.claude/policies/`: the part that applies it to a specification, and its schema |

## Steps

1. **Create the branch.** Update `main`, then create `<family>/<title>` from the issue's title. When the tree is not clean, or the current branch is not merged, say so and stop.
2. **Triage** when the change is not obvious: find what it touches before changing anything.
3. **Record the story,** when it lasts, under its feature in `specifications/<component>.requirements.md`. Update the feature's scope where the story widens it.
4. **Ask the five questions,** in order: Composition, States, Operations, Events, Gestures. Report every answer with its reason, the "no" answers too.
5. **Write an entry for each "yes"** in `specifications/<component>.specifications.json`. The policy's schema gives the fields; the story and its criteria give the values. Choose each name once, in the words of the story.
6. **Check the result** the four ways `specifications.md` §5 describes. The last one is a command:

   ```text
   npm run check.specification
   ```

## Stop

Stop and show:

- the story as recorded, and what changed in the feature's scope;
- each new entry;
- a table of each acceptance criterion and the entry that meets it.

Commit when the human approves: one `REQUIREMENTS:` commit, then one `SPECIFICATIONS:` commit.

Stop earlier when a criterion cannot be met by any entry, or an entry cannot be traced to a criterion. One of the two is wrong, and the human decides which.

## Done when

- `npm run check.specification` passes.
- Every criterion is met by something declared, and every new entry traces to a criterion.
- Both commits are on the branch.

The next step is `/build`.
