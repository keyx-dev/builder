# Builder Core

`builder/core` is a package that provides the fundamental building blocks and tools for creating user interfaces. It offers capabilities for dynamically creating, parsing, and rendering UI components.

## Overview

This package includes the following core modules:

- **`builder`**: The main entry point for the UI building logic.
- **`node-renderer`**: Renders defined node structures by converting them into React components.
- **`node`**: Defines the basic node structure within the UI hierarchy.
- **`parse`**: Parses UI definitions in a specific format into `node` structures.
- **`types`**: Contains the TypeScript types used within the package.
- **`unknown-widget`**: Provides a default component to be rendered when an undefined or unsupported component type is encountered.

## Installation

Since this package is part of a monorepo, it is typically not installed directly, but dependencies are managed from the project's root directory.

If it were to be published as a separate package:

```bash
pnpm add builder
# or
npm install builder
# or
yarn add builder
```

## Usage

The core functionality revolves around parsing a UI definition into a tree of `BuilderNode` objects and then rendering this tree using the `Builder` component.

First, define your UI structure using a plain JavaScript object:

```typescript
const uiDefinition = {
  type: "document",
  children: [
    {
      type: "list",
      children: [
        {
          type: "list-item",
          textContent: "Item 1",
        },
        {
          type: "list-item",
          textContent: "Item 2",
        },
      ],
    },
  ],
};
```

Then, parse this definition into a `BuilderNode` tree:

```typescript
import { parse } from "builder";

const nodeTree = parse(uiDefinition);
```

Finally, render the `BuilderNode` tree using the `Builder` component, providing custom components for each node `type` in the `widgets` prop:

```typescript
import { Builder, NodeRenderer } from "builder";
import React from "react";

const uiDefinition = {
  type: "document",
  children: [
    {
      type: "list",
      children: [
        {
          type: "list-item",
          textContent: "Item 1",
        },
        {
          type: "list-item",
          textContent: "Item 2",
        },
      ],
    },
  ],
};

const widgets = {
  document: ({ node }) => (
    <div>
      {node.children?.map((child) => (
        <NodeRenderer node={child} key={child.id} />
      ))}
    </div>
  ),
  list: ({ node }) => (
    <ul>
      {node.children?.map((child) => (
        <NodeRenderer node={child} key={child.id} />
      ))}
    </ul>
  ),
  "list-item": ({ node }) => <li>{node.data.textContent as string}</li>,
  // Add more widget components for other node types
};

const nodeTree = parse(uiDefinition);

function App() {

  return <Builder rootNode={nodeTree} widgets={widgets} />;
}
```

This example demonstrates how to define a simple UI structure, parse it, and render it using custom React components provided to the `Builder` component.

## Development

To develop this package, you can use the following scripts (should be run in the `builder/core` directory of the project):

- `npm run dev`: Starts Storybook in development mode (usually on `localhost:6006`).
- `npm run build`: Builds the package with TypeScript compilation and Vite.
- `npm run build-storybook`: Creates a static build for Storybook.
- `npm run lint`: Checks code style with ESLint.
- `npm run preview`: Serves a preview of the built package with Vite.
- `npm run test`: Runs tests with Vitest.

## Contributing

Thank you for your contributions! Please read the contributing guide (CONTRIBUTING.md - if available) before opening issues or sending pull requests.
