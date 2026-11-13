/**
 * @module Component
 */

/**
 * @category Configuration
 */
export const Tag = "pin-button" as const;

/**
 * @category Configuration
 */
export const CSS = "pin.style.css" as const;

/**
 * HTML Attributes available to set
 * @category Metadata
 * @enum
 */
export const Attributes = {
  VISIBILITY: "visibility",
  STATUS: "status",
  APPEARANCE: "appearance"
} as const;
/**
 * HTML Attributes available to set
 * @category Metadata
 */
export type Attributes = typeof Attributes;

/**
 * HTML Attributes available to set
 * @category Metadata
 * @enum
 */
export const State = {
  ...Attributes
} as const;

/**
 * HTML Attributes available to set
 * @category Metadata
 */
export type State = (typeof State)[keyof typeof State];

/**
 * Indicates whether the component is visible or hidden
 * @category Metadata
 * @enum
 */
export const Visibility = {
  VISIBLE: "visible",
  HIDDEN: "hidden"
} as const;
/**
 * Indicates whether the component is visible or hidden
 * @category Metadata
 */
export type Visibility = (typeof Visibility)[keyof typeof Visibility];

/**
 * Indicates whether the component is pinned or unpinned
 * @category Metadata
 * @enum
 */
export const Status = {
  PINNED: "pinned",
  UNPINNED: "unpinned"
} as const;
/**
 * Indicates whether the component is pinned or unpinned
 * @category Metadata
 */
export type Status = (typeof Status)[keyof typeof Status];

/**
 * Indicates whether the component stands alone or lies flat inside another surface
 * @category Metadata
 * @enum
 */
export const Appearance = {
  FLOATING: "floating",
  FLAT: "flat"
} as const;
/**
 * Indicates whether the component stands alone or lies flat inside another surface
 * @category Metadata
 */
export type Appearance = (typeof Appearance)[keyof typeof Appearance];

/**
 * @category Metadata
 * @enum
 */
export const Operation = {
  HIDE: "hide",
  SHOW: "show",
  PIN: "pin",
  UNPIN: "unpin",
  TOGGLE: "toggle"
} as const;

/**
 * @category Metadata
 */
export type Operation = (typeof Operation)[keyof typeof Operation];

/**
 * @category Metadata
 * @enum
 */
export const Event = {
  ON_HIDE: "onhide",
  ON_SHOW: "onshow",
  ON_PIN: "onpin",
  ON_UNPIN: "onunpin"
} as const;
/**
 * @category Metadata
 */
export type Event = (typeof Event)[keyof typeof Event];

/**
 * @category Metadata
 * @enum
 */
export const Gesture = {
  CLICK: "click",
  KEYDOWN: "keydown"
} as const;
/**
 * @category Metadata
 */
export type Gesture = (typeof Gesture)[keyof typeof Gesture];

/**
 * Keys a keyboard gesture responds to
 * @category Metadata
 * @enum
 */
export const Key = {
  ENTER: "Enter"
} as const;
/**
 * @category Metadata
 */
export type Key = (typeof Key)[keyof typeof Key];

/**
 * Every state the component must have
 * @category Metadata
 */
export type States = Record<State, unknown>;

/**
 * Every operation the component must have
 * @category Metadata
 */
export type Operations = Record<Operation, (...parameters: any[]) => unknown>;

/**
 * Every event the component must have a subscription property for
 * @category Metadata
 */
export type Events = Record<Event, EventListener | null>;

/**
 * Everything the metadata says the component has: implemented by the component
 * @category Metadata
 */
export type Meta = States & Operations & Events;
