/**
 * @module Pin
 */

// Base Component
import { Component, Template } from "@scalable.software/component";
import { type Configuration } from "@scalable.software/component";

// Pin Metadata
import {
  Tag,
  CSS,
  Attributes,
  Visibility,
  Status,
  Event,
  Gesture
} from "./pin.meta.js";

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
   * Internal Status state of the component
   * @category State
   * @default Status.UNPINNED
   * @hidden
   */
  private _status: Status = Status.UNPINNED;

  /**
   * onhide triggered when pin visibility changes to hidden
   * @category Events
   * @hidden
   */
  private _onhide: EventListener | null = null;

  /**
   * onshow triggered when pin visibility changes to visible
   * @category Events
   * @hidden
   */
  private _onshow: EventListener | null = null;

  /**
   * onpin triggered when pin status changes to pinned
   * @category Events
   * @hidden
   */
  private _onpin: EventListener | null = null;

  /**
   * onunpin triggered when pin status changes to unpinned
   * @category Events
   * @hidden
   */
  private _onunpin: EventListener | null = null;

  /**
   * Cache element references to improve performance
   * @category State
   * @hidden
   */
  protected elements: { icon: HTMLDivElement | null } = { icon: null };

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
    value === Visibility.VISIBLE && this._dispatchEvent(Event.ON_SHOW, message);
  }

  /**
   * Get and set the status of the pin button
   * @category State
   */
  public get status() {
    return this._status;
  }
  public set status(value: Status) {
    value = Validate.status(value);

    if (this._status === value) return;

    this._status = value;

    this.setAttribute(Attributes.STATUS, value);

    const message = { detail: { status: value } };

    value === Status.PINNED && this._dispatchEvent(Event.ON_PIN, message);
    value === Status.UNPINNED && this._dispatchEvent(Event.ON_UNPIN, message);
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
   * Triggered via `.show()`
   * @event
   * @category Events
   */
  public set onshow(handler: EventListener | null) {
    this._onshow && this.removeEventListener(Event.ON_SHOW, this._onshow);
    this._onshow = handler;
    this._onshow && this.addEventListener(Event.ON_SHOW, this._onshow);
  }

  /**
   * Trigger via `.pin()`
   * @event
   * @category Events
   */
  public set onpin(handler: EventListener | null) {
    this._onpin && this.removeEventListener(Event.ON_PIN, this._onpin);
    this._onpin = handler;
    this._onpin && this.addEventListener(Event.ON_PIN, this._onpin);
  }

  /**
   * Trigger via `.unpin()`
   * @event
   * @category Events
   */
  public set onunpin(handler: EventListener | null) {
    this._onunpin && this.removeEventListener(Event.ON_UNPIN, this._onunpin);
    this._onunpin = handler;
    this._onunpin && this.addEventListener(Event.ON_UNPIN, this._onunpin);
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
   * Pin the pin button when it is unpinned
   * @category Operations
   */
  public pin = () => (this.status = Status.PINNED);

  /**
   * Unpin the pin button when it is pinned
   * @category Operations
   */
  public unpin = () => (this.status = Status.UNPINNED);

  /**
   * Pin the pin button when it is unpinned, and unpin it when it is pinned
   * @category Operations
   */
  public toggle = () =>
    (this.status =
      this.status === Status.PINNED ? Status.UNPINNED : Status.PINNED);

  /**
   * List operations to perform for selected attributes being observed in the DOM.
   * @category Configuration
   * @hidden
   */
  protected _attributeHandlers = {
    [Attributes.VISIBILITY]: (value: Visibility | null) =>
      (this.visibility = value),
    [Attributes.STATUS]: (value: Status) => (this.status = value)
  };

  /**
   * Cache element references to improve performance
   * @category Configuration
   * @hidden
   */
  protected _cache = () => {
    this.elements.icon = this.root.querySelector(".icon");
  };

  /**
   * Initialize pin attributes with default values
   * @category Configuration
   * @hidden
   */
  protected _initialize = () => {
    !this.hasAttribute(Attributes.STATUS) &&
      this.setAttribute(Attributes.STATUS, this._status);
  };

  /**
   * Called by the connectedCallback prototypical method
   * @category Configuration
   * @hidden
   */
  protected _addEventListeners = () => {
    this.elements.icon?.addEventListener(Gesture.CLICK, this._handleClick);
  };

  /**
   * Called by the disconnectedCallback prototypical method
   * @category Configuration
   * @hidden
   */
  protected _removeEventListeners = () => {
    this.elements.icon?.removeEventListener(Gesture.CLICK, this._handleClick);
  };

  /**
   * Handles the click event
   * @category Gesture
   * @hidden
   */
  private _handleClick = (event: MouseEvent | TouchEvent) => this.toggle();
}
