# The Example

This folder holds a copy of the pin, `@scalable.software/pin`: the reference component with which the guide, the policies and the workflows are illustrated. Where the pin has no example of something, such as data, a computed state or a rich operation, the examples come from the title, and the title's demo is the reference for the demo page. A few rules are shown with an invented case instead.

| Path | Holds |
|---|---|
| `specifications/` | the pin's requirements file and its specification |
| `src/` | the pin: its metadata, its validators, the component, its template and its stylesheet |
| `test/` | the pin's tests, and their helper |

The pin shows how the pieces link: each rule of a policy, the specification entry it shapes, the code that follows it and the test that proves it. It is an illustration, not a model to copy. A component's states, operations, events, gestures, tests and specification come from its own requirements, never from the pin's; each repository applies the policies, and the principles behind them, in the context of its own component.

Read the pin in place. In the pin's own repository its files here are kept identical to `src/`, `specifications/` and `test/`. In every other repository they are never changed from here: they are refreshed from the pin's own files.
