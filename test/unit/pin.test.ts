import { Template } from "@scalable.software/component";

import {
  Pin,
  Tag,
  Attributes,
  State,
  Visible,
  Status,
  Operation,
  Event,
} from "@scalable.software/pin";

configuration("Tag", () => {
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

configuration("ATTRIBUTE", () => {
  and("Pin imported", () => {
    then("Pin is defined", () => {
      expect(Pin).toBeDefined();
    });

    and("Pin is defined", () => {
      then("Pin.Attributes static getter is defined", () => {
        expect(Pin.Attributes).toBeDefined();
      });

      and("Pin.Attributes static getter is defined", () => {
        then("Pin.Attributes is Attribute", () => {
          expect(Pin.Attributes).toBe(Attributes);
        });
      });
    });
  });
});

utility("TEMPLATE", () => {
  then("Pin.Template static property is defined", () => {
    expect(Pin.Template).toBeDefined();
  });

  and("Pin.Template static property is defined", () => {
    then("Pin.Template is a Template", () => {
      expect(Pin.Template).toBeInstanceOf(Template);
    });
  });
});

composition("Template", () => {
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

      and("template is defined", () => {
        then("template contains a div with class icon", () => {
          expect(template.innerHTML).toContain('<div class="icon">');
        });
      });

      and("template contains a div with class icon", () => {
        then("div with class icon contains an svg with class pinned", () => {
          expect(template.innerHTML).toContain('<svg class="pinned"');
        });

        then("div with class icon contains an svg with class pinned", () => {
          expect(template.innerHTML).toContain('<svg class="unpinned"');
        });
      });

      and("a new component is added to DOM", () => {
        let component: Pin;
        beforeEach(() => {
          component = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          component.remove();
        });

        then("component.root contents contains template contents", () => {
          expect(component.root.innerHTML).toContain(template.innerHTML);
        });
      });
    });
  });
});

composition("CSS", () => {
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

      and("a new component is added to DOM", () => {
        let component: Pin;
        beforeEach(() => {
          component = add<Pin>(Pin.Tag);
        });
        afterEach(() => {
          component.remove();
        });

        then("component.root contents contains a link to stylesheet", () => {
          expect(component.root.innerHTML).toContain("stylesheet");
        });
      });
    });
  });
});

state(State.VISIBLE, () => {
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

        then("pin.visible getter is defined", () => {
          expect(pin.visible).toBeDefined();
        });

        and("pin.visible getter is defined", () => {
          then("pin.visible is Visible.YES", () => {
            expect(pin.visible).toBe(Visible.YES);
          });
        });

        then("visible attribute is null", () => {
          expect(pin.getAttribute(Attributes.VISIBLE)).toBeNull();
        });

        when("pin.visible is set to Visible.NO", () => {
          beforeEach(() => {
            pin.visible = Visible.NO;
          });

          then("pin.visible is Visible.NO", () => {
            expect(pin.visible).toBe(Visible.NO);
          });
          then("visible attribute is set to Visible.NO", () => {
            expect(pin.getAttribute(Attributes.VISIBLE)).toBe(Visible.NO);
          });
        });

        when("visible attribute is set to Visible.NO", () => {
          beforeEach(() => {
            pin.setAttribute(Attributes.VISIBLE, Visible.NO);
          });

          then("pin.visible is Visible.NO", () => {
            expect(pin.visible).toBe(Visible.NO);
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

        then("pin.status getter is defined", () => {
          expect(pin.status).toBeDefined();
        });

        and("pin.status getter is defined", () => {
          then("pin.status is Status.UNPINNED", () => {
            expect(pin.status).toBe(Status.UNPINNED);
          });
        });

        when("pin.status is set to Status.PINNED", () => {
          beforeEach(() => {
            pin.status = Status.PINNED;
          });

          then("pin.status is Status.PINNED", () => {
            expect(pin.status).toBe(Status.PINNED);
          });

          then("status attribute is set to Status.PINNED", () => {
            expect(pin.getAttribute(Attributes.STATUS)).toBe(Status.PINNED);
          });
        });
      });
    });
  });
});

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

        then("pin.hide() method is defined", () => {
          expect(pin.hide).toBeDefined();
        });

        and("pin.hide() method is defined", () => {
          when("pin.hide() is called", () => {
            beforeEach(() => {
              pin.hide();
            });

            then("pin.visible is Visible.NO", () => {
              expect(pin.visible).toBe(Visible.NO);
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

        then("pin.show() method is defined", () => {
          expect(pin.show).toBeDefined();
        });

        and("pin.visible is set to Visible.NO", () => {
          beforeEach(() => {
            pin.visible = Visible.NO;
          });
          then("pin.visible is Visible.NO", () => {
            expect(pin.visible).toBe(Visible.NO);
          });

          when("pin.show() is called", () => {
            beforeEach(() => {
              pin.show();
            });
            then("pin.visible is Visible.YES", () => {
              expect(pin.visible).toBe(Visible.YES);
            });
          });
        });
      });
    });
  });
});

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

        then("pin.onhide setter is defined", () => {
          expect(hasSetter(pin, Event.ON_HIDE)).toBeTrue();
        });

        and("pin.onhide setter is defined", () => {
          let onhide: jasmine.Spy;
          beforeEach(() => {
            onhide = jasmine.createSpy("onhide");
            pin.onhide = onhide;
          });

          and("pin.onhide is set to new listener ", () => {
            let onhide2: jasmine.Spy;
            beforeEach(() => {
              onhide2 = jasmine.createSpy("onhide2");
              pin.onhide = onhide2;
            });

            when("pin.visible set to Visible.NO", () => {
              beforeEach(() => {
                pin.visible = Visible.NO;
              });

              then("onhide is not called", () => {
                expect(onhide).not.toHaveBeenCalled();
              });
              then("onhide2 is called", () => {
                expect(onhide2).toHaveBeenCalled();
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

        then("pin.onshow setter is defined", () => {
          expect(hasSetter(pin, Event.ON_SHOW)).toBeTrue();
        });

        and("pin.visible is set to Visible.NO", () => {
          beforeEach(() => {
            pin.visible = Visible.NO;
          });

          and("pin.onshow setter is defined", () => {
            let onshow: jasmine.Spy;
            beforeEach(() => {
              onshow = jasmine.createSpy("onshow");
              pin.onshow = onshow;
            });

            when("pin.visible set to Visible.YES", () => {
              beforeEach(() => {
                pin.visible = Visible.YES;
              });

              then("onshow is called", () => {
                expect(onshow).toHaveBeenCalled();
              });
              then("onshow is called with `visible: Visible.YES`", () => {
                expect(onshow).toHaveBeenCalledWith(
                  jasmine.objectContaining({ detail: { visible: Visible.YES } })
                );
              });
            });

            and("pin.onshow is set to new listener ", () => {
              let onshow2: jasmine.Spy;
              beforeEach(() => {
                onshow2 = jasmine.createSpy("onshow2");
                pin.onshow = onshow2;
              });

              when("pin.visible set to Visible.YES", () => {
                beforeEach(() => {
                  pin.visible = Visible.YES;
                });
                then("onshow is not called", () => {
                  expect(onshow).not.toHaveBeenCalled();
                });
                then("onshow2 is called", () => {
                  expect(onshow2).toHaveBeenCalled();
                });
              });
            });
          });
        });
      });
    });
  });
});
