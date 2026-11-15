# The Localizer — An Implementation Guide

This guide explains how a component speaks the user's language with the Localizer add-on:
which pieces are involved, who owns each of them, and how a change of language travels from
the user's choice to the text on the screen. It is written for a developer adding
multi-language support to a component.

The examples come from the `title` component (`<app-title>`), which shows a placeholder,
"Clinical Pathway", in English, German or Dutch while the pathway has no name.

The Localizer is `@scalable.software/localizer` (version 3), and it lives in another
repository. Never change it from a component's repository: when a component needs something
from it, describe the change for the human.

---

## What the Localizer is

The Localizer is an **add-on**, not a component. It has no template, no shadow root and no
attributes. It is an `EventTarget` that a component creates for itself and keeps in a
private field.

It does three things:

1. It holds the component's **lexicons**: one set of texts for each language.
2. It knows the **active language**, and gives the component the lexicon for it.
3. It **tells the component** when the active language changes.

It does not choose the language, store it or draw any text. Choosing and storing belong to
the Language component; drawing belongs to the component that uses the Localizer.

## The pieces at a glance

```text
 Language component                       the only writer of the language
   │
   ├── localStorage["app.language"] = "de"                     for the next page load
   └── BroadcastChannel("app.configuration")
         .postMessage({ type: "onappconfigchange", language: "de" })   for every page open now
                │
                ▼
 Localizer, one inside each component instance
   ├── at construction: reads "app.language" once, else the browser's language; "de-CH" becomes "de"
   ├── initialize(): opens the channel            dispose(): closes it
   ├── on a valid message: language = "de", then dispatches onlanguagechange
   └── lexicon: the bundle for "de", else "en", else the first bundle
                │
                ▼
 Component (the title)
   ├── configuration.localizations: { en: {...}, de: {...}, nl: {...} }
   └── onlanguagechange → _updateLabel → the label shows lexicon.placeholder
```

| # | Piece | Owned by | In the title |
|---|---|---|---|
| 1 | The lexicon: which texts a component needs | the component | `Localizations<{ placeholder: string }>` in `title.meta.ts` |
| 2 | The bundles: the lexicon in each language | the component | `configuration.localizations` in `title.ts` |
| 3 | The configuration type that carries the bundles | the component | `Configuration` in `title.meta.ts` |
| 4 | The persisted language, `app.language` | the application; the Language component writes it | `Storage.LANGUAGE` in `title.meta.ts` |
| 5 | The Localizer instance | the component | `_localizer` in `title.ts` |
| 6 | The configuration channel, `app.configuration`, and its message | the application; the Language component posts on it | read by the Localizer only |
| 7 | Opening and closing the channel | the component's life cycle hooks | `_initialize` and `_dispose` |
| 8 | The language-change event, `onlanguagechange` | the Localizer | `Gesture.ON_LANGUAGE_CHANGE`, subscribed in `_addEventListeners` |
| 9 | Drawing the localized text | the component | `_updateLabel` |
| 10 | The dependency and the import maps | the package | `package.json`, `importmap/` |
| 11 | The tests | the component | `title.test.ts` |

The sections below first look inside the Localizer, then take each piece in turn.

## Inside the Localizer

A component only creates the Localizer, opens and closes it, and reads its lexicon. Behind
that, the Localizer keeps a storage reader and a channel of its own.

| Member | What it is |
|---|---|
| `_localizations` | the bundles the component passed in, validated at construction |
| `_storage` | a read-only view of `localStorage`, for the key passed as `storage` |
| `_language` | the active language |
| `_channel` | its own `BroadcastChannel` on `app.configuration`, open only between `initialize()` and `dispose()` |
| `_handleMessage` | its listener for messages on that channel |
| `_onlanguagechange` | the one handler subscribed to its event |

It names everything it uses in its own metadata, which a component can import:

| Name | Value |
|---|---|
| `Channel.CONFIGURATION` | `app.configuration` |
| `Gesture.MESSAGE` | `message`, the channel event it listens for |
| `Gesture.ON_APP_CONFIG_CHANGE` | `onappconfigchange`, the `type` of a configuration message |
| `Event.ON_LANGUAGE_CHANGE` | `onlanguagechange`, the event it dispatches |

### How the persisted setting is handled

The Localizer **reads** the persisted language; it never writes it.

- Its `_storage` holds only the key it was given. Without a key, storage is never consulted.
- It reads the key **once**, in its constructor, to pick its starting language. It never
  reads it again: not in `initialize()`, and not when a message arrives.
- A read that finds nothing gives `null`, and so does a read that fails, for example when
  the browser blocks site data or the page runs in a sandboxed frame. The Localizer then
  falls back to the browser's language and never throws.

