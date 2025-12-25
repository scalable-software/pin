/**
 * @module Component
 */
import { Component, Template } from "@scalable.software/component";
import { type Configuration, type Handler } from "@scalable.software/component";

import { Tag, Attributes, Visible, Status, Event } from "./pin.meta.js";

/**
 * Configuration required for components with custom layout and style
 * @category Configuration
 */
export const configuration: Configuration = {
  url: import.meta.url,
  template: {
    id: Tag,
  },
  css: {
    name: "pin.style.css",
  },
} as const;

/**
 * A pin button that can be:
 * 1. pinned and unpinned
 * 2. hidden and shown
 * @category Components
 */
export class Pin extends Component {
  /**
   * The tag name of the component
   * @category Configuration
   */
  public static get Tag() {
    return Tag;
  }

  /**
   * Only attributes defined the Attributes object will be observed in DOM
   * @category Configuration
   */
  public static get Attributes(): Attributes {
    return Attributes;
  }

  /**
   * Helper function to load the component template into DOM
   * @category Utility
   */
  public static Template = new Template(import.meta.url);

  /**
   * Cache element references to improve performance
   * @category State
   * @hidden
   */
  protected elements: {} = {};

  /**
   * Internal Visibility state of the component
   * @category State
   * @default Visible.YES
   * @hidden
   */
  private _visible: Visible = Visible.YES;

  /**
   * Internal Status state of the component
   * @category State
   * @default
   * @hidden
   */
  private _status: Status = Status.UNPINNED;

  /**
   * onhide triggered when pin visibility changes to hidden
   * @category Events
   * @hidden
   */
  private _onhide: Handler = null;

  /**
   * onshow triggered when pin visibility changes to visible
   * @category Events
   * @hidden
   */
  private _onshow: Handler = null;

  constructor() {
    super(configuration);
  }

  /**
   * Get and Sets the visibility of the pin button
   * @category State
   */
  public get visible() {
    return this.hasAttribute(Attributes.VISIBLE)
      ? (this.getAttribute(Attributes.VISIBLE) as Visible)
      : this._visible;
  }
  public set visible(visible: Visible) {
    visible = visible ?? Visible.YES;
    if (this._visible !== visible) {
      this._visible = visible;
      visible === Visible.YES && this.removeAttribute(Attributes.VISIBLE);
      visible === Visible.NO && this.setAttribute(Attributes.VISIBLE, visible);

      visible === Visible.NO &&
        this._dispatchEvent(Event.ON_HIDE, { detail: { visible } });
      visible === Visible.YES &&
        this._dispatchEvent(Event.ON_SHOW, { detail: { visible } });
    }
  }

  /**
   * Get and Sets the status of the pin button
   * @category State
   */
  public get status(): Status {
    return this.hasAttribute(Attributes.STATUS)
      ? (this.getAttribute(Attributes.STATUS) as Status)
      : this._status;
  }
  public set status(status: Status) {
    if (this._status !== status) {
      this._status = status;
    }
  }

  /**
   * Triggered via `.hide()`
   * @event
   * @category Events
   */
  public set onhide(handler: Handler) {
    this._onhide && this.removeEventListener(Event.ON_HIDE, this._onhide);
    this._onhide = handler;
    this._onhide && this.addEventListener(Event.ON_HIDE, this._onhide);
  }

  /**
   * Triggered via `.show()`
   * @event
   * @category Events
   */
  public set onshow(handler: Handler) {
    this._onshow && this.removeEventListener(Event.ON_SHOW, this._onshow);
    this._onshow = handler;
    this._onshow && this.addEventListener(Event.ON_SHOW, this._onshow);
  }

  /**
   * Hide the pin button when it is visible
   * @category Operations
   */
  public hide = () => (this.visible = Visible.NO);

  /**
   * Show the pin button when it is hidden
   * @category Operations
   */
  public show = () => (this.visible = Visible.YES);

  /**
   * List operations to perform for selected attributes being observed in the DOM.
   * @category Configuration
   * @hidden
   */
  protected _attributeHandlers = {
    [Attributes.VISIBLE]: (value) => (this.visible = value),
  };

  /**
   * Initialize component attributes with default values
   * @category Configuration
   * @hidden
   */
  protected _initialize = () => {};

  /**
   * Cache element references to improve performance
   * @category Configuration
   * @hidden
   */
  protected _cache = () => {};

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
