import { Template } from "@scalable.software/component";

import {
  Pin,
  Tag,
  CSS,
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

// Configuration
configuration(Configuration.TAG, () => {
  and("Pin imported", () => {
    then("Pin is defined", () => {
      expect(Pin).toBeDefined();
    });

    and("Pin is defined", () => {
      then("Pin.Tag static getter is defined", () => {
        expect(Pin.Tag).toBeDefined();
      });

      and("Pin.Tag static getter is defined", () => {
        then("Pin.Tag is Tag", () => {
          expect(Pin.Tag).toBe(Tag);
        });
      });
    });
  });
});

configuration(Configuration.ATTRIBUTES, () => {
  and("Pin imported", () => {
    then("Pin is defined", () => {
      expect(Pin).toBeDefined();
    });

    and("Pin is defined", () => {
      then("Pin.Attributes static getter is defined", () => {
        expect(Pin.Attributes).toBeDefined();
      });

      and("Pin.Attributes static getter is defined", () => {
        then("Pin.Attributes is Attributes", () => {
          expect(Pin.Attributes).toBe(Attributes);
        });
      });
    });
  });
});

// Utilities
utility(Utilities.TEMPLATE, () => {
  then("Pin.Template static property is defined", () => {
    expect(Pin.Template).toBeDefined();
  });

  and("Pin.Template static property is defined", () => {
    then("Pin.Template is a Template", () => {
      expect(Pin.Template).toBeInstanceOf(Template);
    });
  });
});

// Compositions
composition(Composition.TEMPLATE, () => {
  given("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("HTML Template is added to DOM", () => {
      let template: HTMLTemplateElement;
      beforeEach(async () => {
        template = (await Pin.Template.load(
          "pin.template.html"
        )) as HTMLTemplateElement;
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      then("template is defined", () => {
        expect(template).toBeDefined();
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        then("pin.root contents contains template contents", () => {
          expect(pin.root.innerHTML).toContain(template.innerHTML);
        });

        and("`pin.root` contents contains template contents", () => {
          then("`pin.root` contains `div.icon`", () => {
            const div = pin.root.querySelector("div.icon");
            expect(div).not.toBeNull();
          });

          when("`pin.root` contains `div.icon`", () => {
            let div: HTMLDivElement;
            beforeEach(() => {
              div = pin.root.querySelector("div.icon") as HTMLDivElement;
            });

            then("`div.icon` contains `svg.unpinned`", () => {
              const svg = div.querySelector("svg.unpinned");
              expect(svg).not.toBeNull();
            });

            then("`div.icon` contains `svg.pinned`", () => {
              const svg = div.querySelector("svg.pinned");
              expect(svg).not.toBeNull();
            });

            then("`div.icon` has `tabindex` `0`", () => {
              expect(div.getAttribute("tabindex")).toBe("0");
            });

            then("`div.icon` has `role` `button`", () => {
              expect(div.getAttribute("role")).toBe("button");
            });
          });
        });
      });
    });
  });
});

composition(Composition.CSS, () => {
  given("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });
    and("HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        then("pin.root contents contains a link to stylesheet", () => {
          expect(pin.root.innerHTML).toContain("stylesheet");
        });

        and("pin.root contents contains a link to stylesheet", () => {
          then("the stylesheet file's name is correct", () => {
            expect(pin.root.innerHTML).toContain(CSS);
          });
        });
      });
    });
  });
});

composition(Composition.ELEMENT, () => {
  and("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        then("`pin.elements.icon` is defined", () => {
          expect(pin["elements"].icon).toBeDefined();
        });

        when("`pin.elements.icon` is defined", () => {
          then(
            "`pin.elements.icon` is a cached reference to the `div` with class `icon`",
            () => {
              const icon = pin.root.querySelector(".icon") as HTMLDivElement;
              expect(pin["elements"].icon).toBe(icon);
            }
          );
        });
      });
    });
  });
});

