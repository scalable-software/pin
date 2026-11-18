import {
  Pin,
  Operation,
  Visibility,
  Status,
  Appearance,
} from "@scalable.software/pin";

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

/* States: a choice for each writable state, in the order the specification declares them */
const choices = document.querySelector(".states .choices");
const writable = { visibility: Visibility, status: Status, appearance: Appearance };

Object.entries(writable).forEach(([state, values]) => {
  const fieldset = document.createElement("fieldset");
  fieldset.innerHTML = `<legend>${state}</legend>`;
  Object.values(values).forEach((value) => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="radio" name="${state}" value="${value}"> ${value}`;
    label.firstChild.addEventListener("change", () => (pin[state] = value));
    fieldset.append(label);
  });
  choices.append(fieldset);
});

const showStates = () =>
  Object.keys(writable).forEach((state) => {
    const input = choices.querySelector(`input[name="${state}"][value="${pin[state]}"]`);
    input && (input.checked = true);
  });

/* The states are attributes, so the page follows the pin by watching them */
new MutationObserver(showStates).observe(pin, { attributes: true });
showStates();
