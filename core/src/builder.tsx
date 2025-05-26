import React, { useEffect } from "react";
import type { BuilderProps } from "./types";
import { RecursiveNodeRenderer } from "./recursive-node-renderer";

export const Builder: React.FC<BuilderProps> = ({
  rootNode,
  onNodeUpdate,
  renderers,
  propInjectors = [],
  ...restGlobalProps
}) => {
  useEffect(() => {
    if (!rootNode) return;

    const unlisten = rootNode.onChange((node, type, details) => {
      if (
        type === "descendantChanged" &&
        details?.type === "descendantChanged"
      ) {
        onNodeUpdate(
          details.changedNode,
          details.originalChangeType,
          details.originalDetails
        );
      } else {
        onNodeUpdate(node, type, details);
      }
    });

    return () => {
      unlisten();
    };
  }, [rootNode, onNodeUpdate]);

  if (!rootNode) {
    return null;
  }

  return (
    <RecursiveNodeRenderer
      node={rootNode}
      renderers={renderers}
      propInjectors={propInjectors}
      {...restGlobalProps} // formData vs. buraya yayılır
    />
  );
};
