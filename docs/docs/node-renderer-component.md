# RecursiveNodeRenderer Component

The `RecursiveNodeRenderer` component is a core part of the `@keyx/builder` library, responsible for recursively rendering a node tree. It takes a `Node` object and a map of `renderers` to determine how each node should be displayed. It also supports `propInjectors` to dynamically add props to rendered components.

## Usage

Typically, you won't directly use `RecursiveNodeRenderer` in your application code. It's internally used by the `Builder` component to render the `rootNode` and its descendants. However, understanding its props is crucial for customizing the rendering behavior.

## Props

The `RecursiveNodeRenderer` component accepts the following props:

- `node: Node<BuilderNodeData>`: The current node to be rendered. This node contains the `data` (including `type`) and `children` that define its structure and content.
- `renderers: RenderersMap`: An object where keys are node `type` strings and values are `RendererComponent`s. The `RecursiveNodeRenderer` looks up the appropriate component based on `node.data.type`.
- `propInjectors: PropInjector[]`: An optional array of `PropInjector` components. These components wrap the rendered element and can inject additional props, allowing for dynamic modifications to the rendering process.
- `...restGlobalProps`: Any other props passed to `RecursiveNodeRenderer` (e.g., `formData`, `onFormDataChange`, `currentPathPrefix`, `arrayIndices` from the `Builder` component) are spread onto the `RendererComponent` and also passed to `PropInjector` components.

## How it Works

1. **Renderer Lookup**: The component first attempts to find a `RendererComponent` in the `renderers` map using `node.data.type`.
2. **Unknown Type Handling**: If no renderer is found for a given `node.data.type`, a warning is logged to the console, and a default fallback `div` element is rendered. This fallback includes a visual indicator (red dashed border) and displays the node's data for debugging purposes. Its children are still recursively rendered.
3. **Children Rendering**: If the current node has children, `RecursiveNodeRenderer` recursively calls itself for each child, passing down the `renderers`, `propInjectors`, and `restGlobalProps`. The result of these recursive calls is collected into `renderedChildren`.
4. **Prop Injection**: Before rendering the final element, the `propInjectors` are applied. Each `PropInjector` component wraps the previously rendered element, allowing it to modify or add props to the component it wraps. Injectors are applied in reverse order of the `propInjectors` array, meaning the last injector in the array will be the outermost wrapper.
5. **Final Render**: The selected `RendererComponent` is rendered with the `node`, `renderedChildren`, and all `restGlobalProps`.

## Customizing Rendering

To customize how different node types are rendered, you provide a `renderers` map to the `Builder` component (which then passes it to `RecursiveNodeRenderer`). Each renderer component receives `node`, `children`, and any `restGlobalProps`.

```typescript
import React from 'react';
import { Builder, Node, type BuilderNodeData, type RenderersMap } from '@keyx/builder';

// Define your custom renderers
const myRenderers: RenderersMap = {
  document: ({ node, children }) => (
    <div style={{ border: '1px solid blue', padding: '10px' }}>
      <h1>Document Root</h1>
      {children} {/* Renders children recursively */}
    </div>
  ),
  paragraph: ({ node }) => (
    <p>{node.data.textContent as string}</p>
  ),
  image: ({ node }) => (
    <img src={node.data.src as string} alt={node.data.alt as string} style={{ maxWidth: '100%' }} />
  ),
};

// Example of a PropInjector
const MyPropInjector: PropInjector = ({ node, children, ...rest }) => {
  // You can add/modify props here before passing them to children
  const injectedProps = {
    'data-node-id': node.id,
    'data-node-type': node.data.type,
    // ... other props based on node data or global props
  };

  // React.cloneElement is used to inject props into the child element
  return React.cloneElement(children as React.ReactElement, injectedProps);
};

// Example usage with Builder
const rootNode = new Node<BuilderNodeData>({
  type: "document",
  children: [
    { type: "paragraph", textContent: "Hello from a paragraph!" },
    { type: "image", src: "https://example.com/image.jpg", alt: "Example Image" },
  ],
});

const handleNodeUpdate = (changedNode, type, details) => {
  console.log("Node updated:", changedNode.id, type, details);
};

function MyCustomBuilderApp() {
  return (
    <Builder
      rootNode={rootNode}
      renderers={myRenderers}
      propInjectors={[MyPropInjector]} // Pass your prop injectors here
      onNodeUpdate={handleNodeUpdate}
      // ... any other global props
    />
  );
}
```
