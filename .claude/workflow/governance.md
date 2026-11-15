# Governance: Cards and Posts

This document describes how work reaches a repository and how the repository reports back: the cards on the Planner boards, and the posts in the Teams channel.

It is a workflow. How the work itself is done is described in `workflow.md` and the documents it points to. What happens on GitHub is described in `github.md`.

The examples are from the `pin` component. They illustrate the steps; a component's cards and posts are its own.

---

# 1) Where Work Lives

| Place | Holds | Written by |
|---|---|---|
| Planner plan **Components** | one bucket for each repository, holding the cards that repository delivers | the Product Owner; the developer, as §7 allows |
| Planner plan **Intuitive Pathways** | `FEATURE:` cards for the application, grouped by journey stage | the Product Owner |
| Teams channel **Backlog**, team **Intuitive Pathways** | every post between sessions: one thread for each card | everyone |
| GitHub | the issues, branches, pull requests and releases, as `github.md` describes | the developer, up to the pull request; the human merges and releases, or asks the developer to, that time (`github.md` §2) |

The ids of the team, the channel and the plans are in the team charter, `Intuitive.Pathways/.claude/CLAUDE.md`, which every session below that folder loads. A repository's bucket carries the repository's name, apart from capitals; the team charter names the exceptions.

# 2) Who Does What

| Role | Who | Owns |
|---|---|---|
| The human | — | decisions, approval with `Go`, merges, releases and deploys |
| Product Owner | the session opened in `Intuitive.Pathways/` | what and why: creates and words the cards, sets their priority, bucket and order, opens their threads, reviews what comes back, and reopens a card |
| Developer | the session opened in a repository, or a subagent the Product Owner starts for it | how: the plan, the issue, the branch, the work and the pull request (`github.md` §2); the progress of the repository's own cards, and the replies in their threads |

A post is never approval. Only the human's `Go` is.

# 3) A Card

## 3.1) The title

The title is `TYPE: Title`: the type, then two to four words.

| Type | The work |
|---|---|
| `FEATURE`, `STORY`, `FIX`, `CHORE`, `DOCS`, `UPGRADE`, `REFACTOR`, `AI` | as `github.md` §4.1 describes, for a card on the plan **Components** |
| `DECIDE` | a question for the human; it never reaches GitHub |

The card is where the one title first appears (`github.md` §1): the issue, the branch, the pull request, the merge commit and the release all carry it.

The developer never renames a card. A title that turns out to be wrong is raised in the card's thread. Once the Product Owner has renamed the card, the developer renames every stage that already exists (`requirements.md` §9).

## 3.2) The description

The description is short: three lines at most.

| Card | Its description |
|---|---|
| a story, and most other types | the story in its one form (`requirements.md` §4), then a line naming any dependency |
| a fix | the defect: what happens, and what should happen instead |
| a decision | the question, and the options when they are known |

```text
As a host application, when I place the pin inside a toolbar, I want it to appear without its own border and shadow, so that the toolbar reads as one surface.
```

The acceptance criteria are not on the card. The developer writes them in the issue (`github.md` §3).

## 3.3) The fields

| Field | Set by | Values |
|---|---|---|
| Title, description | Product Owner | as above |
| Bucket | Product Owner | the repository |
| Priority | Product Owner | Urgent `1`, Important `3`, Medium `5`, Low `9` |
| Progress | developer, on its own cards; the Product Owner, on any card | Not started `0`, In progress `50`, Completed `100` |
| Checklist | developer, on its own cards; the Product Owner, on any card | the plan, one item for each step, 100 characters at most |
| Links | developer, on its own cards; the Product Owner, on any card | the issue, the pull request and the release |

## 3.4) A feature

A feature of the application is a card on the plan **Intuitive Pathways**. Its description is the feature's story, then a line `Groups:` naming the cards of its stories, each as `<title> · <bucket>`. It never reaches GitHub. It is complete when every card it groups is. It is neither of the two meanings of *feature* in `requirements.md` §7: not a capability in one component's requirements file, and not work delivered on one branch, but a capability of the application that groups the cards of several repositories.

A feature of one repository, whose stories are delivered together on one `feature/` branch, is a `FEATURE:` card in that repository's bucket. On GitHub it is a parent issue with its stories as sub-issues (`github.md` §4.3, §5).

