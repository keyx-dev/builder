import { Node, type NodeData } from "./node";
import type { BuilderNodeData } from "./types";

export function parseJsonToNode(
  jsonData: BuilderNodeData
): Node<BuilderNodeData> {
  const { children: jsonChildren, ...dataWithoutChildren } = jsonData;
  const node = new Node<BuilderNodeData>(
    dataWithoutChildren as BuilderNodeData
  );

  if (jsonChildren && Array.isArray(jsonChildren)) {
    jsonChildren.forEach((childJson: BuilderNodeData) => {
      const childNode = parseJsonToNode(childJson);
      node.appendChild(childNode);
    });
  }
  return node;
}

export function rebuildTreeFromChanged<TData extends NodeData>(
  changedNode: Node<TData>
): Node<TData> {
  let newChild = new Node<TData>({ ...changedNode.data });
  (newChild as any).id = changedNode.id;
  newChild.children = changedNode.children;

  let parent = changedNode.parent;
  while (parent) {
    const newParent = new Node<TData>({ ...parent.data });
    (newParent as any).id = parent.id;

    newParent.children = parent.children.map((child) =>
      child === changedNode ? newChild : child
    );

    for (const ch of newParent.children) {
      ch.parent = newParent;
    }

    newChild.parent = newParent;

    changedNode = parent;
    parent = parent.parent;
    newChild = newParent;
  }

  return newChild;
}