// State
state(State.VISIBILITY, () => {
  given("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("a HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        then("`pin.visibility` getter exists", () => {
          expect(pin.visibility).toBeDefined();
        });

        when("`pin.visibility` getter exists", () => {
          then("`pin.visibility` is `Visibility.VISIBLE`", () => {
            expect(pin.visibility).toBe(Visibility.VISIBLE);
          });
        });

        then("`visibility` attribute does not exist", () => {
          expect(pin.hasAttribute(Attributes.VISIBILITY)).toBeFalse();
        });

        then("`pin.visibility` setter exists", () => {
          expect(hasSetter(pin, "visibility")).toBeTrue();
        });

        and("`pin.visibility` setter exists", () => {
          when("`pin.visibility` is set to `Visibility.HIDDEN`", () => {
            beforeEach(() => {
              pin.visibility = Visibility.HIDDEN;
            });
            afterEach(() => {
              pin.visibility = Visibility.VISIBLE;
            });

            then("`pin.visibility` is `Visibility.HIDDEN`", () => {
              expect(pin.visibility).toBe(Visibility.HIDDEN);
            });

            then("pin `visibility` attribute is `Visibility.HIDDEN`", () => {
              const value = pin.getAttribute(Attributes.VISIBILITY);
              expect(value).toBe(Visibility.HIDDEN);
            });

            when("`pin.visibility` is set to `Visibility.VISIBLE`", () => {
              beforeEach(() => {
                pin.visibility = Visibility.VISIBLE;
              });

              then("`visibility` attribute does not exist", () => {
                expect(pin.hasAttribute(Attributes.VISIBILITY)).toBeFalse();
              });
            });
          });

          when("`pin.visibility` is set to `null`", () => {
            beforeEach(() => {
              pin.visibility = null;
            });
            afterEach(() => {
              pin.visibility = Visibility.VISIBLE;
            });

            then("`pin.visibility` is `Visibility.VISIBLE`", () => {
              expect(pin.visibility).toBe(Visibility.VISIBLE);
            });
          });

          when("`visibility` attribute is set to `Visibility.HIDDEN`", () => {
            beforeEach(() => {
              pin.setAttribute(Attributes.VISIBILITY, Visibility.HIDDEN);
            });
            afterEach(() => {
              pin.removeAttribute(Attributes.VISIBILITY);
            });

            then("`pin.visibility` is `Visibility.HIDDEN`", () => {
              expect(pin.visibility).toBe(Visibility.HIDDEN);
            });
          });

          when("`visibility` attribute is set to `invalid`", () => {
            let error: Error;
            beforeEach(async () => {
              await jasmine.spyOnGlobalErrorsAsync(async (reported) => {
                pin.setAttribute(Attributes.VISIBILITY, "invalid");
                error = reported.calls.mostRecent()?.args[0];
              });
            });

            then("`visibility` attribute does not exist", () => {
              expect(pin.hasAttribute(Attributes.VISIBILITY)).toBeFalse();
            });

            then("`pin.visibility` is `Visibility.VISIBLE`", () => {
              expect(pin.visibility).toBe(Visibility.VISIBLE);
            });

            then("an error is reported", () => {
              expect(error).toBeDefined();
            });

            then(
              "error message contains 'Invalid visibility value: invalid'",
              () => {
                expect(error.message).toBe("Invalid visibility value: invalid");
              }
            );
          });

          when("`visibility` attribute is set to `Visibility.VISIBLE`", () => {
            beforeEach(() => {
              pin.setAttribute(Attributes.VISIBILITY, Visibility.VISIBLE);
            });

            then("`visibility` attribute does not exist", () => {
              expect(pin.hasAttribute(Attributes.VISIBILITY)).toBeFalse();
            });
          });

          and("`pin.visibility` is set to `Visibility.HIDDEN`", () => {
            beforeEach(() => {
              pin.visibility = Visibility.HIDDEN;
            });

            when("`visibility` attribute is set to `invalid`", () => {
              beforeEach(async () => {
                await jasmine.spyOnGlobalErrorsAsync(async () => {
                  pin.setAttribute(Attributes.VISIBILITY, "invalid");
                });
              });

              then("`visibility` attribute is `Visibility.HIDDEN`", () => {
                const value = pin.getAttribute(Attributes.VISIBILITY);
                expect(value).toBe(Visibility.HIDDEN);
              });
            });
          });

          when("`pin.visibility` is set to `invalid`", () => {
            let error: Error;
            beforeEach(() => {
              try {
                // @ts-expect-error
                pin.visibility = "invalid";
              } catch (err) {
                error = err as Error;
              }
            });
            afterEach(() => {
              pin.visibility = Visibility.VISIBLE;
            });

            then("an error is thrown", () => {
              expect(error).toBeDefined();
            });

            then(
              "error message contains 'Invalid visibility value: invalid'",
              () => {
                expect(error.message).toBe("Invalid visibility value: invalid");
              }
            );
          });
        });
      });
    });
  });
});

