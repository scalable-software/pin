import { Template } from "@scalable.software/component";

import {
  Pin,
  Tag,
  Attributes,
  State,
  Visible,
  Operation,
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
      });
    });
  });
});
