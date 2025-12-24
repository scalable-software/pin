import {
  Tag,
  Attributes,
  State,
  Operation,
  Event,
  Gesture,
} from "@scalable.software/pin";

metadata("Tag", () => {
  and("Tag imported", () => {
    then("Tag is defined", () => {
      expect(Tag).toBeDefined();
    });
  });
});

metadata("Attributes", () => {
  and("Attribute imported", () => {
    then("Attributes is defined", () => {
      expect(Attributes).toBeDefined();
    });

    and("Attributes is defined", () => {
      then("Attributes is an object", () => {
        expect(typeof Attributes).toBe("object");
      });
    });
  });
});

metadata("States", () => {
  and("State imported", () => {
    then("State is defined", () => {
      expect(State).toBeDefined();
    });

    and("State is defined", () => {
      then("State is an object", () => {
        expect(typeof State).toBe("object");
      });
    });
  });
});

metadata("Operations", () => {
  and("Operation imported", () => {
    then("Operation is defined", () => {
      expect(Operation).toBeDefined();
    });

    and("Operation is defined", () => {
      then("Operation is an object", () => {
        expect(typeof Operation).toBe("object");
      });
    });
  });
});

metadata("Events", () => {
  and("Event imported", () => {
    then("Event is defined", () => {
      expect(Event).toBeDefined();
    });

    and("Event is defined", () => {
      then("Event is an object", () => {
        expect(typeof Event).toBe("object");
      });
    });
  });
});

metadata("Gestures", () => {
  and("Gesture imported", () => {
    then("Gesture is defined", () => {
      expect(Gesture).toBeDefined();
    });

    and("Gesture is defined", () => {
      then("Gesture is an object", () => {
        expect(typeof Gesture).toBe("object");
      });
    });
  });
});