state(State.STATUS, () => {
  given("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("a HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        then("`pin.status` getter exists", () => {
          expect(pin.status).toBeDefined();
        });

        when("`pin.status` getter exists", () => {
          then("`pin.status` is `Status.UNPINNED`", () => {
            expect(pin.status).toBe(Status.UNPINNED);
          });
        });

        then("`status` attribute exists", () => {
          const value = pin.getAttribute(Attributes.STATUS);
          expect(value).not.toBeNull();
        });

        and("`status` attribute exists", () => {
          then("`status` attribute is `Status.UNPINNED`", () => {
            const value = pin.getAttribute(Attributes.STATUS);
            expect(value).toBe(Status.UNPINNED);
          });

          when("`status` attribute is set to `Status.PINNED`", () => {
            beforeEach(() => {
              pin.setAttribute(Attributes.STATUS, Status.PINNED);
            });
            afterEach(() => {
              pin.setAttribute(Attributes.STATUS, Status.UNPINNED);
            });

            then("`pin.status` is `Status.PINNED`", () => {
              expect(pin.status).toBe(Status.PINNED);
            });
          });

          when("`status` attribute is set to `invalid`", () => {
            let error: Error;
            beforeEach(async () => {
              await jasmine.spyOnGlobalErrorsAsync(async (reported) => {
                pin.setAttribute(Attributes.STATUS, "invalid");
                error = reported.calls.mostRecent()?.args[0];
              });
            });

            then("`status` attribute is `Status.UNPINNED`", () => {
              const value = pin.getAttribute(Attributes.STATUS);
              expect(value).toBe(Status.UNPINNED);
            });

            then("`pin.status` is `Status.UNPINNED`", () => {
              expect(pin.status).toBe(Status.UNPINNED);
            });

            then("an error is reported", () => {
              expect(error).toBeDefined();
            });

            then(
              "error message contains 'Invalid status value: invalid'",
              () => {
                expect(error.message).toBe("Invalid status value: invalid");
              }
            );
          });

          and("`pin.status` is set to `Status.PINNED`", () => {
            beforeEach(() => {
              pin.status = Status.PINNED;
            });

            when("`status` attribute is removed", () => {
              beforeEach(async () => {
                await jasmine.spyOnGlobalErrorsAsync(async () => {
                  pin.removeAttribute(Attributes.STATUS);
                });
              });

              then("`status` attribute is `Status.PINNED`", () => {
                const value = pin.getAttribute(Attributes.STATUS);
                expect(value).toBe(Status.PINNED);
              });
            });
          });
        });

        then("`pin.status` setter exists", () => {
          expect(hasSetter(pin, "status")).toBeTrue();
        });

        and("`pin.status` setter exists", () => {
          when("`pin.status` is set to `Status.PINNED`", () => {
            beforeEach(() => {
              pin.status = Status.PINNED;
            });

            then("`pin.status` is `Status.PINNED`", () => {
              expect(pin.status).toBe(Status.PINNED);
            });

            then("pin `status` attribute is `Status.PINNED`", () => {
              const value = pin.getAttribute(Attributes.STATUS);
              expect(value).toBe(Status.PINNED);
            });
          });

          when("`pin.status` is set to `invalid`", () => {
            let error: Error;
            beforeEach(() => {
              try {
                // @ts-expect-error
                pin.status = "invalid";
              } catch (err) {
                error = err as Error;
              }
            });
            afterEach(() => {
              pin.status = Status.UNPINNED;
            });

            then("an error is thrown", () => {
              expect(error).toBeDefined();
            });

            then(
              "error message contains 'Invalid status value: invalid'",
              () => {
                expect(error.message).toBe("Invalid status value: invalid");
              }
            );
          });
        });
      });

      and("a new pin with `status` attribute `invalid` is added to DOM", () => {
        let pin: Pin;
        beforeEach(async () => {
          await jasmine.spyOnGlobalErrorsAsync(async () => {
            pin = add<Pin>(Pin.Tag, { [Attributes.STATUS]: "invalid" });
          });
        });
        afterEach(() => {
          pin.remove();
        });

        then("`status` attribute is `Status.UNPINNED`", () => {
          const value = pin.getAttribute(Attributes.STATUS);
          expect(value).toBe(Status.UNPINNED);
        });
      });
    });
  });
});

