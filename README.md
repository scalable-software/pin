![License: CC BY-NC-SA 4.0](https://flat.badgen.net/static/license/CC-BY-NC-SA-4.0/green)

# Component Template

This is a template for creating a new component. It includes a basic structure for the component, as well as a set of scripts for building, testing, and documenting the component.

## Getting Started

To create a new component, you can use this template as a starting point. To do so, click the "Use this template" button at the top of the repository page. This will create a new repository with the same structure as this one.

Once you have created a new repository, you can clone it to your local machine and start working on your component.

```bash
git clone
```

## Update the Component Metadata

Update the name of the package:

1. Package: `package.json` in the `root` directory.

2. Typescript Config: both `tsconfig.json` files are in the `root` directory.

3. ES Module: `importmap.js` files in the `importmap` directory.

4. Unit Testing: The `wallaby.js` and `karma.conf.js` files are in the `root` directory.

5. Demo: The `index.js` file in the `demo` directory.

## Building the Component

To build the component, you can use the `build` script. This script will compile the component's source code and generate a distributable version of the component.

```bash
npm run build
```

## Testing the Component

To test the component, you can use the `test` script. This script will run the component's test suite and generate a coverage report.

```bash
npm test
```

## Document the Component API

To document the component API, you can use the `docs` script. This script will generate a set of documentation files for the component.

```bash
npm run document
```

## License

> his software and its documentation are released under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International Public License (CC BY-NC-SA 4.0). This means you are free to share, copy, distribute, and transmit the work, and to adapt it, but only under the following conditions:
>
> Attribution: You must attribute the work in the manner specified by the author or licensor (but not in any way that suggests that they endorse you or your use of the work).
>
> NonCommercial: You may not use this material for commercial purposes.
>
> ShareAlike: If you alter, transform, or build upon this work, you may distribute the resulting work only under the same or similar license to this one.
>
> For more details, please visit the full [license agreement](https://creativecommons.org/licenses/by-nc-sa/4.0/).
