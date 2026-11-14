---
name: reverse
description: Reverse-engineer a component's specification and requirements from its existing implementation and test suite, as drafts for the human to confirm.
argument-hint: "[specification | requirements; both when empty]"
disable-model-invocation: true
---

# Reverse

Write down what an existing component already is: its specification from the code, its stories from the tests.

This is the one case where the specification is written from the code, because there is nothing else to write it from. Once the human confirms the result, the usual order applies again: the story, then the specification, then the code.

## Input

`$ARGUMENTS`: `specification` or `requirements`, to produce one of the two. With none, produce both.

## Read

Read each document when its step starts, and only the part named.

| For | Read |
|---|---|
| the fields of each section | the policy for that section in `.claude/policies/`: the part that applies it to a specification, and its schema |
| what the specification leaves out | `.claude/workflow/specifications.md` §4.2 |
| features, stories, personas, what stays out | `.claude/workflow/requirements.md` §3, §4, §5 |
| a finished requirements file | `.claude/workflow/requirements.md` §11 |

## Steps

1. **Look at what exists** in `specifications/`. Never overwrite a file that is there: for that file, produce the difference in your report instead of writing.
2. **Derive the specification,** one section at a time, in order.

   | Section | Look in |
   |---|---|
   | Composition | the template; the cached elements |
   | States | the attribute, state and value lists in the metadata; each getter and setter |
   | Operations | the operation list in the metadata; the class members |
   | Events | the event list in the metadata; each dispatch and what it carries |
   | Gestures | the gesture list in the metadata; the listeners and their handlers; interaction rules in the stylesheet |

3. **Check its form:** `npm run check.specification`, where the repository has it.
4. **Collect the acceptance criteria** from the test suite: each suite's given, when and then is one criterion. They stay in the tests; use them to find the stories.
5. **Group the criteria into stories,** and the stories into features, in the form the requirements workflow gives. The code does not say who needed something or why, so end every statement you had to guess with `*(inferred)*`.
6. **List what does not line up.** Describe; do not judge and do not fix.
   - behaviour in the code that no spec covers;
   - specs for something the metadata does not declare;
   - something the code does that the schema cannot express.

## Stop

Stop and show the two drafts, the stories with the criteria that support each, and the list from step 6. Commit nothing.

A requirements file is not committed while an `*(inferred)*` mark remains: the human confirms or rewrites each one. Then commit on a `chore/` branch, one `REQUIREMENTS:` commit and one `SPECIFICATIONS:` commit.

## Done when

- Every name in the metadata appears in the specification, and nothing else does.
- Every story is supported by at least one criterion from the tests.
- No source or test file has changed.

The next step is `/audit`: this skill records what is there, and that one says whether it should be.
