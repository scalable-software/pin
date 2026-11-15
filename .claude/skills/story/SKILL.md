---
name: story
description: Turn a card or a need into a user story with acceptance criteria and the text of its GitHub issue, then open the issue once the human approves.
argument-hint: "[the card's title, or the need in your own words]"
disable-model-invocation: true
---

# Story

Define one piece of work: its story, its acceptance criteria, its type and its title.

## Input

`$ARGUMENTS`: the card's title, or the need. With a card, read the card and its thread (`.claude/workflow/governance.md` §8.1): the card's title is the issue's title. When the need is missing or unclear, ask for it before writing anything.

## Read

| For | Read |
|---|---|
| the form of a story, and personas | `.claude/workflow/requirements.md` §4, §5 |
| whether the story goes in the requirements file | `.claude/workflow/requirements.md` §6 |
| acceptance criteria, the type, the title and the body | `.claude/workflow/github.md` §3, §4 |
| the card's part | `.claude/workflow/governance.md` §5 |

## Steps

1. **Start the card,** when there is one and the human has said `Go` to it: set it in progress, and add the plan the human approved as its checklist (`governance.md` §5, step 4; the calls are in §8.2).
2. **Write the story** in its one form. State a need, not a solution: name no construct and no API. With a card, take the story from its description; when the description is not a story, such as the defect of a fix, write the story from it.
3. **Write the acceptance criteria,** each as Given, When, Then. Include what must stay as it is.
4. **Choose the type and the title.** The type is the family of the branch that will carry the work. The title is chosen once and used at every later stage, so choose it with care. With a card, both are the card's.
5. **Say whether the story lasts,** and if it does, which feature in `specifications/<component>.requirements.md` it belongs under. Do not change the file: that is the first commit on the branch.
6. **Show the draft:** the title, then the body exactly as the issue will carry it.

## Stop

Stop after the draft. Open nothing until the human approves the title and the body.

On approval, open the issue with the title and the body, without labels:

```text
gh issue create --title "TYPE: Title" --body-file <file>
```

With a card, link the issue to it (`governance.md` §5, step 5; §8.2).

## Done when

- The issue exists, and you have reported its number and its title.
- The card, when there is one, is in progress, holds the plan as its checklist, and links the issue.
- You have named the branch the work will use: `<family>/<title>`.

The next step is `/specify`.
