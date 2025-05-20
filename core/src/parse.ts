import { Node } from "./node";
import { type BuilderNode, type BuilderNodeData } from "./types";

export function parse(jsonObj: BuilderNodeData): BuilderNode {
  if (!jsonObj || typeof jsonObj.type !== "string") {
    throw new Error(
      "Invalid JSON object: 'type' property is missing or not a string."
    );
  }

  const { children, ...data } = jsonObj;
  const node = new Node(data);

  if (children && Array.isArray(children)) {
    children.forEach((childJson) => {
      const childNode = parse(childJson);
      node.appendChild(childNode);
    });
  }
  return node as BuilderNode;
}
