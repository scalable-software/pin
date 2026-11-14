---
name: audit
description: Check a component against the policies - its specification, source and tests against each policy's checklist - and report every finding with its evidence, changing nothing. Use whenever someone asks whether a component complies, follows the policies or the canon, is ready to be brought up to date, or wants a review of a component as a whole.
argument-hint: "[policies to check; all when empty]"
---

# Audit

Find where a component and the policies disagree. Report; change nothing.

## Input

`$ARGUMENTS`: the policies to check, such as `state event`. With none, check all of them.

## Read

Do not read the policies yourself. Each check runs in its own subagent, so that only the findings come back.

| Check | The subagent reads |
|---|---|
| composition | `.claude/policies/composition.md` |
| state | `.claude/policies/state.md` |
| validation | `.claude/policies/validation.md` |
| operation | `.claude/policies/operation.md` |
| event | `.claude/policies/event.md` |
| gesture | `.claude/policies/gesture.md` |
| tests | `.claude/workflow/testing.md` §6, §9 |

## Steps

1. **Run the two automatic checks** and keep their output.

   ```text
   npm run check.specification
   npm test
   ```

2. **Start one subagent for each check,** all at once. Give each this brief, with the names filled in:

   > Read `<document>`. Then read the component: `specifications/`, `src/` and `test/unit/`. Go through the document's checklist item by item. For each item answer `holds`, `fails` or `does not apply`, and for every `fails` give the file and line and one sentence saying what is there instead. Where the checklist is not enough to decide, read the numbered rule it summarises. Change no file. Return the list and nothing else.

3. **Check each `fails` yourself** by opening the file and line. Drop what does not hold up.
4. **Say which side looks wrong.** When a policy and the code disagree, either may be the one to correct; give your view and its reason.

## Report

One table, most serious first:

| # | Policy | Checklist item | What is there | Where | Which side looks wrong |
|---|---|---|---|---|---|

Then, in a line or two each: the result of the two automatic checks, what you could not check, and the pieces of work the findings add up to, each as a title that `/story` could take.

## Done when

- Every checklist item of every policy asked for has an answer.
- Every finding names a file and a line, and you have opened each one.
- No file has changed.
