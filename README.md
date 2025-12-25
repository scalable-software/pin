![License: CC BY-NC-SA 4.0](https://flat.badgen.net/static/license/CC-BY-NC-SA-4.0/green)

# Pin Component Documentation

Below is a **comprehensive** document detailing the **Pin** component’s architecture, usage, and developer workflow. It prioritizes a **Quick Start** so you can see the pin in action right away, then dives into **State**, **Operations**, **Events**, and more advanced topics.

---

## 1. Introduction

The **Pin** component provides a toggleable element that can be pinned/unpinned and hidden/shown via both **imperative** and **declarative** APIs. It leverages custom Web Component features, including Shadow DOM, custom events, and attribute reflection for a clean, modular design.

### 1.1 Installation & Setup

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd pin-component
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

8. **Manually change** the `status` attribute to `"unpinned"`

   - Notice the pin’s icon and internal state update.

9. **Check** the current status in the console:

   ```js
   pin.status; // Should return "unpinned"
   ```

10. **Click** the `<pin-button>` in the UI

    - By default, clicking toggles it between `pinned` and `unpinned`.
    - If pinned, the `onpin` event is fired (if you have a listener).

11. **Check** the status again:

```js
pin.status; // "pinned" or "unpinned"
```

> **Visibility**
>
> - You can similarly call `pin.hide()` or `pin.show()` to toggle the `visible` state.
> - Watch for `onhide` or `onshow` events in the console.

For more details on **States**, **Operations**, and **Events**, consult the sections below or check the generated **API documentation** (see `npm run document` instructions).

---

## 3. Architectural Overview

### 3.1 Composition

- **Template** (e.g., `Pin.template.html`):  
  Defines DOM structure (a `.icon` container, pinned/unpinned SVGs, etc.).

- **Style** (e.g., `Pin.style.css`):  
  Encapsulates appearance, including hover effects, pinned/unpinned icon transitions.

- **Class** (`Pin.ts`):  
  Extends a base component class to handle lifecycle hooks, Shadow DOM creation, attribute reflection, etc.

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
  4. Initializes default states (`visible`, `status`).
  5. Sets up event listeners (e.g., on click).

- **`disconnectedCallback()`**
  - Removes event listeners and cleans up references.

---

## 4. Core Concepts: State, Operations, and Events

After seeing the pin in action, the following sections explain **how** it works internally.

### 4.1 State

The **Pin** component uses both **internal properties** and **DOM attributes** to manage its state. This ensures consistency whether you modify the pin via script or HTML attributes.

#### 4.1.1 Definition

- **`visible`** (`yes` | `no`)

  - Whether the pin is displayed.
  - **Not-initialized** by default, meaning the component reverts to an internal default (`yes`) if `visible` is absent.

- **`status`** (`pinned` | `unpinned`)
  - Whether the pin is pinned or unpinned.
  - **Initialized** by default, so if `<pin-button status="pinned">` is found at startup, it remains pinned initially.

#### 4.1.2 Internal vs. Attribute-Driven State

1. **Internal State**

   ```typescript
   private _visible: Visibility = Visible.YES;
   private _status: Statuses = Status.UNPINNED;
   ```

   - Predictable defaults decoupled from external attributes.

2. **Attribute-Driven State**
   ```typescript
   public get visible(): Visibility {
     return this.hasAttribute(Attribute.VISIBLE)
       ? (this.getAttribute(Attribute.VISIBLE) as Visibility)
       : this._visible;
   }
   public set visible(visible: Visibility) {
     visible = visible || Visible.YES; // fallback
     if (this._visible !== visible) {
       this._visible = visible;
       visible === Visible.YES && this.removeAttribute(Attribute.VISIBLE);
       visible === Visible.NO && this.setAttribute(Attribute.VISIBLE, visible);
     }
   }
   ```
   - Keeps `_visible` in sync with `[visible="no"]` if you set it in HTML or JS.

#### 4.1.3 Lifecycle & Attribute Handlers

- `_initialize()` sets internal defaults on connect.
- `attributeChangedCallback()` invokes `_attributeHandlers`, updating state when external attributes change.

#### 4.1.4 Usage Tips

- **Fallback**: Removing `[visible="no"]` reverts to `YES`.
- **Clean DOM**: If `visible` is `YES`, no attribute is present.

---

### 4.2 Operations

The **Pin** component’s imperative API manipulates state, which in turn updates the DOM and triggers events.

#### 4.2.1 Definition

1. `hide()` → `visible="no"`
2. `show()` → `visible="yes"`
3. `pin()` → `status="pinned"`
4. `unpin()` → `status="unpinned"`
5. `toggle()` → flips between pinned/unpinned

#### 4.2.2 Example

```typescript
public toggle = () => (
  this.status = this.status === Status.PINNED ? Status.UNPINNED : Status.PINNED
);
```

---

### 4.3 Events

The **Pin** component broadcasts custom events when its internal state changes.

#### 4.3.1 Definition

- **`onhide`**: Fired when going from visible to hidden.
- **`onshow`**: Fired when going from hidden to visible.
- **`onpin`**: Fired when going from unpinned to pinned.
- **`onunpin`**: Fired when going from pinned to unpinned.
- **`on`**: A catch-all for any of the above changes.

#### 4.3.2 Usage Tips

- Assign a handler:

```js
pin.onpin = (event) => console.log(event.detail.status);
```

- Or use standard DOM events:

```js
pin.addEventListener("onpin", (e) => {
  // ...
});
```

---

## 5. Development Workflow

Below is a recommended workflow for building, testing, documenting, and publishing the Pin component:

### 5.1 From Specifications to Implementation

1. **Define Specs** (states, operations, events).
2. **Implement** in TypeScript (reflect states as attributes, dispatch events on changes).
3. **Link** the final compiled JS or leverage import maps.

### 5.2 Testing

- **Unit Tests** using Karma + Jasmine or real-time Wallaby.
- Ensure coverage for states, operations, events.
- Generate coverage:

```bash
npm test
```

### 5.3 Import Maps

```html
<script type="importmap">
  {
    "imports": {
      "pin-component": "./dist/Pin.js"
    }
  }
</script>
<script type="module">
  import "pin-component";
</script>
```

### 5.4 Documentation (Typedoc)

```bash
npm run document
```

- Auto-generates API docs from TypeScript annotations.

### 5.5 Publishing & Versioning

1. **Build**:

   ```bash
   npm run build
   ```

   → outputs `dist/`.

2. **Bump Version**:

   ```bash
   npm version [major|minor|patch]
   ```

3. **Publish**:
   ```bash
   npm publish
   ```
   to npm or private registry.

---

## 6. Best Practices & Extensibility

1. **Descriptive Naming**

   - `pinned/unpinned` is domain-friendly for toggles.

2. **Accessibility**

   - Consider ARIA attributes and keyboard interactions if you want `<pin-button>` fully accessible as a toggle/button.

3. **Testing**

   - Simulate user clicks/touches to confirm correct state changes and event dispatch.

4. **Documentation**

   - Provide real usage snippets (like in the Quick Start) for developer onboarding.

5. **Publishing**
   - Use semantic versioning to manage features/breaking changes.
   - Employ CI/CD for automated build/test/publish.

---

## 7. Conclusion

By showing you how to **pin** or **unpin** the component immediately (in the Usage Walkthrough), we’ve demonstrated its core features. Internally, the **Pin** component’s **State**, **Operations**, and **Events** ensure predictable, event-driven functionality. Follow the **development workflow** for specs, build, test, docs, and publishing to confidently integrate `<pin-button>` into your projects.

---

### License

> This document is released under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International** (CC BY-NC-SA 4.0) license.  
> For more details, please visit the [license agreement](https://creativecommons.org/licenses/by-nc-sa/4.0/).
