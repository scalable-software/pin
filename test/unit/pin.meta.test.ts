import {
  Tag,
  Attributes,
  State,
  Visible,
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

    and("Attributes is an object", () => {
      then("Attributes has VISIBLE", () => {
        expect(Attributes.VISIBLE).toBe("visible");
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

    and("State is an object", () => {
      then("State has VISIBLE", () => {
        expect(State.VISIBLE).toBe("visible");
      });
    });
  });

  and("Visible imported", () => {
    then("Visible is defined", () => {
      expect(Visible).toBeDefined();
    });

    and("Visible is defined", () => {
      then("Visible.YES is defined", () => {
        expect(Visible.YES).toBeDefined();
      });

      then("Visible.NO is defined", () => {
        expect(Visible.NO).toBeDefined();
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

      and("Operation is an object", () => {
        then("Operation.HIDE is defined", () => {
          expect(Operation.HIDE).toBeDefined();
        });

        then("Operation.SHOW is defined", () => {
          expect(Operation.SHOW).toBeDefined();
        });
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

      and("Event is an object", () => {
        then("Event.ON_HIDE is defined", () => {
          expect(Event.ON_HIDE).toBeDefined();
        });
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