state(State.APPEARANCE, () => {
  given("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("a HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        then("`pin.appearance` getter exists", () => {
          expect(pin.appearance).toBeDefined();
        });

        when("`pin.appearance` getter exists", () => {
          then("`pin.appearance` is `Appearance.FLOATING`", () => {
            expect(pin.appearance).toBe(Appearance.FLOATING);
          });
        });

        then("`appearance` attribute does not exist", () => {
          expect(pin.hasAttribute(Attributes.APPEARANCE)).toBeFalse();
        });

        then("`pin.appearance` setter exists", () => {
          expect(hasSetter(pin, "appearance")).toBeTrue();
        });

        and("`pin.appearance` setter exists", () => {
          when("`pin.appearance` is set to `Appearance.FLAT`", () => {
            beforeEach(() => {
              pin.appearance = Appearance.FLAT;
            });

            then("`pin.appearance` is `Appearance.FLAT`", () => {
              expect(pin.appearance).toBe(Appearance.FLAT);
            });

            then("pin `appearance` attribute is `Appearance.FLAT`", () => {
              const value = pin.getAttribute(Attributes.APPEARANCE);
              expect(value).toBe(Appearance.FLAT);
            });

            when("`pin.appearance` is set to `Appearance.FLOATING`", () => {
              beforeEach(() => {
                pin.appearance = Appearance.FLOATING;
              });

              then("`appearance` attribute does not exist", () => {
                expect(pin.hasAttribute(Attributes.APPEARANCE)).toBeFalse();
              });
            });

            when("`appearance` attribute is set to `invalid`", () => {
              beforeEach(async () => {
                await jasmine.spyOnGlobalErrorsAsync(async () => {
                  pin.setAttribute(Attributes.APPEARANCE, "invalid");
                });
              });

              then("`appearance` attribute is `Appearance.FLAT`", () => {
                const value = pin.getAttribute(Attributes.APPEARANCE);
                expect(value).toBe(Appearance.FLAT);
              });
            });
          });

          when("`pin.appearance` is set to `null`", () => {
            beforeEach(() => {
              pin.appearance = null;
            });

            then("`pin.appearance` is `Appearance.FLOATING`", () => {
              expect(pin.appearance).toBe(Appearance.FLOATING);
            });
          });

          when("`appearance` attribute is set to `Appearance.FLAT`", () => {
            beforeEach(() => {
              pin.setAttribute(Attributes.APPEARANCE, Appearance.FLAT);
            });

            then("`pin.appearance` is `Appearance.FLAT`", () => {
              expect(pin.appearance).toBe(Appearance.FLAT);
            });
          });

          when("`appearance` attribute is set to `invalid`", () => {
            let error: Error;
            beforeEach(async () => {
              await jasmine.spyOnGlobalErrorsAsync(async (reported) => {
                pin.setAttribute(Attributes.APPEARANCE, "invalid");
                error = reported.calls.mostRecent()?.args[0];
              });
            });

            then("`appearance` attribute does not exist", () => {
              expect(pin.hasAttribute(Attributes.APPEARANCE)).toBeFalse();
            });

            then("`pin.appearance` is `Appearance.FLOATING`", () => {
              expect(pin.appearance).toBe(Appearance.FLOATING);
            });

            then("an error is reported", () => {
              expect(error).toBeDefined();
            });

            then(
              "error message contains 'Invalid appearance value: invalid'",
              () => {
                expect(error.message).toBe("Invalid appearance value: invalid");
              }
            );
          });

          when("`pin.appearance` is set to `invalid`", () => {
            let error: Error;
            beforeEach(() => {
              try {
                // @ts-expect-error
                pin.appearance = "invalid";
              } catch (err) {
                error = err as Error;
              }
            });

            then("an error is thrown", () => {
              expect(error).toBeDefined();
            });

            then(
              "error message contains 'Invalid appearance value: invalid'",
              () => {
                expect(error.message).toBe("Invalid appearance value: invalid");
              }
            );
          });
        });
      });
    });
  });
});

// Operation
operation(Operation.HIDE, () => {
  and("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        then("`pin.hide` method exists", () => {
          expect(pin.hide).toBeDefined();
        });

        and("`pin.hide` method exists", () => {
          when("invoking `pin.hide`", () => {
            let result: unknown;
            beforeEach(() => {
              result = pin.hide();
            });

            then("`pin.visibility` is `Visibility.HIDDEN`", () => {
              expect(pin.visibility).toBe(Visibility.HIDDEN);
            });

            then("`pin.hide` returns nothing", () => {
              expect(result).toBeUndefined();
            });
          });
        });
      });
    });
  });
});