# 4) A Post

## 4.1) Threads

- **One thread for each card.** The subject of its first post is `<card title> · <bucket>`, such as `STORY: Flat Appearance · Pin`. The Product Owner opens it when the card is handed over, with what the card does not say. When it is missing, the developer opens it. Everything about the card is a reply in that thread.
- **Any other topic** has a thread of its own, with the subject `<sender> · <receiver>`. To write to everyone, the receiver is `all`.

## 4.2) Every post

Every session posts with the same account, so each post says who it is from and who it is for. It opens with a bold routing line:

```html
<p><b>Pin → Product Owner:</b> STORY: Flat Appearance pushed.</p>
```

The names are the repository's name for its developer, `Product Owner`, `Human` and `all`. A reply that says a post is handled is the one exception: it has the shorter form of §4.3.

- A post is HTML: `<p>`, `<b>`, `<code>`, `<ul>` and `<li>`.
- A post is short. The detail lives in the commits, the issue and the pull request.
- A post is never edited or deleted. A new post corrects it.
- No reactions and no mentions: with one account they cannot say who acted.

## 4.3) Handled

The receiver of a post says it has handled the post with a reply: its own name in bold, one tag, and the reason when there is one.

```html
<p><b>Pin:</b> [DONE]</p>
```

| Tag | Meaning |
|---|---|
| `[DONE]` | handled; nothing further |
| `[REPLIED]` | answered in this thread |
| `[BLOCKED]` | cannot act yet; the reply says on what |
| `[DECLINED]` | outside this role or scope; the reply says who should act |

A post without such a reply from its receiver is waiting. A post to `all` waits for each receiver separately.

## 4.4) When posts are read

Sessions do not watch the channel. A developer reads its cards and their threads when a session starts (`/inbox`), and whenever the human asks.

# 5) The Life of a Card

| # | Step | Who | Path | On the card | In the thread |
|---|---|---|---|---|---|
| 1 | Create the card | Product Owner | — | title, description, bucket, priority | the first post: the hand-off |
| 2 | Read it, while preparing | developer, `/inbox` | — | — | — |
| 3 | When it is unclear or wrong, say so in the readiness report, and stop | developer | — | — | on `Go`: the question, as a post to the Product Owner, and `[BLOCKED]` on the hand-off |
| 4 | Start it, on `Go` | developer, `/story` | 1 | In progress; the plan as the checklist | — |
| 5 | Open the issue | developer, `/story` | 2 | link: the issue | — |
| 6 | Do the work | developer, `/specify`, `/build` | 3–8 | each checklist item ticked as it lands | questions, when there are any |
| 7 | Open the pull request | developer, `/pull-request` | 9–10 | link: the pull request | the report: pushed |
| 8 | Merge, then release | the human; or, when the human asks that time, the developer (`/pull-request`, `/release`) or the Product Owner | 11–17 | — | — |
| 9 | Close it | developer, `/close` | 18 | link: the release; Completed | the report: closed |
| 10 | Review it | Product Owner | — | reopened, when something is missing | the reason |

The Path column names the steps of `workflow.md` §1.

- A card is closed once the release that contains its merge is made. Every merge goes into the next release (`github.md` §9), so every card that reaches GitHub waits for one.
- A release that fails a check closes nothing.
- A `DECIDE` card is closed by the Product Owner once the human has decided. The decision is the last post in its thread.
- Work the human starts directly in a session may have no card. Then it starts at step 1 of the path, its title is chosen when its issue is opened (`github.md` §1), and nothing is written on the board.

# 6) The Reports

Two reports go to the Product Owner, each a reply in the card's thread. Each is kept to these lines.

**After the pull request is opened:**

```html
<p><b>Pin → Product Owner:</b> STORY: Flat Appearance pushed.</p>
<ul>
<li>Pull request #18 into main, check passed; issue #17</li>
<li>Findings: none</li>
</ul>
```

**After the card is closed:**

```html
<p><b>Pin → Product Owner:</b> STORY: Flat Appearance released; card completed.</p>
<ul>
<li>Version 0.3.0, release "STORY: Flat Appearance"</li>
<li>Checked: <code>Appearance.FLAT</code> is in the published <code>dist</code></li>
<li>Consumers: nothing to do; no repository depends on the package</li>
<li>Findings: none</li>
</ul>
```

