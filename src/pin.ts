/**
 * @module Pin
 */

// Base Component
import { Component, Template } from "@scalable.software/component";
import { type Configuration } from "@scalable.software/component";

// Pin Metadata
import { Tag, CSS, Attributes, Visibility, Event } from "./pin.meta.js";

// Validation
import { Validate } from "./pin.validation.js";

/**
 * Optional Configuration: required for pins with custom layout and style
 * @category Configuration
 */
export const configuration: Configuration = {
  url: import.meta.url,
  template: {
    id: Tag
  },
  css: {
    name: CSS
  }
} as const;

/**
 * @category Pin
 */
export class Pin extends Component {
  /**
   * The tag name of the pin
   * @category Configuration
   */
  public static get Tag() {
    return Tag;
  }

  /**
   * Only attributes defined the Attributes object will be observed in DOM
   * @category State
   */
  public static get Attributes(): Attributes {
    return Attributes;
  }

  /**
   * Helper function to load the pin template into DOM
   * @category Utility
   */
  public static Template = new Template(import.meta.url);

  /**
   * Internal Visibility state of the component
   * @category State
   * @default Visibility.VISIBLE
   * @hidden
   */
  private _visibility: Visibility = Visibility.VISIBLE;

  /**
   * onhide triggered when pin visibility changes to hidden
   * @category Events
   * @hidden
   */
  private _onhide: EventListener | null = null;

  /**
   * Cache element references to improve performance
   * @category State
   * @hidden
   */
  protected elements: {} = {};

  /**
   * @hidden
   */
  constructor() {
    super(configuration);
  }

  /**
   * Get and set the visibility of the pin button
   * @category State
   */
  public get visibility(): Visibility {
    return this._visibility;
  }
  public set visibility(value: Visibility | null) {
    value = value ?? Visibility.VISIBLE;

    value = Validate.visibility(value);

    if (this._visibility === value) return;

    this._visibility = value;

    value === Visibility.HIDDEN &&
      this.setAttribute(Attributes.VISIBILITY, value);
    value === Visibility.VISIBLE && this.removeAttribute(Attributes.VISIBILITY);

    const message = { detail: { visibility: value } };

    value === Visibility.HIDDEN && this._dispatchEvent(Event.ON_HIDE, message);
  }

  /**
   * Triggered via `.hide()`
   * @event
   * @category Events
   */
  public set onhide(handler: EventListener | null) {
    this._onhide && this.removeEventListener(Event.ON_HIDE, this._onhide);
    this._onhide = handler;
    this._onhide && this.addEventListener(Event.ON_HIDE, this._onhide);
  }

  /**
   * Hide the pin button when it is visible
   * @category Operations
   */
  public hide = () => (this.visibility = Visibility.HIDDEN);

  /**
   * Show the pin button when it is hidden
   * @category Operations
   */
  public show = () => (this.visibility = Visibility.VISIBLE);

  /**
   * List operations to perform for selected attributes being observed in the DOM.
   * @category Configuration
   * @hidden
   */
  protected _attributeHandlers = {
    [Attributes.VISIBILITY]: (value: Visibility | null) =>
      (this.visibility = value)
  };

  /**
   * Cache element references to improve performance
   * @category Configuration
   * @hidden
   */
  protected _cache = () => {};

  /**
   * Initialize pin attributes with default values
   * @category Configuration
   * @hidden
   */
  protected _initialize = () => {};

  /**
   * Called by the connectedCallback prototypical method
   * @category Configuration
   * @hidden
   */
  protected _addEventListeners = () => {};

  /**
   * Called by the disconnectedCallback prototypical method
   * @category Configuration
   * @hidden
   */
  protected _removeEventListeners = () => {};
}
