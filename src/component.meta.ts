/**
 * @module Component
 */

export const Tag = "component-template" as const;

/**
 * HTML Attributes available to set
 * @category Metadata: State
 * @enum
 */
export const Attributes = {} as const;
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
 * @category Metadata: Operations
 * @enum
 */
export const Operation = {} as const;

/**
 * @category Metadata: Operations
 */
export type Operation = (typeof Operation)[keyof typeof Operation];

/**
 * @category Metadata: Events
 * @enum
 */
export const Event = {} as const;
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