operation(Operation.SHOW, () => {
  and("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        then("`pin.show` method exists", () => {
          expect(pin.show).toBeDefined();
        });

        and("`pin.show` method exists", () => {
          and("pin.visibility is `Visibility.HIDDEN`", () => {
            beforeEach(() => {
              pin.visibility = Visibility.HIDDEN;
            });
            afterEach(() => {
              pin.visibility = Visibility.VISIBLE;
            });

            when("invoking `pin.show`", () => {
              let result: unknown;
              beforeEach(() => {
                result = pin.show();
              });

              then("`pin.visibility` is `Visibility.VISIBLE`", () => {
                expect(pin.visibility).toBe(Visibility.VISIBLE);
              });

              then("`pin.show` returns nothing", () => {
                expect(result).toBeUndefined();
              });
            });
          });
        });
      });
    });
  });
});

operation(Operation.PIN, () => {
  and("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        then("`pin.pin` method exists", () => {
          expect(pin.pin).toBeDefined();
        });

        and("`pin.pin` method exists", () => {
          when("invoking `pin.pin`", () => {
            let result: unknown;
            beforeEach(() => {
              result = pin.pin();
            });

            then("`pin.status` is `Status.PINNED`", () => {
              expect(pin.status).toBe(Status.PINNED);
            });

            then("`pin.pin` returns nothing", () => {
              expect(result).toBeUndefined();
            });
          });
        });
      });
    });
  });
});

operation(Operation.UNPIN, () => {
  and("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        then("`pin.unpin` method exists", () => {
          expect(pin.unpin).toBeDefined();
        });

        and("`pin.unpin` method exists", () => {
          and("pin.status is `Status.PINNED`", () => {
            beforeEach(() => {
              pin.status = Status.PINNED;
            });
            afterEach(() => {
              pin.status = Status.UNPINNED;
            });

            when("invoking `pin.unpin`", () => {
              let result: unknown;
              beforeEach(() => {
                result = pin.unpin();
              });

              then("`pin.status` is `Status.UNPINNED`", () => {
                expect(pin.status).toBe(Status.UNPINNED);
              });

              then("`pin.unpin` returns nothing", () => {
                expect(result).toBeUndefined();
              });
            });
          });
        });
      });
    });
  });
});

operation(Operation.TOGGLE, () => {
  and("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        then("`pin.toggle` method exists", () => {
          expect(pin.toggle).toBeDefined();
        });

        and("`pin.toggle` method exists", () => {
          and("`pin.status` is set to `Status.UNPINNED`", () => {
            beforeEach(() => {
              pin.status = Status.UNPINNED;
            });
            afterEach(() => {
              pin.status = Status.UNPINNED;
            });

            when("invoking `pin.toggle`", () => {
              let result: unknown;
              beforeEach(() => {
                result = pin.toggle();
              });

              then("`pin.status` is `Status.PINNED`", () => {
                expect(pin.status).toBe(Status.PINNED);
              });

              then("`pin.toggle` returns nothing", () => {
                expect(result).toBeUndefined();
              });
            });
          });

          and("`pin.status` is set to `Status.PINNED`", () => {
            beforeEach(() => {
              pin.status = Status.PINNED;
            });
            afterEach(() => {
              pin.status = Status.UNPINNED;
            });

            when("invoking `pin.toggle`", () => {
              beforeEach(() => {
                pin.toggle();
              });

              then("`pin.status` is `Status.UNPINNED`", () => {
                expect(pin.status).toBe(Status.UNPINNED);
              });
            });
          });
        });
      });
    });
  });
});

