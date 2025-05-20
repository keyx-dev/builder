import { useContext, createContext } from "react";
import type { BuilderNode, Provider, Widgets } from "./types";
import { NodeRenderer } from "./node-renderer";

export interface BuilderContextType {
  rootNode: BuilderNode;
  widgets: Widgets;
  nodeProviders: Provider[];
}

export const BuilderContext = createContext<BuilderContextType | null>(null);

export function useBuilderContext() {
  const context = useContext(
    BuilderContext as React.Context<BuilderContextType | null>
  );
  if (!context) {
    throw new Error("useBuilderContext must be used within a BuilderProvider");
  }
  return context;
}

export interface BuilderProps {
  rootNode: BuilderNode;
  widgets: Widgets;
  nodeProviders?: Provider[];
}

export function Builder({
  rootNode,
  widgets,
  nodeProviders = [],
}: BuilderProps) {
  return (
    <BuilderContext.Provider
      value={{
        rootNode,
        widgets,
        nodeProviders,
      }}
    >
      <NodeRenderer node={rootNode} key={rootNode.id} />
    </BuilderContext.Provider>
  );
}
