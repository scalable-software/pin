globalThis.given = (description, spec) =>
  describe(`Given ${description}`, spec);
globalThis.and = (description, spec) => describe(`and ${description}`, spec);
globalThis.when = (description, spec) => describe(`when ${description}`, spec);
globalThis.then = (description, spec) => it(`then ${description}`, spec);

globalThis.configuration = (configuration, spec) => {
  describe(`Configuration.${configuration} test`, () => {
    beforeEach(() => {
      setSpecProperty("type", "configuration");
      setSpecProperty("spec", configuration);
    });

    spec();
  });
};
globalThis.utility = (utility, spec) => {
  describe(`Utility.${utility} test`, () => {
    beforeEach(() => {
      setSpecProperty("type", "utility");
      setSpecProperty("spec", utility);
    });

    spec();
  });
};
globalThis.composition = (composition, spec) => {
  describe(`Composition.${composition} test`, () => {
    beforeEach(() => {
      setSpecProperty("type", "composition");
      setSpecProperty("spec", composition);
    });

    spec();
  });
};
globalThis.state = (state, spec) => {
  describe(`State.${state} test`, () => {
    beforeEach(() => {
      setSpecProperty("type", "State");
      setSpecProperty("spec", state);
    });

    spec();
  });
};
globalThis.operation = (operation, spec) => {
  describe(`Operation.${operation} test`, () => {
    beforeEach(() => {
      setSpecProperty("type", "Operation");
      setSpecProperty("spec", operation);
    });

    spec();
  });
};
globalThis.events = (event, spec) => {
  describe(`Event.${event} test`, () => {
    beforeEach(() => {
      setSpecProperty("type", "Event");
      setSpecProperty("spec", event);
    });

    spec();
  });
};
globalThis.gesture = (gesture, spec) => {
  describe(`Gesture.${gesture} test`, () => {
    beforeEach(() => {
      setSpecProperty("type", "Gesture");
      setSpecProperty("spec", gesture);
    });

    spec();
  });
};
globalThis.metadata = (metadata, spec) => {
  describe(`Metadata.${metadata} test`, () => {
    beforeEach(() => {
      setSpecProperty("type", "Metadata");
      setSpecProperty("spec", metadata);
    });

    spec();
  });
};

// Helper functions for testing
const create = (tag) => document.createElement(tag);
const append = (element) => document.body.appendChild(element);

globalThis.define = (tag, component) =>
  !customElements.get(tag) && customElements.define(tag, component);

globalThis.add = (tag, attributes) =>
  append(
    attributes != null ? setAttributes(create(tag), attributes) : create(tag)
  );

globalThis.remove = (id) => document.getElementById(id).remove();

globalThis.hasSetter = (obj, propName) => {
  while (obj) {
    let descriptor = Object.getOwnPropertyDescriptor(obj, propName);
    if (descriptor) return !!descriptor.set;
    obj = Object.getPrototypeOf(obj);
  }
  return false;
};
