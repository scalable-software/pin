/**
 * @module Pin
 */

import { Visibility, Status, Appearance } from "./pin.meta.js";

/**
 * @category Validation
 */
export class Validate {
  /**
   * Validates that the value is a member of the `Visibility` enum.
   * Throws if the value is not a recognized visibility state.
   * @category Validation
   */
  public static visibility = (value: unknown) => {
    const valid = Object.values(Visibility).includes(value as Visibility);
    if (!valid) {
      throw new Error(`Invalid visibility value: ${value}`);
    }
    return value as Visibility;
  };

  /**
   * Validate that the value is a member of the `Status` enum.
   * Throws if the value is not a recognized status state.
   * @category Validation
   */
  public static status = (value: unknown) => {
    const valid = Object.values(Status).includes(value as Status);
    if (!valid) {
      throw new Error(`Invalid status value: ${value}`);
    }
    return value as Status;
  };

  /**
   * Validate that the value is a member of the `Appearance` enum.
   * Throws if the value is not a recognized appearance state.
   * @category Validation
   */
  public static appearance = (value: unknown) => {
    const valid = Object.values(Appearance).includes(value as Appearance);
    if (!valid) {
      throw new Error(`Invalid appearance value: ${value}`);
    }
    return value as Appearance;
  };
}
