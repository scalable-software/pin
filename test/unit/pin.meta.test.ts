import {
  Tag,
  Attributes,
  State,
  Visibility,
  Status,
  Operation,
  Event,
  Gesture
} from "@scalable.software/pin";

// Tag
metadata(Metadata.TAG, () => {
  when("Tag imported", () => {
    then("Tag is defined", () => {
      expect(Tag).toBeDefined();
    });
  });
});

// Attributes
metadata(Metadata.ATTRIBUTES, () => {
  and("Attribute imported", () => {
    then("Attributes is defined", () => {
      expect(Attributes).toBeDefined();
    });

    and("Attributes is defined", () => {
      then("Attributes is an object", () => {
        expect(typeof Attributes).toBe("object");
      });

      when("Attributes is an object", () => {
        then("`Attributes.VISIBILITY` exists", () => {
          expect(Attributes.VISIBILITY).toBeDefined();
        });

        then("`Attributes.STATUS` exists", () => {
          expect(Attributes.STATUS).toBeDefined();
        });
      });
    });
  });
});

// State
metadata(Metadata.STATE, () => {
  and("State imported", () => {
    then("State is defined", () => {
      expect(State).toBeDefined();
    });

    and("State is defined", () => {
      then("State is an object", () => {
        expect(typeof State).toBe("object");
      });

      when("State is an object", () => {
        then("`State.VISIBILITY` exists", () => {
          expect(State.VISIBILITY).toBeDefined();
        });

        then("`State.STATUS` exists", () => {
          expect(State.STATUS).toBeDefined();
        });
      });
    });
  });
});

metadata(State.VISIBILITY, () => {
  and("Visibility imported", () => {
    then("Visibility is defined", () => {
      expect(Visibility).toBeDefined();
    });

    and("Visibility is defined", () => {
      then("Visibility is an object", () => {
        expect(typeof Visibility).toBe("object");
      });

      when("Visibility is an object", () => {
        then("`Visibility.VISIBLE` exists", () => {
          expect(Visibility.VISIBLE).toBeDefined();
        });

        then("`Visibility.HIDDEN` exists", () => {
          expect(Visibility.HIDDEN).toBeDefined();
        });
      });
    });
  });
});

metadata(State.STATUS, () => {
  and("Status imported", () => {
    then("Status is defined", () => {
      expect(Status).toBeDefined();
    });

    and("Status is defined", () => {
      then("Status is an object", () => {
        expect(typeof Status).toBe("object");
      });

      when("Status is an object", () => {
        then("`Status.PINNED` exists", () => {
          expect(Status.PINNED).toBeDefined();
        });

        then("`Status.UNPINNED` exists", () => {
          expect(Status.UNPINNED).toBeDefined();
        });
      });
    });
  });
});

// Operation
metadata(Metadata.OPERATION, () => {
  and("Operation imported", () => {
    then("Operation is defined", () => {
      expect(Operation).toBeDefined();
    });

    and("Operation is defined", () => {
      then("Operation is an object", () => {
        expect(typeof Operation).toBe("object");
      });

      when("Operation is an object", () => {
        then("`Operation.HIDE` exists", () => {
          expect(Operation.HIDE).toBeDefined();
        });

        then("`Operation.SHOW` exists", () => {
          expect(Operation.SHOW).toBeDefined();
        });

        then("`Operation.PIN` exists", () => {
          expect(Operation.PIN).toBeDefined();
        });

        then("`Operation.UNPIN` exists", () => {
          expect(Operation.UNPIN).toBeDefined();
        });

        then("`Operation.TOGGLE` exists", () => {
          expect(Operation.TOGGLE).toBeDefined();
        });
      });
    });
  });
});

// Event
metadata(Metadata.EVENT, () => {
  and("Event imported", () => {
    then("Event is defined", () => {
      expect(Event).toBeDefined();
    });

    and("Event is defined", () => {
      then("Event is an object", () => {
        expect(typeof Event).toBe("object");
      });

      when("Event is an object", () => {
        then("`Event.ON_HIDE` exists", () => {
          expect(Event.ON_HIDE).toBeDefined();
        });

        then("`Event.ON_SHOW` exists", () => {
          expect(Event.ON_SHOW).toBeDefined();
        });

        then("`Event.ON_PIN` exists", () => {
          expect(Event.ON_PIN).toBeDefined();
        });

        then("`Event.ON_UNPIN` exists", () => {
          expect(Event.ON_UNPIN).toBeDefined();
        });
      });
    });
  });
});

// Gesture
metadata(Metadata.GESTURE, () => {
  and("Gesture imported", () => {
    then("Gesture is defined", () => {
      expect(Gesture).toBeDefined();
    });

    and("Gesture is defined", () => {
      then("Gesture is an object", () => {
        expect(typeof Gesture).toBe("object");
      });

      when("Gesture is an object", () => {
        then("`Gesture.CLICK` exists", () => {
          expect(Gesture.CLICK).toBeDefined();
        });
      });
    });
  });
});
