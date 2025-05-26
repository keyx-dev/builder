import { Node } from "../node";

describe("Node", () => {
  let rootNode: Node<any>;
  let child1: Node<any>;
  let child2: Node<any>;
  let grandChild: Node<any>;

  beforeEach(() => {
    rootNode = new Node({ type: "root" });
    child1 = new Node({ type: "child1", value: "A" });
    child2 = new Node({ type: "child2", value: "B" });
    grandChild = new Node({ type: "grandChild", value: "C" });

    rootNode.appendChild(child1);
    child1.appendChild(grandChild);
    rootNode.appendChild(child2);
  });

  it("should initialize with correct data and id", () => {
    const node = new Node({ type: "test", name: "myNode" });
    expect(node.data).toEqual({ type: "test", name: "myNode" });
    expect(node.id).toMatch(/^node-\d+$/);
    expect(node.parent).toBeNull();
    expect(node.children).toEqual([]);
  });

  it("should append a child correctly", () => {
    const newChild = new Node({ type: "newChild" });
    rootNode.appendChild(newChild);

    expect(rootNode.children).toContain(newChild);
    expect(newChild.parent).toBe(rootNode);
    expect(rootNode.children.length).toBe(3);
  });

  it("should remove a child correctly", () => {
    rootNode.removeChild(child1);

    expect(rootNode.children).not.toContain(child1);
    expect(child1.parent).toBeNull();
    expect(rootNode.children.length).toBe(1);
    expect(rootNode.children[0]).toBe(child2);
  });

  it("should notify listeners on data change", () => {
    const listener = vi.fn();
    rootNode.onChange(listener);

    rootNode.setData("value", "newRootValue");
    expect(listener).toHaveBeenCalledWith(
      rootNode,
      "dataChanged",
      expect.objectContaining({
        type: "dataChanged",
        key: "value",
        value: "newRootValue",
      })
    );
    expect(rootNode.data.value).toBe("newRootValue");
  });

  it("should notify parent on descendant data change", () => {
    const listener = vi.fn();
    rootNode.onChange(listener);

    grandChild.setData("value", "newGrandChildValue");

    expect(listener).toHaveBeenCalledWith(
      rootNode,
      "descendantChanged",
      expect.objectContaining({
        type: "descendantChanged",
        originalChangeType: "dataChanged",
        changedNode: grandChild,
        originalDetails: expect.objectContaining({
          type: "dataChanged",
          key: "value",
          value: "newGrandChildValue",
        }),
      })
    );
  });

  it("should notify parent on descendant appendChild", () => {
    const listener = vi.fn();
    rootNode.onChange(listener);

    const newChildOfChild1 = new Node({ type: "newChildOfChild1" });
    child1.appendChild(newChildOfChild1);

    expect(listener).toHaveBeenCalledWith(
      rootNode,
      "descendantChanged",
      expect.objectContaining({
        type: "descendantChanged",
        originalChangeType: "appendChild",
        changedNode: child1,
        originalDetails: expect.objectContaining({
          type: "appendChild",
          child: newChildOfChild1,
        }),
      })
    );
  });

  it("should notify parent on descendant removeChild", () => {
    const listener = vi.fn();
    rootNode.onChange(listener);

    child1.removeChild(grandChild);

    expect(listener).toHaveBeenCalledWith(
      rootNode,
      "descendantChanged",
      expect.objectContaining({
        type: "descendantChanged",
        originalChangeType: "removeChild",
        changedNode: child1,
        originalDetails: expect.objectContaining({
          type: "removeChild",
          child: grandChild,
        }),
      })
    );
  });

  it("should notify parent on descendant insertBefore", () => {
    const listener = vi.fn();
    rootNode.onChange(listener);

    const newChildOfChild1 = new Node({ type: "newChildOfChild1" });
    child1.insertBefore(newChildOfChild1, grandChild);

    expect(listener).toHaveBeenCalledWith(
      rootNode,
      "descendantChanged",
      expect.objectContaining({
        type: "descendantChanged",
        originalChangeType: "insertBefore",
        changedNode: child1,
        originalDetails: expect.objectContaining({
          type: "insertBefore",
          newNode: newChildOfChild1,
          referenceNode: grandChild,
        }),
      })
    );
  });

  it("should notify parent on descendant replaceChild", () => {
    const listener = vi.fn();
    rootNode.onChange(listener);

    const replacementNode = new Node({ type: "replacement" });
    child1.replaceChild(replacementNode, grandChild);

    expect(listener).toHaveBeenCalledWith(
      rootNode,
      "descendantChanged",
      expect.objectContaining({
        type: "descendantChanged",
        originalChangeType: "replaceChild",
        changedNode: child1,
        originalDetails: expect.objectContaining({
          type: "replaceChild",
          newNode: replacementNode,
          oldNode: grandChild,
        }),
      })
    );
  });

  it("should return previous sibling", () => {
    expect(child2.prev).toBe(child1);
    expect(child1.prev).toBeNull();
  });

  it("should return next sibling", () => {
    expect(child1.next).toBe(child2);
    expect(child2.next).toBeNull();
  });

  it("should return all siblings", () => {
    expect(child1.siblings).toEqual([child2]);
    expect(child2.siblings).toEqual([child1]);
    expect(grandChild.siblings).toEqual([]);
  });

  it("should remove node from its parent", () => {
    child1.remove();
    expect(rootNode.children).not.toContain(child1);
    expect(child1.parent).toBeNull();
  });

  it("should insert a new node before a reference node", () => {
    const newNode = new Node({ type: "newNode" });
    rootNode.insertBefore(newNode, child2);
    expect(rootNode.children[1]).toBe(newNode);
    expect(newNode.parent).toBe(rootNode);
  });

  it("should insert a new node at the end if reference node is null", () => {
    const newNode = new Node({ type: "newNode" });
    rootNode.insertBefore(newNode, null);
    expect(rootNode.children[rootNode.children.length - 1]).toBe(newNode);
    expect(newNode.parent).toBe(rootNode);
  });

  it("should replace a child node", () => {
    const replacementNode = new Node({ type: "replacement" });
    rootNode.replaceChild(replacementNode, child1);
    expect(rootNode.children).toContain(replacementNode);
    expect(rootNode.children).not.toContain(child1);
    expect(replacementNode.parent).toBe(rootNode);
    expect(child1.parent).toBeNull();
  });

  it("should clone a node (shallow)", () => {
    const clonedNode = rootNode.clone();
    expect(clonedNode.data).toEqual(rootNode.data);
    expect(clonedNode.id).not.toBe(rootNode.id);
    expect(clonedNode.children).toEqual([]); // Shallow clone, no children
    expect(clonedNode.parent).toBeNull();
  });

  it("should clone a node (deep)", () => {
    const clonedNode = rootNode.clone(true);
    expect(clonedNode.data).toEqual(rootNode.data);
    expect(clonedNode.id).not.toBe(rootNode.id);
    expect(clonedNode.children.length).toBe(rootNode.children.length);
    expect(clonedNode.children[0].data).toEqual(rootNode.children[0].data);
    expect(clonedNode.children[0].id).not.toBe(rootNode.children[0].id);
    expect(clonedNode.children[0].parent).toBe(clonedNode);
    expect(clonedNode.children[0].children[0].data).toEqual(
      rootNode.children[0].children[0].data
    );
    expect(clonedNode.children[0].children[0].id).not.toBe(
      rootNode.children[0].children[0].id
    );
    expect(clonedNode.children[0].children[0].parent).toBe(
      clonedNode.children[0]
    );
  });

  it("should serialize node to JSON", () => {
    const json = rootNode.toJSON();
    expect(json).toEqual({
      type: "root",
      children: [
        {
          type: "child1",
          value: "A",
          children: [{ type: "grandChild", value: "C" }],
        },
        { type: "child2", value: "B" },
      ],
    });
  });

  it("should not include children property if no children", () => {
    const node = new Node({ type: "single" });
    const json = node.toJSON();
    expect(json).toEqual({ type: "single" });
    expect(json).not.toHaveProperty("children");
  });

  it("should handle setData for children key with warning", () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    rootNode.setData("children" as any, [{ type: "newChildData" }]);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Use Node manipulation methods (appendChild, removeChild, etc.) to modify children, not setData."
    );
    expect(rootNode.data).not.toHaveProperty("children"); // Ensure children property is not set on data
    consoleWarnSpy.mockRestore();
  });
});
