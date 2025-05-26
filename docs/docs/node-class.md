# Node Class

The `Node` class represents a single node within the builder's tree structure. Each node encapsulates its own data, manages its children, and provides methods for tree manipulation and change notification.

## Properties

- `id: string`: A unique identifier for the node, automatically generated upon creation.
- `data: TData`: An object containing the custom data associated with this node. `TData` extends `NodeData`.
- `parent: Node<TData> | null`: A reference to the parent node. `null` if it's the root node.
- `children: Node<TData>[]`: An array of child nodes.
- `listeners: NodeChangeListener<TData>[]`: An internal array of change listeners.

## Change Types and Details

The `Node` class uses specific types to describe changes within the node tree:

### `ChangeType`

Defines the type of change that occurred:

- `"appendChild"`: A child node was added.
- `"removeChild"`: A child node was removed.
- `"insertBefore"`: A new node was inserted before a reference node.
- `"replaceChild"`: An existing child node was replaced by a new one.
- `"dataChanged"`: The `data` property of the node was modified.
- `"childOrderChanged"`: The order of child nodes changed (currently not explicitly used for notification, but part of the type).
- `"descendantChanged"`: A change occurred in one of the node's descendants.

### `ChangeDetails<TData>`

Provides specific details about the change:

- `{ type: "dataChanged"; key: keyof TData; value: TData[keyof TData] }`: For `dataChanged` events, specifies the key and new value.
- `{ type: "appendChild"; child: Node<TData> }`: For `appendChild` events, specifies the added child.
- `{ type: "removeChild"; child: Node<TData> }`: For `removeChild` events, specifies the removed child.
- `{ type: "insertBefore"; newNode: Node<TData>; referenceNode: Node<TData> | null }`: For `insertBefore` events, specifies the new node and the reference node.
- `{ type: "replaceChild"; newNode: Node<TData>; oldNode: Node<TData> }`: For `replaceChild` events, specifies the new and old nodes.
- `{ type: "childOrderChanged" }`: For `childOrderChanged` events (no specific details beyond type).
- `{ type: "descendantChanged"; originalChangeType: ChangeType; changedNode: Node<TData>; originalDetails?: ChangeDetails<TData> }`: For `descendantChanged` events, provides the original change type, the node that actually changed, and its original details.

## Methods

### `constructor(data: TData)`

Creates a new `Node` instance. The `data` object is used to initialize the node's data. Any `children` property within the initial `data` is ignored, as children should be added using `appendChild` or `insertBefore`.

### `onChange(listener: NodeChangeListener<TData>): () => void`

Registers a listener function that will be called whenever the node or its descendants change. Returns an `unlisten` function to remove the listener.

### `_notifyChange(type: ChangeType, details?: ChangeDetails<TData>): void` (Private)

An internal method used to notify listeners of a change. It also propagates `descendantChanged` events up to the parent nodes.

### `setData<K extends keyof TData>(key: K, value: TData[K]): void`

Updates a specific key-value pair in the node's `data`. Triggers a `dataChanged` event.
**Warning**: Do not use this method to modify the `children` property. Use `appendChild`, `removeChild`, etc., for child manipulation.

### `prev: Node<TData> | null` (Getter)

Returns the previous sibling node, or `null` if it's the first child or has no parent.

### `next: Node<TData> | null` (Getter)

Returns the next sibling node, or `null` if it's the last child or has no parent.

### `siblings: Node<TData>[]` (Getter)

Returns an array of all sibling nodes (excluding itself).

### `_detach(): void` (Private)

An internal method to remove the node from its current parent.

### `appendChild(childNode: Node<TData>): Node<TData>`

Adds a `childNode` to the end of the current node's children. If the `childNode` already has a parent, it will be detached from its old parent first.

### `removeChild(childNode: Node<TData>): Node<TData> | null`

Removes a `childNode` from the current node's children. Returns the removed child or `null` if not found.

### `remove(): void`

Removes the current node from its parent.

### `insertBefore(newNode: Node<TData>, referenceNode: Node<TData> | null): Node<TData>`

Inserts `newNode` before `referenceNode`. If `referenceNode` is `null`, `newNode` is appended to the end. If `newNode` already has a parent, it will be detached first.

### `replaceChild(newNode: Node<TData>, oldNode: Node<TData>): Node<TData>`

Replaces `oldNode` with `newNode` in the current node's children. `oldNode` must be a direct child.

### `before(newNode: Node<TData>): void`

Inserts `newNode` immediately before the current node in its parent's children list. Throws an error if the node has no parent.

### `after(newNode: Node<TData>): void`

Inserts `newNode` immediately after the current node in its parent's children list. Throws an error if the node has no parent.

### `clone(deep: boolean = false): Node<TData>`

Creates a clone of the current node.

- If `deep` is `true`, it recursively clones all descendant nodes.
- If `deep` is `false` (default), only the node's data is cloned, and children are not copied.

### `toJSON(): SerializedNode<TData>`

Serializes the node and its children into a plain JavaScript object, suitable for JSON serialization. The `children` property is only included if the node has children.

## Usage

```typescript
import { Node } from "@keyx/builder/node"; // Note the specific import path

// Create a root node
const rootNode = new Node({ type: "document", title: "My Document" });

// Create child nodes
const paragraph1 = new Node({
  type: "paragraph",
  textContent: "This is the first paragraph.",
});
const paragraph2 = new Node({
  type: "paragraph",
  textContent: "This is the second paragraph.",
});

// Append children
rootNode.appendChild(paragraph1);
rootNode.appendChild(paragraph2);

// Listen for changes
const unlisten = rootNode.onChange((node, type, details) => {
  console.log(`Node ${node.id} changed: ${type}`, details);
});

// Update data
paragraph1.setData("textContent", "Updated first paragraph.");

// Insert a new node
const heading = new Node({
  type: "heading",
  level: 1,
  textContent: "Introduction",
});
rootNode.insertBefore(heading, paragraph1);

// Remove a node
rootNode.removeChild(paragraph2);

// Clone a node
const clonedRoot = rootNode.clone(true); // Deep clone

// Serialize to JSON
const jsonOutput = rootNode.toJSON();
console.log(JSON.stringify(jsonOutput, null, 2));

// Don't forget to unlisten when no longer needed
unlisten();
```
