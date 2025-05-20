import { Fragment } from "react";
import { UnknownWidget } from "./unknown-widget";
import { useBuilderContext } from "./builder";
import { type BuilderNode } from "./types";

interface NodeRendererProps {
  node: BuilderNode;
}

export function NodeRenderer({ node }: NodeRendererProps) {
  const { widgets, nodeProviders } = useBuilderContext();

  let Comp = widgets[node.data.type];

  if (!Comp) {
    console.warn(`Widget "${node.data.type}" not found.`);
    Comp = UnknownWidget;
  }

  const jsxInstance = <Comp node={node} />;

  if (!Comp) return jsxInstance;

  const finalElement = nodeProviders.reduce((acc, provider) => {
    const ProviderComp = provider;
    return <ProviderComp node={node}>{acc}</ProviderComp>;
  }, jsxInstance);

  return <Fragment key={node.id}>{finalElement}</Fragment>;
}
