import { State } from "@scalable.software/pin";

import { Validate } from "@scalable.software/pin";

validation(State.VISIBILITY, () => {
  given("Validate imported", () => {
    then("Validate is defined", () => {
      expect(Validate).toBeDefined();
    });

    and("Validate is defined", () => {
      then("`Validate.visibility` static method exists", () => {
        expect(Validate.visibility).toBeDefined();
      });
    });
  });
});
