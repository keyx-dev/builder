# Utility Functions

The `@keyx/builder` library provides several utility functions to help with node tree manipulation and serialization.

## `parseJsonToNode` Function

The `parseJsonToNode` function is used to convert a plain JavaScript object (typically parsed from JSON) into a tree of `Node` objects that can be used by the builder. It recursively processes the `children` property to build the full node hierarchy.

### Usage

```typescript
import { parseJsonToNode } from "@keyx/builder/utils"; // Note the specific import path

const rawJsonData = {
  type: "document",
  title: "My Document",
  children: [
    {
      type: "paragraph",
      textContent: "This is a paragraph.",
    },
    {
      type: "list",
      children: [
        { type: "list-item", textContent: "Item 1" },
        { type: "list-item", textContent: "Item 2" },
      ],
    },
  ],
};

const nodeTree = parseJsonToNode(rawJsonData);
console.log(nodeTree); // A Node instance with children
```

### Parameters

- `jsonData: BuilderNodeData`: The raw JavaScript object representing the node structure. It should conform to the `BuilderNodeData` interface, including a `type` property and an optional `children` array.

### Return Value

- `Node<BuilderNodeData>`: A `Node` instance representing the root of the newly constructed node tree. All nested `children` in the `jsonData` will also be converted into `Node` instances and appended to their respective parents.

## `rebuildTreeFromChanged` Function

The `rebuildTreeFromChanged` function is a utility that helps in reconstructing a new node tree from a `changedNode` and its ancestors. This can be useful in scenarios where you need an immutable representation of the tree after a specific node has been modified, especially when dealing with state management patterns that prefer immutability.

### Usage

```typescript
import { rebuildTreeFromChanged } from "@keyx/builder/utils";
import { Node } from "@keyx/builder/node";

// Assume you have an existing node tree
const root = new Node({ type: "document" });
const child1 = new Node({ type: "paragraph", textContent: "Original text" });
const child2 = new Node({
  type: "paragraph",
  textContent: "Another paragraph",
});
root.appendChild(child1);
root.appendChild(child2);

// Simulate a change to child1
child1.setData("textContent", "Updated text");

// Rebuild the tree from the changed node (child1)
const newRoot = rebuildTreeFromChanged(child1);

console.log("Original root:", root.toJSON());
console.log("New root (rebuilt from changed node):", newRoot.toJSON());

// Note: The original tree (root) remains unchanged if you're using this for immutable updates.
// The newRoot will contain the updated child1 and new instances of its ancestors.
```

### Parameters

- `changedNode: Node<TData>`: The specific `Node` instance that has been modified or is the point of interest for rebuilding the tree.

### Return Value

- `Node<TData>`: A new `Node` instance representing the root of the rebuilt tree. This new tree will incorporate the `changedNode` and new instances of its ancestors, while preserving the structure and data of other unchanged parts of the tree.
