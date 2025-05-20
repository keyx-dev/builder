import { type FC, type ReactNode } from "react";
import { Node } from "./node";

export type BuilderNodeData = {
  type: string;
  children?: BuilderNodeData[];
  [key: string]: unknown;
};

export type BuilderNode = Node<BuilderNodeData>;

export interface BaseWidgetProps {
  node: BuilderNode;
}

export type WidgetProps<TData extends BuilderNodeData> = BaseWidgetProps & {
  node: Node<TData>;
};

export type Widgets<
  ExtendedProps extends object = object,
  TDataTypes extends BuilderNodeData = BuilderNodeData,
> = {
  [K in TDataTypes["type"]]?: React.ComponentType<
    WidgetProps<Extract<TDataTypes, { type: K }>> & ExtendedProps
  >;
};

export interface NodeProviderProps {
  node: BuilderNode;
  children: ReactNode;
}

export type Provider = FC<NodeProviderProps>;