// Event
events(Event.ON_HIDE, () => {
  and("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        then("`pin.onhide` setter exists", () => {
          expect(hasSetter(pin, Event.ON_HIDE)).toBeTrue();
        });

        and("`pin.onhide` setter exists", () => {
          and("`pin.onhide` is set to a listener ", () => {
            let onhide: jasmine.Spy;
            beforeEach(() => {
              onhide = jasmine.createSpy("onhide");
              pin.onhide = onhide;
            });
            afterEach(() => {
              pin.onhide = null;
            });

            when("`pin.onhide` is set to `invalid`", () => {
              let error: Error;
              beforeEach(() => {
                try {
                  // @ts-expect-error
                  pin.onhide = "invalid";
                } catch (err) {
                  error = err as Error;
                }
              });

              then("an error is thrown", () => {
                expect(error).toBeDefined();
              });

              then("error message contains 'Invalid onhide value: invalid'", () => {
                expect(error.message).toBe("Invalid onhide value: invalid");
              });

              when("`pin.visibility` is set to `Visibility.HIDDEN`", () => {
                beforeEach(() => {
                  pin.visibility = Visibility.HIDDEN;
                });
                afterEach(() => {
                  pin.visibility = Visibility.VISIBLE;
                });

                then("`pin.onhide` is still called", () => {
                  expect(onhide).toHaveBeenCalled();
                });
              });
            });

            when("`pin.visibility` is set to `Visibility.HIDDEN` twice", () => {
              beforeEach(() => {
                pin.visibility = Visibility.HIDDEN;
                pin.visibility = Visibility.HIDDEN;
              });
              afterEach(() => {
                pin.visibility = Visibility.VISIBLE;
              });

              then("`pin.onhide` is called once", () => {
                expect(onhide).toHaveBeenCalledTimes(1);
              });
            });

            and("`pin.onhide` is set to a new listener", () => {
              let onhide2: jasmine.Spy;
              beforeEach(() => {
                onhide2 = jasmine.createSpy("onhide2");
                pin.onhide = onhide2;
              });
              afterEach(() => {
                pin.onhide = null;
              });

              when("`pin.visibility` is set to `Visibility.HIDDEN`", () => {
                beforeEach(() => {
                  pin.visibility = Visibility.HIDDEN;
                });
                afterEach(() => {
                  pin.visibility = Visibility.VISIBLE;
                });

                then("old `pin.onhide` is not called", () => {
                  expect(onhide).not.toHaveBeenCalled();
                });

                then("new `pin.onhide` is called", () => {
                  expect(onhide2).toHaveBeenCalled();
                });

                then(
                  "new `pin.onhide` is called with `{ detail: { visibility: Visibility.HIDDEN } }`",
                  () => {
                    const message = {
                      detail: { visibility: Visibility.HIDDEN }
                    };
                    expect(onhide2).toHaveBeenCalledWith(
                      jasmine.objectContaining(message)
                    );
                  }
                );
              });
            });
          });
        });
      });
    });
  });
});

events(Event.ON_SHOW, () => {
  and("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        then("`pin.onshow` setter exists", () => {
          expect(hasSetter(pin, Event.ON_SHOW)).toBeTrue();
        });

        and("`pin.onshow` setter exists", () => {
          and("`pin.visibility` is set to `Visibility.HIDDEN`", () => {
            beforeEach(() => {
              pin.visibility = Visibility.HIDDEN;
            });
            afterEach(() => {
              pin.visibility = Visibility.VISIBLE;
            });

            and("`pin.onshow` is set to a listener ", () => {
              let onshow: jasmine.Spy;
              beforeEach(() => {
                onshow = jasmine.createSpy("onshow");
                pin.onshow = onshow;
              });
              afterEach(() => {
                pin.onshow = null;
              });

              when("`pin.onshow` is set to `invalid`", () => {
                let error: Error;
                beforeEach(() => {
                  try {
                    // @ts-expect-error
                    pin.onshow = "invalid";
                  } catch (err) {
                    error = err as Error;
                  }
                });

                then("an error is thrown", () => {
                  expect(error).toBeDefined();
                });

                then("error message contains 'Invalid onshow value: invalid'", () => {
                  expect(error.message).toBe("Invalid onshow value: invalid");
                });

                when("`pin.visibility` is set to `Visibility.VISIBLE`", () => {
                  beforeEach(() => {
                    pin.visibility = Visibility.VISIBLE;
                  });
                  afterEach(() => {
                    pin.visibility = Visibility.HIDDEN;
                  });

                  then("`pin.onshow` is still called", () => {
                    expect(onshow).toHaveBeenCalled();
                  });
                });
              });

              and("`pin.onshow` is set to a new listener", () => {
                let onshow2: jasmine.Spy;
                beforeEach(() => {
                  onshow2 = jasmine.createSpy("onshow2");
                  pin.onshow = onshow2;
                });
                afterEach(() => {
                  pin.onshow = null;
                });

                when("`pin.visibility` is set to `Visibility.VISIBLE`", () => {
                  beforeEach(() => {
                    pin.visibility = Visibility.VISIBLE;
                  });
                  afterEach(() => {
                    pin.visibility = Visibility.HIDDEN;
                  });

                  then("old `pin.onshow` is not called", () => {
                    expect(onshow).not.toHaveBeenCalled();
                  });

                  then("new `pin.onshow` is called", () => {
                    expect(onshow2).toHaveBeenCalled();
                  });

                  then(
                    "new `pin.onshow` is called with `{ detail: { visibility: Visibility.VISIBLE } }`",
                    () => {
                      const message = {
                        detail: { visibility: Visibility.VISIBLE }
                      };
                      expect(onshow2).toHaveBeenCalledWith(
                        jasmine.objectContaining(message)
                      );
                    }
                  );
                });
              });
            });
          });
        });
      });
    });
  });
});

