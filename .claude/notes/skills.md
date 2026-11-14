# Claude Skills — Recommendation

*Recorded on 2026-11-10 for later; no skill has been created yet. Moved here from the workflow working notes on 2026-11-14.*

A skill suits a repeatable task with a clear trigger. Rules that always apply stay in always-loaded context.

| Document | Fit for a skill | Task it would serve |
|---|---|---|
| `state` | Strong | Add a state |
| `validation` | Strong, inside the state skill | A validator follows a state |
| `operation` | Strong | Add an operation |
| `event` | Strong | Add an event |
| `gesture` | Good, once its example is fixed | Add a gesture |
| `composition` | Good, once pin's specification complies | Add or change a structural part |
| `testing` | Shared reference | Each skill takes its slice |
| `requirements` | Good, after revision | Write a user story and acceptance criteria |
| `workflow` | Strong, once these notes are policy | Open an issue, open a pull request, cut a release |
| `data` | Not yet | Unproven here |

- Organise skills by task, not by policy: "add a state" bundles `state`, `validation`, its slice of `testing` and the commit ladder, with the pin example as reference files.
- The order of the concerns gives the set: one skill for each concern in the sequence.
- Start with "add a state": it rests on the two most mature policies, and pin shows both variations.
- A release skill should check the registry's full version history before choosing a number.
- Keep out of skills: roles and write scopes, one concern per commit, standing preferences.

## Status on 2026-11-14

The conditions in the table have since been met: the gesture example is the pin's real stylesheet, the pin's specification complies with the composition policy, the requirements document is revised, and the workflow notes are now `workflow.md`, `github.md`, `requirements.md`, `specifications.md` and `testing.md`. The `data` policy is still not reviewed.
