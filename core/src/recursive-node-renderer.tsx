import React from "react";
import { Node } from "./node";
import type {
  BuilderNodeData,
  RenderersMap,
  PropInjector,
  RendererProps,
} from "./types";

interface RecursiveNodeRendererProps {
  node: Node<BuilderNodeData>;
  renderers: RenderersMap;
  propInjectors: PropInjector[];
  [key: string]: any;
}

export const RecursiveNodeRenderer: React.FC<RecursiveNodeRendererProps> = ({
  node,
  renderers,
  propInjectors,
  ...restGlobalProps // formData, onFormDataChange, currentPathPrefix, arrayIndices vs.
}) => {
  const Renderer = renderers[node.data.type];

  if (!Renderer) {
    console.warn(`No renderer found for type: ${node.data.type}`);
    return (
      <div style={{ border: "1px dashed red", padding: "10px", margin: "5px" }}>
        <strong>Unknown type: {node.data.type}</strong>
        <pre>{JSON.stringify(node.data, null, 2)}</pre>
        {node.children.map((child) => (
          <RecursiveNodeRenderer
            key={child.id}
            node={child}
            renderers={renderers}
            propInjectors={propInjectors}
            {...restGlobalProps}
          />
        ))}
      </div>
    );
  }

  const renderedChildren =
    node.children.length > 0
      ? node.children.map((childNode) => (
          <RecursiveNodeRenderer
            key={childNode.id}
            node={childNode}
            renderers={renderers}
            propInjectors={propInjectors}
            {...restGlobalProps}
          />
        ))
      : null;

  const rendererProps: RendererProps<BuilderNodeData> = {
    node,
    children: renderedChildren,
    context: {
      core: {
        renderers: renderers,
        propInjectors: propInjectors,
      },
      ...restGlobalProps,
    },
  };

  let renderElement = <Renderer {...rendererProps} />;

  if (propInjectors && propInjectors.length > 0) {
    for (let i = propInjectors.length - 1; i >= 0; i--) {
      const InjectorWrapper = propInjectors[i];
      renderElement = (
        <InjectorWrapper node={node} {...restGlobalProps}>
          {renderElement}
        </InjectorWrapper>
      );
    }
  }

  return renderElement;
};