The **Language component** writes the persisted language, and nothing else does:

- when the user picks a language, it writes `app.language` and then posts the language on
  the channel;
- when it is connected, it writes its current language, so that the key always holds what
  the Language component shows.

Storage carries the choice **across page loads**; the channel carries it **while the page is
open**. A Localizer needs both: storage for where it starts, the channel for every change
after that.

### How a change is triggered

A Localizer's language changes in exactly two ways:

1. **A message on its channel.** `_handleMessage` receives every message posted on
   `app.configuration` while the channel is open. It checks the message with
   `Validate.configuration`, which never throws: a message that is not
   `{ type: "onappconfigchange", language }`, with a non-empty string as `language`, is
   ignored. A valid message assigns its `language` to the Localizer's `language`.
2. **A direct assignment** by the Localizer's owner, to `language` or through
   `setLanguage(language)`. The Language component changes its own Localizer this way;
   a component that only displays text never does.

Both go through the `language` setter, which follows the usual order:

```text
Normalize  an empty value is ignored
Validate   anything but a string throws
Guard      the same language as now: nothing happens
Mutate     _language = language
Dispatch   onlanguagechange, with { language } in its detail
```

The event is dispatched on the Localizer itself, not on the component, so it never reaches
the page: only the handler the component subscribed hears it. A change of storage on its
own triggers nothing.

## How a language reaches the label

A language reaches a component at two moments.

**When the page loads**, nothing is posted. Each Localizer finds the language itself, once,
when its component is constructed: the language the Language component stored in
`app.language` on an earlier visit, or the browser's language if there is none. The title
draws its label when it is connected, with the lexicon for that language.

**While the page is open**, the user picks a language in the Language component. It stores
the language in `app.language`, for the next page load, and posts it on the channel
`app.configuration`, for now. Every connected Localizer of the origin receives the message,
in this page and in any other tab, sets its language, and dispatches `onlanguagechange`.
The title's handler redraws the label.

```text
user picks "de" in Language
  → localStorage["app.language"] = "de"
  → post { type: "onappconfigchange", language: "de" } on "app.configuration"
  → each connected Localizer: language = "de" → onlanguagechange
  → title: _updateLabel → "Klinischen Behandlungspfads"
```

## 1. The lexicon

The lexicon is the list of texts a component shows that depend on the language. It is a
plain object type: one key for each text.

The title has one text, the placeholder:

```typescript
// title.meta.ts
export type Configuration = BaseConfiguration & {
  localizations: Localizations<{
    placeholder: string;
  }>;
};
```

`Localizations<T>` is the Localizer's type for "a bundle of `T` for each language". Because
every bundle has the type `T`, the compiler rejects a bundle that misses a text or has one
too many.

Every text the user can read belongs in the lexicon: labels, placeholders, and accessible
names such as an `aria-label`. A text written in the template or the code instead is shown
in one language only.

## 2. The bundles

The bundles are the lexicon, written out once for each language the component supports.
They are part of the component's configuration, next to its template and stylesheet:

```typescript
// title.ts
const configuration: Configuration = {
  url: import.meta.url,
  template: { id: Tag },
  css: { name: CSS },
  localizations: {
    en: { placeholder: "Clinical Pathway" },
    de: { placeholder: "Klinischen Behandlungspfads" },
    nl: { placeholder: "Klinische zorgpad" },
  },
} as const;
```

