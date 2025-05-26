import { Node } from "../node";
import { parseJsonToNode } from "../utils";
import type { BuilderNodeData } from "../types";

describe("parseJsonToNode", () => {
  it("should parse a simple JSON object into a Node", () => {
    const jsonData: BuilderNodeData = { type: "text", text: "Hello" };
    const node = parseJsonToNode(jsonData);

    expect(node).toBeInstanceOf(Node);
    expect(node.data).toEqual({ type: "text", text: "Hello" });
    expect(node.children).toEqual([]);
    expect(node.parent).toBeNull();
  });

  it("should parse JSON with nested children into a Node tree", () => {
    const jsonData: BuilderNodeData = {
      type: "container",
      children: [
        { type: "text", text: "Child 1" },
        {
          type: "container",
          children: [{ type: "text", text: "Grandchild 1" }],
        },
      ],
    };
    const rootNode = parseJsonToNode(jsonData);

    expect(rootNode).toBeInstanceOf(Node);
    expect(rootNode.data).toEqual({ type: "container" });
    expect(rootNode.children.length).toBe(2);

    const child1 = rootNode.children[0];
    expect(child1).toBeInstanceOf(Node);
    expect(child1.data).toEqual({ type: "text", text: "Child 1" });
    expect(child1.parent).toBe(rootNode);
    expect(child1.children).toEqual([]);

    const child2 = rootNode.children[1];
    expect(child2).toBeInstanceOf(Node);
    expect(child2.data).toEqual({ type: "container" });
    expect(child2.parent).toBe(rootNode);
    expect(child2.children.length).toBe(1);

    const grandChild1 = child2.children[0];
    expect(grandChild1).toBeInstanceOf(Node);
    expect(grandChild1.data).toEqual({ type: "text", text: "Grandchild 1" });
    expect(grandChild1.parent).toBe(child2);
    expect(grandChild1.children).toEqual([]);
  });

  it("should handle empty children array", () => {
    const jsonData: BuilderNodeData = {
      type: "container",
      children: [],
    };
    const node = parseJsonToNode(jsonData);

    expect(node).toBeInstanceOf(Node);
    expect(node.data).toEqual({ type: "container" });
    expect(node.children).toEqual([]);
  });

  it("should handle additional properties in node data", () => {
    const jsonData: BuilderNodeData = {
      type: "custom",
      id: "123",
      props: { color: "red" },
    };
    const node = parseJsonToNode(jsonData);

    expect(node.data).toEqual({
      type: "custom",
      id: "123",
      props: { color: "red" },
    });
  });

  it("should correctly set parent references for all nodes", () => {
    const jsonData: BuilderNodeData = {
      type: "root",
      children: [
        {
          type: "childA",
          children: [{ type: "grandchildA" }],
        },
        { type: "childB" },
      ],
    };
    const rootNode = parseJsonToNode(jsonData);

    const childA = rootNode.children[0];
    const grandchildA = childA.children[0];
    const childB = rootNode.children[1];

    expect(childA.parent).toBe(rootNode);
    expect(grandchildA.parent).toBe(childA);
    expect(childB.parent).toBe(rootNode);
  });
});
