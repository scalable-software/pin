import { Pin, Operation } from "@scalable.software/pin";

await Pin.Template.load("pin.template.html");
customElements.define(Pin.Tag, Pin);

const pin = document.querySelector(Pin.Tag);

/* Operations: one button for each, in the order the pin declares them */
const operations = document.querySelector(".operations .buttons");

Object.values(Operation).forEach((operation) => {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = operation;
  button.addEventListener("click", () => pin[operation]());
  operations.append(button);
});
