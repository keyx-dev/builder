import React from "react";
import { Node } from "./node";
import type { ChangeDetails, ChangeType } from "./node"; // Import as types

export type { ChangeDetails, ChangeType }; // Export the types

export interface BaseNodeData {
  children?: BaseNodeData[];
}

export interface BuilderNodeData extends BaseNodeData {
  type: string;
  children?: BuilderNodeData[];
  dataPath?: string; // Add dataPath here
  [key: string]: any;
}

export interface RendererProps<
  TData extends BuilderNodeData = BuilderNodeData,
> {
  node: Node<TData>;
  children?: React.ReactNode;
  [key: string]: any;
}

export type RendererComponent<TData extends BuilderNodeData = BuilderNodeData> =
  React.ComponentType<RendererProps<TData>>;

export interface RenderersMap {
  [type: string]: RendererComponent<any>;
}

export type PropInjector = React.ComponentType<{
  node: Node<BuilderNodeData>;
  children: React.ReactNode;
  [key: string]: any;
}>;

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

export type BuilderNode<TData extends BuilderNodeData = BuilderNodeData> =
  Node<TData>;
