import {
  Tag,
  Attributes,
  State,
  Visibility,
  Status,
  Appearance,
  Operation,
  Event,
  Gesture,
  Key
} from "@scalable.software/pin";

// Tag
metadata(Metadata.TAG, () => {
  when("Tag imported", () => {
    then("Tag is defined", () => {
      expect(Tag).toBeDefined();
    });

    then("Tag is `pin-button`", () => {
      expect(Tag).toBe("pin-button");
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

        then("`Attributes.VISIBILITY` is `visibility`", () => {
          expect(Attributes.VISIBILITY).toBe("visibility");
        });

        then("`Attributes.STATUS` exists", () => {
          expect(Attributes.STATUS).toBeDefined();
        });

        then("`Attributes.STATUS` is `status`", () => {
          expect(Attributes.STATUS).toBe("status");
        });

        then("`Attributes.APPEARANCE` exists", () => {
          expect(Attributes.APPEARANCE).toBeDefined();
        });

        then("`Attributes.APPEARANCE` is `appearance`", () => {
          expect(Attributes.APPEARANCE).toBe("appearance");
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
        then("no state name is taken by the platform", () => {
          const taken = Object.values(State).filter(
            (name) => name in HTMLElement.prototype
          );
          expect(taken).toEqual([]);
        });

        then("`State.VISIBILITY` exists", () => {
          expect(State.VISIBILITY).toBeDefined();
        });

        then("`State.VISIBILITY` is `visibility`", () => {
          expect(State.VISIBILITY).toBe("visibility");
        });

        then("`State.STATUS` exists", () => {
          expect(State.STATUS).toBeDefined();
        });

        then("`State.STATUS` is `status`", () => {
          expect(State.STATUS).toBe("status");
        });

        then("`State.APPEARANCE` exists", () => {
          expect(State.APPEARANCE).toBeDefined();
        });

        then("`State.APPEARANCE` is `appearance`", () => {
          expect(State.APPEARANCE).toBe("appearance");
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

        then("`Visibility.VISIBLE` is `visible`", () => {
          expect(Visibility.VISIBLE).toBe("visible");
        });

        then("`Visibility.HIDDEN` exists", () => {
          expect(Visibility.HIDDEN).toBeDefined();
        });

        then("`Visibility.HIDDEN` is `hidden`", () => {
          expect(Visibility.HIDDEN).toBe("hidden");
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

        then("`Status.PINNED` is `pinned`", () => {
          expect(Status.PINNED).toBe("pinned");
        });

        then("`Status.UNPINNED` exists", () => {
          expect(Status.UNPINNED).toBeDefined();
        });

        then("`Status.UNPINNED` is `unpinned`", () => {
          expect(Status.UNPINNED).toBe("unpinned");
        });
      });
    });
  });
});

metadata(State.APPEARANCE, () => {
  and("Appearance imported", () => {
    then("Appearance is defined", () => {
      expect(Appearance).toBeDefined();
    });

    and("Appearance is defined", () => {
      then("Appearance is an object", () => {
        expect(typeof Appearance).toBe("object");
      });

      when("Appearance is an object", () => {
        then("`Appearance.FLOATING` exists", () => {
          expect(Appearance.FLOATING).toBeDefined();
        });

        then("`Appearance.FLOATING` is `floating`", () => {
          expect(Appearance.FLOATING).toBe("floating");
        });

        then("`Appearance.FLAT` exists", () => {
          expect(Appearance.FLAT).toBeDefined();
        });

        then("`Appearance.FLAT` is `flat`", () => {
          expect(Appearance.FLAT).toBe("flat");
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
        then("no operation name is taken by the platform", () => {
          const taken = Object.values(Operation).filter(
            (name) => name in HTMLElement.prototype
          );
          expect(taken).toEqual([]);
        });

        then("`Operation.HIDE` exists", () => {
          expect(Operation.HIDE).toBeDefined();
        });

        then("`Operation.HIDE` is `hide`", () => {
          expect(Operation.HIDE).toBe("hide");
        });

        then("`Operation.SHOW` exists", () => {
          expect(Operation.SHOW).toBeDefined();
        });

        then("`Operation.SHOW` is `show`", () => {
          expect(Operation.SHOW).toBe("show");
        });

        then("`Operation.PIN` exists", () => {
          expect(Operation.PIN).toBeDefined();
        });

        then("`Operation.PIN` is `pin`", () => {
          expect(Operation.PIN).toBe("pin");
        });

        then("`Operation.UNPIN` exists", () => {
          expect(Operation.UNPIN).toBeDefined();
        });

        then("`Operation.UNPIN` is `unpin`", () => {
          expect(Operation.UNPIN).toBe("unpin");
        });

        then("`Operation.TOGGLE` exists", () => {
          expect(Operation.TOGGLE).toBeDefined();
        });

        then("`Operation.TOGGLE` is `toggle`", () => {
          expect(Operation.TOGGLE).toBe("toggle");
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
        then("no event name is taken by the platform", () => {
          const taken = Object.values(Event).filter(
            (name) => name in HTMLElement.prototype
          );
          expect(taken).toEqual([]);
        });

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

        then("`Gesture.KEYDOWN` exists", () => {
          expect(Gesture.KEYDOWN).toBeDefined();
        });
      });
    });
  });
});

// Key
metadata(Metadata.KEY, () => {
  and("Key imported", () => {
    then("Key is defined", () => {
      expect(Key).toBeDefined();
    });

    and("Key is defined", () => {
      then("Key is an object", () => {
        expect(typeof Key).toBe("object");
      });

      when("Key is an object", () => {
        then("`Key.ENTER` exists", () => {
          expect(Key.ENTER).toBeDefined();
        });
      });
    });
  });
});
