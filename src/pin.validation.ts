import { Visible, Status } from "./pin.meta.js";

export class Validate {
  /**
   * Validates that the value is a member of the `Visible` enum.
   * Throws if the value is not a recognized visible state.
   * @category Validation
   */
  public static visible = (value: string) => {
    const valid = Object.values(Visible).includes(value as Visible);
    if (!valid) {
      throw new Error(`Invalid visible value: ${value}`);
    }
    return value as Visible;
  };

  /**
   * Validates that the value is a member of the `Status` enum.
   * Throws if the value is not a recognized status state.
   * @category Validation
   */
  public static status = (value: string) => {
    const valid = Object.values(Status).includes(value as Status);
    if (!valid) {
      throw new Error(`Invalid status value: ${value}`);
    }
    return value as Status;
  };
}
