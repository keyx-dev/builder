import { useCallback, useState } from "react";
import type { BuilderProps } from "../types";
import { parseJsonToNode, rebuildTreeFromChanged } from "../utils";
import { Builder } from "../builder";

export function Render(args: BuilderProps) {
  const [rootNode, setRootNode] = useState(() => {
    return parseJsonToNode(args.data);
  });

  const handleNodeUpdate = useCallback((changedNode: any) => {
    setRootNode(rebuildTreeFromChanged(changedNode));
  }, []);

  return (
    <Builder
      renderers={args.renderers}
      rootNode={rootNode}
      onNodeUpdate={handleNodeUpdate}
    />
  );
}
