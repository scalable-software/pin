import { State, Visible } from "@scalable.software/pin";

import { Validate } from "@scalable.software/pin";

validation(State.VISIBLE, () => {
  given("Validate imported", () => {
    and("value is a valid visible state", () => {
      let value: any;
      beforeEach(() => {
        value = Visible.YES;
      });
      when("Validate.visible(value) is called", () => {
        let error;
        let result;
        beforeEach(() => {
          try {
            result = Validate.visible(value);
          } catch (err) {
            error = err;
          }
        });
        then("does not throw an error", () => {
          expect(error).toBeUndefined();
        });
      });
    });

    and("value is an invalid visible state", () => {
      let value: any;
      beforeEach(() => {
        value = "invalid";
      });
      when("Validate.visible(value) is called", () => {
        let error;
        let result;
        beforeEach(() => {
          try {
            result = Validate.visible(value);
          } catch (err) {
            error = err;
          }
        });
        then("Validate.visible(value) throws", () => {
          expect(error).not.toBeUndefined();
        });

        and("error message contains 'Invalid visible value'", () => {
          then("error message contains 'Invalid visible value'", () => {
            expect((error as Error).message).toEqual(
              "Invalid visible value: invalid",
            );
          });
        });
      });
    });
  });
});
