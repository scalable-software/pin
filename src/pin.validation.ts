import { Visible } from "./pin.meta.js";

export class Validate {
  /**
   * Validates that the value is a member of the `Visibility` enum.
   * Throws if the value is not a recognized visibility state.
   * @category Validation
   */
  public static visible = (value: string) => {
    const valid = Object.values(Visible).includes(value as Visible);
    if (!valid) {
      throw new Error(`Invalid visible value: ${value}`);
    }
    return value as Visible;
  };
}
