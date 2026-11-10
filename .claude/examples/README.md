# Reference implementations

Do not copy these into repositories — read them in place.

| What | Where | Use it for |
|---|---|---|
| **Component canon** — `pin-button` | `../../scalable.software/pin` (`src/`, `test/unit/`, `specifications/`) | the shape every policy in `../context/*.md` is written against: metadata → validation → component → template → style, three test files, FAIL/PASS commit history |
| **Born-compliant machine** — Configurator | `../../Effect.Healthcare/Machine/src/Configurator.Machine.ts` + `test/unit/Configurator.Machine.test.ts` | vocabulary imported from the package; parallel regions from outcome events; `sendTo`-App notifications in the canonical `({ event: { detail } }) => ({ type, detail })` form; emit-only command events named after operations; app-system tests (`createActor(App.Machine, { systemId: App.Tag, inspect })`) |
| **Payload-carrying command + dual trigger** — Messenger | `Machine/src/Messenger.Machine.ts`, `Machine/src/App.Machine.ts` (`connectMessenger`) | `send` command forwarding `detail`; App commanding from two prerequisites with a self-guarding component operation |
| **App wiring** | `Intuitive.Pathways/public/components/configurator.js`, `messenger.js` | the two-way binding shape: component → `machine.send(event)`; `machine.on(Operation.X, () => component.x())` |
| **Headless component with a localStorage contract** | `Messenger/src/messenger.ts` (`Endpoint`, `Session`, fresh reads, gated no-op) | consuming another component's cached contract without coupling |
| **Localizer add-on** | `../../scalable.software/localizer` | per-component lexicon resolution; opt-in window gesture |

Policies live in `../context/`. The migration doctrine for machines lives in
`Machine/.claude/context/migration.md`.
