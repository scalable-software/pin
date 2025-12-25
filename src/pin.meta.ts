/**
 * @module Component
 */

export const Tag = "pin-button" as const;

/**
 * HTML Attributes available to set
 * @category Metadata: State
 * @enum
 */
export const Attributes = {
  VISIBLE: "visible",
  STATUS: "status",
} as const;
/**
 * HTML Attributes available to set
 * @category Metadata: State
 */
export type Attributes = typeof Attributes;

/**
 * HTML Attributes available to set
 * @category Metadata: State
 * @enum
 */
export const State = {
  ...Attributes,
} as const;

/**
 * HTML Attributes available to set
 * @category Metadata: State
 */
export type State = (typeof State)[keyof typeof State];

/**
 * Visible state used to show or hide the component
 * @category Metadata: State
 * @enum
 */
export const Visible = {
  YES: "yes",
  NO: "no",
} as const;
/**
 * Visible state used to show or hide the component
 * @category Metadata: State
 */
export type Visible = (typeof Visible)[keyof typeof Visible];

/**
 * @category Metadata: State
 * @enum
 */
export const Status = {
  PINNED: "pinned",
} as const;
/**
 * @category Metadata: State
 */
export type Status = (typeof Status)[keyof typeof Status];

/**
 * @category Metadata: Operations
 * @enum
 */
export const Operation = {
  HIDE: "hide",
  SHOW: "show",
} as const;

/**
 * @category Metadata: Operations
 */
export type Operation = (typeof Operation)[keyof typeof Operation];

/**
 * @category Metadata: Events
 * @enum
 */
export const Event = {
  ON_HIDE: "onhide",
  ON_SHOW: "onshow",
} as const;
/**
 * @category Metadata: Events
 */
export type Event = (typeof Event)[keyof typeof Event];

/**
 * @category Metadata: Gesture
 * @enum
 */
export const Gesture = {} as const;
/**
 * @category Metadata: Gesture
 */
export type Gesture = (typeof Gesture)[keyof typeof Gesture];
