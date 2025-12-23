import { Pin } from "@scalable.software/pin";

await Pin.Template.load("pin.template.html");

customElements.define(Pin.Tag, Pin);
