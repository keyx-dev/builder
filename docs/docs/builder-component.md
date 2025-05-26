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
- `onNodeUpdate`: A callback function of type `(changedNode: Node<BuilderNodeData>, type: ChangeType, details?: ChangeDetails<BuilderNodeData>) => void;` that is called when a node in the tree is updated.
- `renderers`: Of type `RenderersMap`, an object mapping node types to their corresponding React components.
- `propInjectors`: Optional, of type `PropInjector[]`, an array of components that can inject additional props into the rendered nodes.
- `...restGlobalProps`: Any other props passed to the `Builder` component will be spread onto the `RecursiveNodeRenderer` and subsequently available to all custom renderers and prop injectors.

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

const renderers = {
  document: ({ node, children }) => (
    <div>
      {children}
    </div>
  ),
  list: ({ node, children }) => (
    <ul>
      {children}
    </ul>
  ),
  "list-item": ({ node }) => <li>{node.data.textContent as string}</li>,
};

const handleNodeUpdate = (changedNode, type, details) => {
  console.log("Node updated:", changedNode.id, type, details);
  // In a real application, you would update your state here
};

function ExampleBuilder() {
  return (
    <Builder
      rootNode={rootNode}
      renderers={renderers}
      onNodeUpdate={handleNodeUpdate}
    />
  );
}
```
