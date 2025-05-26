import { Node } from "../node";
import { rebuildTreeFromChanged } from "../utils";

describe("rebuildTreeFromChanged", () => {
  it("should rebuild the tree from a changed node correctly", () => {
    // Root -> Child1 -> Grandchild1
    //      -> Child2
    const rootData = { type: "root" };
    const child1Data = { type: "child1" };
    const grandChild1Data = { type: "grandchild1" };
    const child2Data = { type: "child2" };

    const root = new Node<any>(rootData);
    const child1 = new Node<any>(child1Data);
    const grandChild1 = new Node<any>(grandChild1Data);
    const child2 = new Node<any>(child2Data);

    root.appendChild(child1);
    child1.appendChild(grandChild1);
    root.appendChild(child2);

    // Simulate a change in grandChild1
    grandChild1.setData("value", "newValue");

    const newRoot = rebuildTreeFromChanged(grandChild1);

    // Verify the new root is a clone of the original root but with updated path
    expect(newRoot.data).toEqual(rootData);
    expect(newRoot.id).toBe(root.id); // IDs should be preserved for the path

    // Verify child1 in new tree
    const newChild1 = newRoot.children.find((c) => c.id === child1.id);
    expect(newChild1).toBeDefined();
    expect(newChild1?.data).toEqual(child1Data);
    expect(newChild1?.parent).toBe(newRoot);

    // Verify grandChild1 in new tree
    const newGrandChild1 = newChild1?.children.find(
      (gc) => gc.id === grandChild1.id
    );
    expect(newGrandChild1).toBeDefined();
    expect(newGrandChild1?.data).toEqual({
      ...grandChild1Data,
      value: "newValue",
    });
    expect(newGrandChild1?.parent).toBe(newChild1);

    // Verify child2 in new tree
    const newChild2 = newRoot.children.find((c) => c.id === child2.id);
    expect(newChild2).toBeDefined();
    expect(newChild2?.data).toEqual(child2Data);
    expect(newChild2?.parent).toBe(newRoot);

    // Ensure other children are still there and correctly linked
    expect(newRoot.children.length).toBe(2);
    expect(newChild1?.children.length).toBe(1);
  });

  it("should rebuild the tree when the root node itself changes", () => {
    const rootData = { type: "root" };
    const root = new Node<any>(rootData);

    root.setData("name", "newRootName");

    const newRoot = rebuildTreeFromChanged(root);

    expect(newRoot.data).toEqual({ ...rootData, name: "newRootName" });
    expect(newRoot.id).toBe(root.id);
    expect(newRoot.parent).toBeNull();
    expect(newRoot.children).toEqual([]);
  });

  it("should rebuild the tree when a direct child of the root changes", () => {
    const rootData = { type: "root" };
    const child1Data = { type: "child1" };
    const child2Data = { type: "child2" };

    const root = new Node<any>(rootData);
    const child1 = new Node<any>(child1Data);
    const child2 = new Node<any>(child2Data);

    root.appendChild(child1);
    root.appendChild(child2);

    child1.setData("value", "updatedChild1");

    const newRoot = rebuildTreeFromChanged(child1);

    expect(newRoot.data).toEqual(rootData);
    expect(newRoot.id).toBe(root.id);
    expect(newRoot.children.length).toBe(2);

    const newChild1 = newRoot.children.find((c) => c.id === child1.id);
    expect(newChild1).toBeDefined();
    expect(newChild1?.data).toEqual({ ...child1Data, value: "updatedChild1" });
    expect(newChild1?.parent).toBe(newRoot);

    const newChild2 = newRoot.children.find((c) => c.id === child2.id);
    expect(newChild2).toBeDefined();
    expect(newChild2?.data).toEqual(child2Data);
    expect(newChild2?.parent).toBe(newRoot);
  });

  it("should handle a node with no parent (already root)", () => {
    const nodeData = { type: "singleNode" };
    const node = new Node<any>(nodeData);

    node.setData("prop", "value");

    const newRoot = rebuildTreeFromChanged(node);

    expect(newRoot.data).toEqual({ ...nodeData, prop: "value" });
    expect(newRoot.id).toBe(node.id);
    expect(newRoot.parent).toBeNull();
    expect(newRoot.children).toEqual([]);
  });

  it("should handle a node that is removed from its parent before rebuilding", () => {
    const rootData = { type: "root" };
    const childData = { type: "child" };

    const root = new Node<any>(rootData);
    const child = new Node<any>(childData);
    root.appendChild(child);

    child.remove(); // Remove child from parent

    const newChild = rebuildTreeFromChanged(child);

    expect(newChild.data).toEqual(childData);
    expect(newChild.id).toBe(child.id);
    expect(newChild.parent).toBeNull(); // Should still be null as it was removed
    expect(newChild.children).toEqual([]);
  });
});