`Consumers` says what a consumer of the package must do, taken from the release notes, and names the repositories that depend on the package.

# 7) Who May Write What

| Write | Product Owner | Developer |
|---|---|---|
| Create, delete or move a card; change its title, description, priority or bucket | yes | never |
| A card's progress, checklist and links | any card | the cards in its own bucket |
| Open a thread | any | a missing thread of its own card; a topic thread to one receiver |
| Reply | in any thread | in any thread |
| Edit or delete a post | never | never |

When the work needs a change outside the developer's repository, the developer describes the exact change for the human and does not make it. `CLAUDE.md`, `/build` and `add-ons/localizer.md` say so for the base component and the Localizer; the team charter says it for every other repository, since a session writes only in its own. When the human decides to make the change, the Product Owner cards it for the repository that makes it. A change to a contract between packages is the human's decision too: raise it with the Product Owner.

# 8) The Calls

The board and the channel are reached through the `ms365` MCP server. The calls below are the ones that work; others look right and fail.

## 8.1) Reading

| To read | Call |
|---|---|
| the bucket's id | `list-plan-buckets` on the plan **Components**, with `select: id,name`; match the repository's name, apart from capitals, or the exception the team charter names |
| the cards in a bucket | `graph-batch`, with one `GET /planner/buckets/<bucket-id>/tasks?$select=id,title,percentComplete,priority,orderHint,createdDateTime` |
| a card's description, checklist and links | `get-planner-task-details` |
| the threads | `list-channel-messages`: the first post of each thread, newest first, one page at a time. Match the subject, and follow `@odata.nextLink` with `skiptoken` only as far back as needed |
| the replies in a thread | `list-channel-message-replies`, on the id of the thread's first post |

`list-plan-tasks` ignores a filter on the bucket and returns every card of the plan. Use it only without `graph-batch`, with `select: id,title,bucketId,percentComplete,priority,orderHint,createdDateTime`, and keep the cards of the bucket.

## 8.2) Writing

Every change to a card first reads the card's version, and sends it back as `If-Match`.

| To change | Read the version with | Then call |
|---|---|---|
| the progress | `get-planner-task`, `includeHeaders: true` | `update-planner-task`, with the body `{ "percentComplete": 50 }` |
| the checklist or the links | `get-planner-task-details`, `includeHeaders: true` | `update-planner-task-details` |

- **A checklist item** is keyed by a new GUID:

  ```json
  { "checklist": { "<guid>": { "@odata.type": "#microsoft.graph.plannerChecklistItem", "title": "Issue: STORY: Flat Appearance", "isChecked": false } } }
  ```

  To tick an item, send its key with `"isChecked": true`.

- **A link** is keyed by its URL, with `%`, `.`, `:`, `@` and `#` encoded:

  ```json
  { "references": { "https%3A//github%2Ecom/scalable-software/pin/issues/17": { "@odata.type": "#microsoft.graph.plannerExternalReference", "alias": "Issue #17", "type": "Other" } } }
  ```

  The aliases are `Issue #<n>`, `Pull request #<n>` and `Release <version>`.

- **A new thread:** `send-channel-message`, with the body `{ "subject": "<card title> · <bucket>", "body": { "contentType": "html", "content": "<p><b>…</b> …</p>" } }`.
- **A reply:** `reply-to-channel-message`, on the id of the thread's first post, with the body `{ "body": { "contentType": "html", "content": "…" } }`.

When a call is refused, try it once more. When it is refused again, stop, and put the change you would have made in the report to the human, so that it can be made later.

# 9) Checklist

1. Start from the card: its title is the title at every later stage.
2. Read the card and its thread while preparing. When the card is unclear or wrong, say so in the readiness report, and stop.
3. On `Go`, set the card in progress and add the plan as its checklist.
4. Link the issue, then the pull request, then the release.
5. Tick each checklist item as it lands.
6. Report in the card's thread after the pull request, and after closing the card.
7. Close a card only once the release that contains its merge is made.
8. Open every post with the routing line, apart from a reply that says a post is handled, and answer every post to you with a tag.
9. Never change a card's title, description, priority or bucket, and never touch another bucket.
10. Never edit or delete a post.
