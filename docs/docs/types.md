# Core Types

Understanding the core types is essential for effectively working with the `@keyx/builder` library, especially when defining custom renderers, prop injectors, or interacting with the builder's data structures. These types are primarily defined in `builder/core/src/types.ts`.

## `BaseNodeData`

An interface that serves as the base for all node data. It primarily defines the optional `children` property, which is an array of `BaseNodeData` objects.

```typescript
export interface BaseNodeData {
  children?: BaseNodeData[];
}
```

## `BuilderNodeData`

Extends `BaseNodeData` and adds a mandatory `type` property (string) and an index signature `[key: string]: any;` to allow for arbitrary additional properties. This is the primary interface for the data stored within a `Node` instance in the builder.

```typescript
export interface BuilderNodeData extends BaseNodeData {
  type: string;
  children?: BuilderNodeData[]; // Redefined for consistency with BuilderNodeData
  [key: string]: any; // Allows any other properties
}
```

## `RendererProps<TData>`

Defines the props that are passed to any `RendererComponent`.

- `node: Node<TData>`: The `Node` instance currently being rendered.
- `children?: React.ReactNode`: The rendered children of the current node. This is typically the result of `RecursiveNodeRenderer` rendering the current node's direct children.
- `[key: string]: any;`: Allows for any additional global props (like `formData`, `onFormDataChange`, etc.) passed down from the `Builder` component.

```typescript
export interface RendererProps<
  TData extends BuilderNodeData = BuilderNodeData,
> {
  node: Node<TData>;
  children?: React.ReactNode;
  [key: string]: any;
}
```

## `RendererComponent<TData>`

A type alias for a React component that accepts `RendererProps`. This is the type expected for components provided in the `renderers` map.

```typescript
export type RendererComponent<TData extends BuilderNodeData = BuilderNodeData> =
  React.ComponentType<RendererProps<TData>>;
```

## `RenderersMap`

An object type that maps node `type` strings to their corresponding `RendererComponent`s. This map is provided to the `Builder` component to define how different node types should be rendered.

```typescript
export interface RenderersMap {
  [type: string]: RendererComponent<any>; // Keys are node types, values are renderer components
}
```

## `PropInjector`

A type alias for a React component that acts as a "prop injector." These components wrap a rendered element and can inject additional props into it. They receive the `node` and the `children` (which is the element they are wrapping), along with any global props.

```typescript
export type PropInjector = React.ComponentType<{
  node: Node<BuilderNodeData>;
  children: React.ReactNode;
  [key: string]: any;
}>;
```

## `BuilderProps`

Defines the props accepted by the main `Builder` component.

- `rootNode: Node<BuilderNodeData> | null`: The root node of the tree to be rendered.
- `onNodeUpdate: (changedNode: Node<BuilderNodeData>, type: ChangeType, details?: ChangeDetails<BuilderNodeData>) => void;`: A callback function invoked whenever a node in the tree changes.
- `renderers: RenderersMap`: The map of components used to render different node types.
- `propInjectors?: PropInjector[]`: An optional array of prop injector components.
- `[key: string]: any;`: Allows for any other global props to be passed down to renderers and prop injectors.

```typescript
export interface BuilderProps {
  rootNode: Node<BuilderNodeData> | null;
  onNodeUpdate: (
    changedNode: Node<BuilderNodeData>,
    type: ChangeType,
    details?: ChangeDetails<BuilderNodeData>
  ) => void;
  renderers: RenderersMap;
  propInjectors?: PropInjector[];
  [key: string]: any;
}
```

## `BuilderNode<TData>`

A simple type alias for `Node<TData>`, primarily used for clarity when referring to nodes specifically within the context of the builder.

```typescript
export type BuilderNode<TData extends BuilderNodeData> = Node<TData>;
```
