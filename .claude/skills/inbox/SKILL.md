---
name: inbox
description: Read what is waiting for this repository - its open cards on the Planner board, highest priority first, the threads of those cards, and the posts addressed to it that it has not answered - and report, changing nothing. Use when a session starts, before choosing the next piece of work, and whenever someone asks what is waiting, what a card says, or whether there are posts.
argument-hint: "[card title; every open card when empty]"
---

# Inbox

Find out what is waiting for this repository. Report; change nothing.

## Input

`$ARGUMENTS`: a card's title, to read that card and its thread only. With none, read every open card.

## Read

| For | Read |
|---|---|
| cards, posts and tags | `.claude/workflow/governance.md` §3, §4 |
| the calls | `.claude/workflow/governance.md` §8.1 |
| the ids of the team, the channel and the plans, and the bucket names that differ | the team charter, `Intuitive.Pathways/.claude/CLAUDE.md` |

## Steps

1. **Find the bucket:** the one on the plan **Components** that carries this repository's name, apart from capitals, or the exception the team charter names. Without a team charter or a bucket, say so and stop: the repository is not on the board.
2. **List the open cards:** progress below `100`, highest priority first, and within a priority in the board's order (`orderHint`, ascending).
3. **Read each card's details:** its description, its checklist and its links.
4. **Find each card's thread** by its subject, `<card title> · <bucket>`, and read every reply. A card without a thread is a finding.
5. **Find the posts waiting for this repository:** every post whose routing line names this repository or `all`, in those threads and in the topic threads, that has no reply from this repository with a tag (`governance.md` §4.3). Read the threads back to the older of two moments: the creation of the oldest open card, and this repository's last reply with a tag. When there is neither, read the threads of the last 30 days.
6. **Find where each card in progress stands** in the repository: its issue, its branch and its pull request.

   ```text
   gh issue list --state all --search "<card title> in:title"
   git branch -a
   gh pr list --state all --search "<card title> in:title"
   ```

## Report

One table of the open cards, in order:

| # | Card | Priority | Progress | Thread | Where the work stands |
|---|---|---|---|---|---|

Then, in a line or two each:

- each waiting post: its sender, its thread, and the answer it needs;
- what is unclear or wrong on a card, for the readiness report;
- the card to work on next, and why.

## Done when

- Every open card and every waiting post is listed.
- Nothing has been written to the board, the channel, GitHub or the repository.

At the start of a session, the readiness report comes next: what you will work on, and your plan. Then wait for `Go`.