- The keys are base language codes in lower case: `en`, `de`, `nl`, never `en-US`.
- Always include `en`. When the active language has no bundle, the Localizer falls back to
  English, then to the first bundle there is (see "How the language and the lexicon are
  resolved").
- A component supports exactly the languages it has bundles for. Adding a language to the
  application means adding a bundle to every component that shows text.

## 3. The configuration type

The base component's `Configuration` knows nothing of lexicons. A component that uses the
Localizer extends it, in its metadata file, and types its configuration with the result:

```typescript
// title.meta.ts
import { type Configuration as BaseConfiguration } from "@scalable.software/component";
import { type Localizations } from "@scalable.software/localizer";

export type Configuration = BaseConfiguration & {
  localizations: Localizations<{ placeholder: string }>;
};
```

The base component receives the whole configuration through `super(configuration)` and uses
the parts it knows; the Localizer receives `configuration.localizations`.

## 4. The persisted language: `app.language`

The language the user chose is kept in `localStorage` under the key `app.language`. This key
is an application-wide contract:

- the **Language component** is its only writer;
- every **Localizer** reads it once, at construction, and never writes it;
- the **component** never touches it: it only names it, so that its Localizer can read it.

The Localizer has no default key, so each component declares it in its metadata and passes
it in:

```typescript
// title.meta.ts
export const Storage = {
  LANGUAGE: "app.language",
} as const;
```

The key must be spelled the same in every component, because nothing but the string ties
them together. How the Localizer reads it, and who writes it, is described in "How the
persisted setting is handled".

## 5. The Localizer instance

Each component instance owns one Localizer, in a private field:

```typescript
// title.ts
private _localizer = new Localizer(configuration.localizations, {
  storage: Storage.LANGUAGE,
});
```

- The field is created with the element, so the Localizer reads `app.language` when the
  element is constructed, not when it is connected.
- The second argument takes `storage`, the key to read, and `language`, an explicit
  starting language that wins over storage. A component normally passes only `storage`.
- The Localizer validates both arguments and throws if they have the wrong shape.

## 6. The configuration channel and its message

The channel is a `BroadcastChannel` named `app.configuration`, available from the Localizer
as `Channel.CONFIGURATION`. It is shared by the whole application, so it may carry
messages that are not about the language.

The Localizer acts only on a message of this shape, and ignores everything else silently:

```typescript
{ type: "onappconfigchange", language: "de" }
```

- `type` must be `onappconfigchange`;
- `language` must be a non-empty string;
- other fields may be present and are ignored.

A `BroadcastChannel` delivers a message to every other channel of the same name in the same
origin: other components in the same page, and the same components in other tabs. It does
not deliver it to the channel that posted it. What the Localizer does with a message is
described in "How a change is triggered".

## 7. Opening and closing the channel

The Localizer listens only between `initialize()` and `dispose()`. The component calls them
from the base component's life cycle hooks:

```typescript
// title.ts
protected _initialize = () => {
  this._localizer.initialize();
  // ...
};

protected _dispose = () => {
  this._localizer.dispose();
};
```

The order of the hooks matters:

| When | Hook | What the title does with the Localizer |
|---|---|---|
| connected | `_cache` | nothing; the label is cached |
| | `_initialize` | opens the channel; draws the label with the current lexicon |
| | `_addEventListeners` | subscribes to `onlanguagechange` |
| disconnected | `_removeEventListeners` | unsubscribes |
| | `_dispose` | closes the channel |

Both calls are safe to repeat: `initialize()` does nothing when the channel is already
open, and `dispose()` does nothing when it is closed. A component that is removed and added
again opens a new channel.

## 8. The language-change event

When its language changes, the Localizer dispatches `onlanguagechange`, with
`{ language }` in its `detail`. It dispatches nothing when the language stays the same.

The Localizer's event is an input to the component, not one of the component's own events,
so the title declares it among its gestures, taking the name from the Localizer:

```typescript
// title.meta.ts
import { Event as LocalizerEvent } from "@scalable.software/localizer";

export const Gesture = {
  CLICK: "click",
  INPUT: "input",
  ON_LANGUAGE_CHANGE: LocalizerEvent.ON_LANGUAGE_CHANGE,
} as const;
```

It subscribes in `_addEventListeners`, and unsubscribes in `_removeEventListeners`, through
the Localizer's `onlanguagechange` property:

```typescript
// title.ts
protected _addEventListeners = () => {
  // ...
  this._localizer[Gesture.ON_LANGUAGE_CHANGE] = this._updateLabel;
};

protected _removeEventListeners = () => {
  // ...
  this._localizer[Gesture.ON_LANGUAGE_CHANGE] = null;
};
```

The property name comes from the metadata, so no event name is written as a string.

## 9. Drawing the localized text

The component reads `this._localizer.lexicon` whenever it draws a text from the lexicon,
and never keeps a copy: the lexicon can change at any time.

The title draws one text, in one place:

```typescript
// title.ts
private _updateLabel = () =>
  this.elements.metadata.label &&
  (this.elements.metadata.label.textContent =
    this.metadata?.name || this._localizer.lexicon.placeholder);
```

The same function is called for two reasons: when the data changes, because the name may
have appeared or gone, and when the language changes, because the placeholder has changed.
A component with several texts redraws all of them when the language changes.

The placeholder is presentation. The name is data, and it is never translated: a pathway the
user named "Sepsis" is called "Sepsis" in every language.

## 10. The dependency and the import maps

The Localizer is a runtime dependency of the package, next to the base component:

```json
"dependencies": {
  "@scalable.software/component": "^0.7.0",
  "@scalable.software/localizer": "^3.0.0"
}
```

The host application must serve it, so it is in both import maps, `importmap.test.js` for
the tests and `importmap.build.js` for the demo:

```javascript
"@scalable.software/localizer": "./node_modules/@scalable.software/localizer/dist/index.js",
```

## 11. Testing a localized component

The title tests the Localizer's work through what the user sees, the label, and through what
the component must never do.

| What is tested | How |
|---|---|
| the stored language is used when the title starts | spy on `localStorage.getItem` to return `nl` for `Storage.LANGUAGE`, add the title, and expect the Dutch placeholder |
| a language posted on the channel is shown | post `{ type: "onappconfigchange", language: "de" }` and expect the German placeholder |
| a removed title no longer listens | remove the title, post `nl`, and expect the label to stay German |
| the channel is closed on removal | spy on `BroadcastChannel.prototype.close` and expect one call |
| the title never writes the language | spy on `localStorage.setItem` and `removeItem`, and expect no call for `Storage.LANGUAGE` |

A message on a `BroadcastChannel` arrives later, not during `postMessage`. The tests
therefore post through a helper that waits until the message has been delivered: it opens a
second channel before posting, and resolves when that channel receives the message, because
by then every channel opened earlier has received it too.

```typescript
const configure = (setting: object): Promise<void> =>
  new Promise((resolve) => {
    const probe = new BroadcastChannel("app.configuration");
    const sender = new BroadcastChannel("app.configuration");
    probe.onmessage = () => {
      probe.close();
      setTimeout(resolve);
    };
    sender.postMessage({ type: LocalizerGesture.ON_APP_CONFIG_CHANGE, ...setting });
    sender.close();
  });
```

## How the language and the lexicon are resolved

**The starting language**, worked out once, at construction:

1. the `language` option, if the component passed one;
2. else the stored language under the `storage` key, if there is one;
3. else `navigator.language`, the browser's language.

The result is cut to its base code in lower case: `en-US` becomes `en`, `de-CH` becomes
`de`.

**A language set later**, through the channel or `setLanguage`, is used as it arrives: it is
not cut to its base code. The Language component only ever posts base codes.

**The lexicon**, worked out every time it is read:

1. the bundle for the active language;
2. else the bundle for `en`;
3. else the first bundle there is.

If there is no bundle at all, reading the lexicon throws.

## The specification

Nothing in the policies describes yet how a component declares its use of the Localizer in
its specification. The title records it as a gesture, `onlanguagechange`, in an older form
that the gesture schema cannot check: the schema asks for a trigger with a `target` part
and an `operation`, and the Localizer is neither a part nor something that calls an
operation. Until that is decided, the entry stays as it is.

## What this guide found

Writing this guide against the title turned up the following. The first three were
confirmed by running the title in the browser; the rest are from reading the code.

| # | Finding | Where the fix belongs |
|---|---|---|
| 1 | A title that is off the page when the language changes shows the old language when it is put back: its Localizer closed the channel, and does not read `app.language` again when it is opened | the Localizer: read the stored language again in `initialize()` |
| 2 | A title created before the language changes, and connected after, starts in the old language, for the same reason | the Localizer, the same change |
| 3 | A regional code posted at runtime, such as `de-CH`, is not cut to `de`, so the title falls back to English | the Localizer: cut a language set at runtime to its base code, as at construction |
| 4 | The lexicon has no name of its own: it is written inside `Configuration`. The Language component names its `Lexicon` | the title: declare `type Lexicon` in `title.meta.ts` |
| 5 | The three buttons are pictures with no accessible name, so a screen reader announces them without a word; when they get one, it must come from the lexicon | the title |
| 6 | `onlanguagechange` is handled by `_updateLabel` directly, where the gesture policy asks for a `_handle…` handler that calls an operation | the title, once a policy for add-ons exists |
| 7 | The tests write the channel name and the lexicon texts as literals, where the Localizer exports `Channel.CONFIGURATION` | the title's tests |

## Adding the Localizer to a component

1. Add `@scalable.software/localizer` to the dependencies and to both import maps.
2. Declare the lexicon type, and extend the base `Configuration` with `localizations` in
   `<component>.meta.ts`.
3. Write a bundle for every supported language in the configuration, `en` always among them.
4. Declare `Storage.LANGUAGE = "app.language"` in `<component>.meta.ts`.
5. Create the Localizer in a private field with `{ storage: Storage.LANGUAGE }`.
6. Call `initialize()` in `_initialize`, and `dispose()` in `_dispose`.
7. Declare `ON_LANGUAGE_CHANGE` in `Gesture`, taken from the Localizer's `Event`.
8. Subscribe in `_addEventListeners`, and set the subscription to `null` in
   `_removeEventListeners`.
9. Read `this._localizer.lexicon` every time a text is drawn, and redraw every text when the
   language changes.
10. Never write `app.language`.
11. Test the starting language, a posted language, the end of listening on removal, the
    closed channel, and that the component never writes the language.
