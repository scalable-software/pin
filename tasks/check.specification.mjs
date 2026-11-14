#! /usr/bin/env node

/**
 * Checks each section of the component's specification against the JSON Schema
 * printed in the policy for that section.
 *
 * Usage: node ./tasks/check.specification.mjs [path to a specification file]
 */

import { readFile, readdir } from "node:fs/promises";
import Ajv from "ajv/dist/2020.js";

/* ───────────────────────────── configuration ───────────────────────────── */

const SPECIFICATIONS = "./specifications/";
const POLICIES = "./.claude/policies/";

// section of the specification → policy that prints its schema
const SECTIONS = {
  Composition: "composition.md",
  States: "state.md",
  Operations: "operation.md",
  Events: "event.md",
  Gestures: "gesture.md"
};

/* ───────────────────────────── helpers ───────────────────────────── */

const findSpecification = async () => {
  const files = await readdir(SPECIFICATIONS);
  const file = files.find((name) => name.endsWith(".specifications.json"));
  if (!file) throw new Error(`No specification found in ${SPECIFICATIONS}`);
  return `${SPECIFICATIONS}${file}`;
};

const readSchema = async (policy) => {
  const text = await readFile(`${POLICIES}${policy}`, "utf8");
  const block = text.split("JSON Schema:")[1]?.split("```json")[1]?.split("```")[0];
  if (!block) throw new Error(`No JSON Schema found in ${POLICIES}${policy}`);
  return JSON.parse(block);
};

const describe = (section, error) =>
  `  ${section}${error.instancePath.replaceAll("/", ".")}: ${error.message}` +
  (error.params?.additionalProperty ? ` ("${error.params.additionalProperty}")` : "");

/* ───────────────────────────── main ───────────────────────────── */

const path = process.argv[2] ?? (await findSpecification());
const specification = JSON.parse(await readFile(path, "utf8"));
const ajv = new Ajv({ allErrors: true });

let failures = 0;

for (const [section, policy] of Object.entries(SECTIONS)) {
  if (!(section in specification)) continue;

  const validate = ajv.compile(await readSchema(policy));
  const valid = validate(specification[section]);

  console.log(`${valid ? "✓" : "✗"} ${section} follows ${policy}`);

  if (!valid) {
    failures++;
    validate.errors.forEach((error) => console.log(describe(section, error)));
  }
}

if (failures) {
  console.error(`\n${path} does not follow ${failures} of its policies.`);
  process.exit(1);
}
