import { ComponentTemplate } from "@scalable.software/component.template";

await ComponentTemplate.Template.load("component.template.html");

customElements.define(ComponentTemplate.Tag, ComponentTemplate);
