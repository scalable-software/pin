![License: CC BY-NC-SA 4.0](https://flat.badgen.net/static/license/CC-BY-NC-SA-4.0/green)

# Pin

A lightweight, self-contained web component for fixing UI elements — panels, toolbars, cards, or widgets — in place or releasing them to float. It can be shown or hidden on demand, toggles between pinned and unpinned states, responds visually to user interaction, and adapts automatically to light and dark themes, emitting discrete events for each transition to give product teams a single drop-in control to manage the persistence of any on-screen element.

---

## 1. Introduction

The **Pin** component provides a toggleable element that can be pinned/unpinned and hidden/shown via both **imperative** and **declarative** APIs. It leverages custom Web Component features, including Shadow DOM, custom events, and attribute reflection for a clean, modular design.

### 1.1 Installation & Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/scalable-software/pin.git
   cd pin
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run Tests (Optional)**

   ```bash
   npm test
   ```

   - Ensures everything is working as expected before you start.

4. **Start Local Server**

   ```bash
   npm run serve
   ```

   - This runs a local development server, making `<pin-button>` available in your browser.

---

## 2. Quick Start Usage Walkthrough

This walkthrough demonstrates how to interact with `<pin-button>` right after installation, letting you see how the pin behaves before exploring its internal design.

1. **Open** the served page in your browser.
   - You should see a `<pin-button>` component displayed.

2. **Open the Developer Tools**, select the **Console**.

3. **Get a reference** to the component:

   ```js
   const pin = document.querySelector("pin-button");
   ```

4. **Create a handler** for when the pin is pinned:

   ```js
   const onpin = (event) => {
     console.log("Pin was pinned:", event.detail.status);
   };
   ```

5. **Assign** that handler to the `onpin` property:

   ```js
   pin.onpin = onpin;
   ```

6. **Pin** the component imperatively:

   ```js
   pin.pin();
   ```

   - This changes `status` from `unpinned` to `pinned`.
   - Observe the console output: `"Pin was pinned: pinned"`.

7. **Inspect** the `<pin-button>` in the **Elements** tab:

   ```html
   <pin-button status="pinned"></pin-button>
   ```

8. **Manually change** the `status` attribute to `"unpinned"`.
   - Notice the pin's icon and internal state update.

9. **Check** the current status in the console:

   ```js
   pin.status; // "unpinned"
   ```

10. **Click** the `<pin-button>` in the UI.
    - Clicking toggles it between `pinned` and `unpinned`. Since the current state is `unpinned`, the `onpin` event fires and the handler logs the result.

11. **Check** the status again:

    ```js
    pin.status; // "pinned"
    ```

> **Visibility**
>
> You can similarly call `pin.hide()` or `pin.show()` to toggle visibility. Watch for `onhide` or `onshow` events in the console.

For more details on **States**, **Operations**, and **Events**, consult the sections below or check the generated **API documentation** (see `npm run document`).

---

## 3. Architectural Overview

### 3.1 Composition

- **Template** (`pin.template.html`): Defines DOM structure — a `.icon` container holding the pinned and unpinned SVG icons.
- **Style** (`pin.style.css`): Encapsulates appearance, including state-driven icon swapping, hover effects, and light/dark theme adaptation.
- **Class** (`pin.ts`): Extends the base component class to handle lifecycle hooks, Shadow DOM creation, attribute reflection, and event dispatch.

> **Separation of Concerns**
>
> - **HTML** for structure
> - **CSS** for presentation
> - **TypeScript** for behavior

### 3.2 Class Lifecycle

Lifecycle methods are implemented in the base class and extended by the **Pin** component:

- **`connectedCallback()`**
  1. Creates a Shadow DOM.
  2. Clones the HTML template into the Shadow Root.
  3. Inserts a `<link>` for scoped CSS.
  4. Initialises default state attributes.
  5. Sets up event listeners (e.g., click on the icon).

- **`disconnectedCallback()`**
  - Removes event listeners and cleans up cached element references.

---

## 4. Core Concepts: State, Operations, and Events

The following sections explain how the pin works internally.

### 4.1 State

The **Pin** component uses both **internal properties** and **DOM attributes** to manage its state. This ensures consistency whether you modify the pin via script or HTML attributes.

#### 4.1.1 Definition

- **`visibility`** (`visible` | `hidden`)
  - Whether the pin is displayed.
  - **Optional attribute**: absent from the DOM when `visible` (the default); present as `[visibility="hidden"]` on the host element when hidden.

- **`status`** (`pinned` | `unpinned`)
  - Whether the pin is pinned or unpinned.
  - **Compulsory attribute**: always present in the DOM, reflecting the current state at all times.

#### 4.1.2 Internal vs. Attribute-Driven State

1. **Internal State**

   ```typescript
   private _visibility: Visibility = Visibility.VISIBLE;
   private _status: Status = Status.UNPINNED;
   ```

   - Predictable defaults decoupled from external attributes.

2. **Attribute-Driven State**

   ```typescript
   public get visibility() {
     return this._visibility;
   }
   public set visibility(value: Visibility) {
     value = value ?? Visibility.VISIBLE;
     value = Validate.visibility(value);
     if (this._visibility === value) return;
     this._visibility = value;
     value === Visibility.VISIBLE && this.removeAttribute(Attributes.VISIBILITY);
     value === Visibility.HIDDEN && this.setAttribute(Attributes.VISIBILITY, value);
     const message = { detail: { visibility: value } };
     value === Visibility.HIDDEN && this._dispatchEvent(Event.ON_HIDE, message);
     value === Visibility.VISIBLE && this._dispatchEvent(Event.ON_SHOW, message);
   }
   ```

   - Normalises `null` to the default before validation.
   - Validates the incoming value and throws on invalid input.
   - Guards against no-op mutations with an early return.
   - Keeps `_visibility` in sync with `[visibility="hidden"]` in the DOM and dispatches the corresponding event on every accepted transition.

#### 4.1.3 Lifecycle & Attribute Handlers

- `_initialize()` writes the `status` attribute to the DOM on connect if it is not already present, ensuring the compulsory attribute is always reflected from the first render.
- `attributeChangedCallback()` invokes `_attributeHandlers`, routing attribute changes back through the setter so external attribute mutations and imperative setter calls follow the same mutation path.

#### 4.1.4 Usage Tips

- **Fallback**: Removing `[visibility="hidden"]` reverts the component to its visible default.
- **Clean DOM**: When `visibility` is `visible`, no attribute is present on the host element.

---

### 4.2 Operations

The **Pin** component's imperative API manipulates state, which in turn updates the DOM and triggers events.

#### 4.2.1 Definition

1. `hide()` → sets `[visibility="hidden"]` on the host element
2. `show()` → removes the `[visibility]` attribute from the host element
3. `pin()` → `status="pinned"`
4. `unpin()` → `status="unpinned"`
5. `toggle()` → flips between `pinned` and `unpinned`

#### 4.2.2 Example

```typescript
public toggle = () =>
  (this.status =
    this.status === Status.PINNED ? Status.UNPINNED : Status.PINNED);
```

---

### 4.3 Events

The **Pin** component broadcasts custom events when its internal state changes.

#### 4.3.1 Definition

- **`onhide`**: Fired when transitioning from `visible` to `hidden`.
- **`onshow`**: Fired when transitioning from `hidden` to `visible`.
- **`onpin`**: Fired when transitioning from `unpinned` to `pinned`.
- **`onunpin`**: Fired when transitioning from `pinned` to `unpinned`.

#### 4.3.2 Usage Tips

- Assign a handler directly to the setter:

  ```js
  pin.onpin = (event) => console.log(event.detail.status);
  ```

- Or use standard DOM event listening:

  ```js
  pin.addEventListener("onpin", (e) => {
    // ...
  });
  ```

---

## 5. Development Workflow

Below is a recommended workflow for building, testing, documenting, and publishing the Pin component.

### 5.1 From Specifications to Implementation

1. **Define Specs** (states, operations, events).
2. **Implement** in TypeScript (reflect states as attributes, dispatch events on transitions).
3. **Link** the final compiled JS or leverage import maps.

### 5.2 Testing

Unit tests run with Karma + Jasmine. The suite covers states, operations, events, and gestures.

```bash
npm test
```

### 5.3 Documentation (Typedoc)

```bash
npm run document
```

Auto-generates API docs from TypeScript annotations.

### 5.4 Publishing & Versioning

1. **Build**:

   ```bash
   npm run build
   ```

   Outputs to `dist/`.

2. **Bump Version**:

   ```bash
   npm version [major|minor|patch]
   ```

3. **Publish**:

   ```bash
   npm publish
   ```

### 5.5 Import Maps

The path in the import map depends on how the package is consumed.

**During local development** (e.g. the project's own `demo/`), the path resolves relative to the served file and points directly into the local build output:

```html
<script type="importmap">
  {
    "imports": {
      "@scalable.software/pin": "./dist/index.js"
    }
  }
</script>
<script type="module">
  import "@scalable.software/pin";
</script>
```

**After publishing to npm**, the path must point to the package inside `node_modules`:

```html
<script type="importmap">
  {
    "imports": {
      "@scalable.software/pin": "/node_modules/@scalable.software/pin/dist/index.js"
    }
  }
</script>
<script type="module">
  import "@scalable.software/pin";
</script>
```

Alternatively, reference the package from a CDN:

```html
<script type="importmap">
  {
    "imports": {
      "@scalable.software/pin": "https://unpkg.com/@scalable.software/pin/dist/index.js"
    }
  }
</script>
<script type="module">
  import "@scalable.software/pin";
</script>
```

---

## 6. Best Practices & Extensibility

1. **Descriptive Naming** — `pinned/unpinned` is domain-friendly for toggles.
2. **Accessibility** — Consider ARIA attributes and keyboard interactions to make `<pin-button>` fully accessible.
3. **Testing** — Simulate user clicks to confirm correct state transitions and event dispatch.
4. **Documentation** — Provide real usage snippets (like the Quick Start above) for developer onboarding.
5. **Publishing** — Use semantic versioning to manage features and breaking changes; employ CI/CD for automated build, test, and publish.

---

## 7. Conclusion

By showing you how to **pin** or **unpin** the component immediately in the Usage Walkthrough, we have demonstrated its core features. Internally, the **Pin** component's **State**, **Operations**, and **Events** ensure predictable, event-driven functionality. Follow the **development workflow** for build, test, docs, and publishing to confidently integrate `<pin-button>` into your projects.

---

## License

> This software and its documentation are released under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International Public License (CC BY-NC-SA 4.0). This means you are free to share, copy, distribute, and transmit the work, and to adapt it, but only under the following conditions:
>
> Attribution: You must attribute the work in the manner specified by the author or licensor (but not in any way that suggests that they endorse you or your use of the work).
>
> NonCommercial: You may not use this material for commercial purposes.
>
> ShareAlike: If you alter, transform, or build upon this work, you may distribute the resulting work only under the same or similar license to this one.
>
> For more details, please visit the full [license agreement](https://creativecommons.org/licenses/by-nc-sa/4.0/).