events(Event.ON_PIN, () => {
  and("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        then("`pin.onpin` setter exists", () => {
          expect(hasSetter(pin, Event.ON_PIN)).toBeTrue();
        });

        and("`pin.onpin` setter exists", () => {
          and("`pin.onpin` is set to a listener ", () => {
            let onpin: jasmine.Spy;
            beforeEach(() => {
              onpin = jasmine.createSpy("onpin");
              pin.onpin = onpin;
            });
            afterEach(() => {
              pin.onpin = null;
            });

            when("`pin.onpin` is set to `invalid`", () => {
              let error: Error;
              beforeEach(() => {
                try {
                  // @ts-expect-error
                  pin.onpin = "invalid";
                } catch (err) {
                  error = err as Error;
                }
              });

              then("an error is thrown", () => {
                expect(error).toBeDefined();
              });

              then("error message contains 'Invalid onpin value: invalid'", () => {
                expect(error.message).toBe("Invalid onpin value: invalid");
              });

              when("`pin.status` is set to `Status.PINNED`", () => {
                beforeEach(() => {
                  pin.status = Status.PINNED;
                });
                afterEach(() => {
                  pin.status = Status.UNPINNED;
                });

                then("`pin.onpin` is still called", () => {
                  expect(onpin).toHaveBeenCalled();
                });
              });
            });

            when("`pin.status` is set to `Status.PINNED` twice", () => {
              beforeEach(() => {
                pin.status = Status.PINNED;
                pin.status = Status.PINNED;
              });
              afterEach(() => {
                pin.status = Status.UNPINNED;
              });

              then("`pin.onpin` is called once", () => {
                expect(onpin).toHaveBeenCalledTimes(1);
              });
            });

            and("`pin.onpin` is set to a new listener", () => {
              let onpin2: jasmine.Spy;
              beforeEach(() => {
                onpin2 = jasmine.createSpy("onpin2");
                pin.onpin = onpin2;
              });
              afterEach(() => {
                pin.onpin = null;
              });

              when("`pin.status` is set to `Status.PINNED`", () => {
                beforeEach(() => {
                  pin.status = Status.PINNED;
                });
                afterEach(() => {
                  pin.status = Status.UNPINNED;
                });

                then("old `pin.onpin` is not called", () => {
                  expect(onpin).not.toHaveBeenCalled();
                });

                then("new `pin.onpin` is called", () => {
                  expect(onpin2).toHaveBeenCalled();
                });

                then(
                  "new `pin.onpin` is called with `{ detail: { status: Status.PINNED } }`",
                  () => {
                    const message = {
                      detail: { status: Status.PINNED }
                    };
                    expect(onpin2).toHaveBeenCalledWith(
                      jasmine.objectContaining(message)
                    );
                  }
                );
              });
            });
          });
        });
      });
    });
  });
});

events(Event.ON_UNPIN, () => {
  and("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        then("`pin.onunpin` setter exists", () => {
          expect(hasSetter(pin, Event.ON_UNPIN)).toBeTrue();
        });

        and("`pin.onunpin` setter exists", () => {
          and("`pin.status` is set to `Status.PINNED`", () => {
            beforeEach(() => {
              pin.status = Status.PINNED;
            });
            afterEach(() => {
              pin.status = Status.UNPINNED;
            });

            and("`pin.onunpin` is set to a listener ", () => {
              let onunpin: jasmine.Spy;
              beforeEach(() => {
                onunpin = jasmine.createSpy("onunpin");
                pin.onunpin = onunpin;
              });
              afterEach(() => {
                pin.onunpin = null;
              });

              when("`pin.onunpin` is set to `invalid`", () => {
                let error: Error;
                beforeEach(() => {
                  try {
                    // @ts-expect-error
                    pin.onunpin = "invalid";
                  } catch (err) {
                    error = err as Error;
                  }
                });

                then("an error is thrown", () => {
                  expect(error).toBeDefined();
                });

                then("error message contains 'Invalid onunpin value: invalid'", () => {
                  expect(error.message).toBe("Invalid onunpin value: invalid");
                });

                when("`pin.status` is set to `Status.UNPINNED`", () => {
                  beforeEach(() => {
                    pin.status = Status.UNPINNED;
                  });
                  afterEach(() => {
                    pin.status = Status.PINNED;
                  });

                  then("`pin.onunpin` is still called", () => {
                    expect(onunpin).toHaveBeenCalled();
                  });
                });
              });

              and("`pin.onunpin` is set to a new listener", () => {
                let onunpin2: jasmine.Spy;
                beforeEach(() => {
                  onunpin2 = jasmine.createSpy("onunpin2");
                  pin.onunpin = onunpin2;
                });
                afterEach(() => {
                  pin.onunpin = null;
                });

                when("`pin.status` is set to `Status.UNPINNED`", () => {
                  beforeEach(() => {
                    pin.status = Status.UNPINNED;
                  });
                  afterEach(() => {
                    pin.status = Status.PINNED;
                  });

                  then("old `pin.onunpin` is not called", () => {
                    expect(onunpin).not.toHaveBeenCalled();
                  });

                  then("new `pin.onunpin` is called", () => {
                    expect(onunpin2).toHaveBeenCalled();
                  });

                  then(
                    "new `pin.onunpin` is called with `{ detail: { status: Status.UNPINNED } }`",
                    () => {
                      const message = {
                        detail: { status: Status.UNPINNED }
                      };
                      expect(onunpin2).toHaveBeenCalledWith(
                        jasmine.objectContaining(message)
                      );
                    }
                  );
                });
              });
            });
          });
        });
      });
    });
  });
});

