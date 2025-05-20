# Builder Component

The `Builder` component is the main entry point for creating and managing the builder interface. It provides the necessary context and functionality for rendering and interacting with the builder nodes.

## Usage

```typescript
import { Builder } from '@keyx/builder';

function MyBuilderApp() {
  return (
    <Builder>
    </Builder>
  );
}
```

## Props

The Builder component accepts the following props:

- `rootNode`: Of type `BuilderNode`, represents the root node of the tree to be built.
- `widgets`: Of type `Widgets`, an object mapping node types to their corresponding React components.
- `nodeProviders`: Optional, of type `Provider[]`, an array of providers that provide additional context or functionality to the nodes.

## Examples

Below is a simple example demonstrating the usage of the Builder component:

```jsx live
import { Builder, parse } from '@keyx/builder';
import { NodeRenderer } from '@keyx/builder/node-renderer';

const rootNode = parse({
  type: "document",
  children: [
    {
      type: "list",
      children: [
        {
          type: "list-item",
          textContent: "item 1",
        },
        {
          type: "list-item",
          textContent: "item 2",
        },
      ],
    },
  ],
});

const widgets = {
  document: ({ node }) =>
    node.children?.map((child) => (
      <NodeRenderer node={child} key={child.id} />
    )),
  list: ({ node }) => (
    <ul>
      {node.children?.map((child) => (
        <NodeRenderer node={child} key={child.id} />
      ))}
    </ul>
  ),
  "list-item": ({ node }) => <li>{node.data.textContent as string}</li>,
};

function ExampleBuilder() {
  return (
    <Builder rootNode={rootNode} widgets={widgets} />
  );
}
```