// Gesture
gesture(Gesture.CLICK, () => {
  and("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        when("user `click` on `div` with class `icon`", () => {
          let onpin: jasmine.Spy;
          beforeEach(() => {
            onpin = jasmine.createSpy("onpin");
            pin.onpin = onpin;
            const icon = pin.root.querySelector(".icon") as HTMLElement;
            icon.click();
          });

          then("`pin.status` is `Status.PINNED`", () => {
            expect(pin.status).toEqual(Status.PINNED);
          });
          then("`onpin` is called", () => {
            expect(onpin).toHaveBeenCalled();
          });

          and("user `click` on `div` with class `icon`", () => {
            let onunpin: jasmine.Spy;
            beforeEach(() => {
              onunpin = jasmine.createSpy("onunpin");
              pin.onunpin = onunpin;
              const icon = pin.root.querySelector(".icon") as HTMLElement;
              icon.click();
            });

            then("`pin.status` is `Status.UNPINNED`", () => {
              expect(pin.status).toEqual(Status.UNPINNED);
            });
            then("`onunpin` is called", () => {
              expect(onunpin).toHaveBeenCalled();
            });
          });
        });
      });
    });
  });
});

gesture(Gesture.KEYDOWN, () => {
  and("Pin is defined in custom element registry", () => {
    beforeEach(() => {
      define(Pin.Tag, Pin);
    });

    and("HTML Template is added to DOM", () => {
      beforeEach(async () => {
        await Pin.Template.load("pin.template.html");
      });
      afterEach(() => {
        remove(Pin.Tag);
      });

      and("a new pin is added to DOM", () => {
        let pin: Pin;
        beforeEach(() => {
          pin = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          pin.remove();
        });

        when("user presses `Key.ENTER` on `div` with class `icon`", () => {
          let onpin: jasmine.Spy;
          beforeEach(() => {
            onpin = jasmine.createSpy("onpin");
            pin.onpin = onpin;
            const icon = pin.root.querySelector(".icon") as HTMLElement;
            icon.dispatchEvent(
              new KeyboardEvent(Gesture.KEYDOWN, { key: Key.ENTER })
            );
          });

          then("`pin.status` is `Status.PINNED`", () => {
            expect(pin.status).toEqual(Status.PINNED);
          });
          then("`onpin` is called", () => {
            expect(onpin).toHaveBeenCalled();
          });

          and("user presses `Key.ENTER` on `div` with class `icon`", () => {
            let onunpin: jasmine.Spy;
            beforeEach(() => {
              onunpin = jasmine.createSpy("onunpin");
              pin.onunpin = onunpin;
              const icon = pin.root.querySelector(".icon") as HTMLElement;
              icon.dispatchEvent(
                new KeyboardEvent(Gesture.KEYDOWN, { key: Key.ENTER })
              );
            });

            then("`pin.status` is `Status.UNPINNED`", () => {
              expect(pin.status).toEqual(Status.UNPINNED);
            });
            then("`onunpin` is called", () => {
              expect(onunpin).toHaveBeenCalled();
            });
          });
        });

        when("user presses another key on `div` with class `icon`", () => {
          beforeEach(() => {
            const icon = pin.root.querySelector(".icon") as HTMLElement;
            icon.dispatchEvent(new KeyboardEvent(Gesture.KEYDOWN, { key: "a" }));
          });

          then("`pin.status` is `Status.UNPINNED`", () => {
            expect(pin.status).toEqual(Status.UNPINNED);
          });
        });
      });
    });
  });
});
