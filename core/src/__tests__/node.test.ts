import { describe, it, expect } from "vitest";
import { Node } from "../node";

describe("Node", () => {
  it("should create a node with data and a unique ID", () => {
    const data = { type: "div", text: "Hello" };
    const node = new Node(data);

    expect(node).toBeInstanceOf(Node);
    expect(node.data).toEqual(data);
    expect(node.id).toMatch(/^node-\d+$/);
  });

  it("should append a child node", () => {
    const parent = new Node({ type: "parent" });
    const child = new Node({ type: "child" });

    parent.appendChild(child);

    expect(parent.children).toHaveLength(1);
    expect(parent.children[0]).toBe(child);
    expect(child.parent).toBe(parent);
  });

  it("should remove a child node", () => {
    const parent = new Node({ type: "parent" });
    const child = new Node({ type: "child" });

    parent.appendChild(child);
    parent.removeChild(child);

    expect(parent.children).toHaveLength(0);
    expect(child.parent).toBeNull();
  });

  it("should set data on a node", () => {
    const node = new Node({ type: "div", text: "Hello" });
    node.setData("text", "World");

    expect(node.data.text).toBe("World");
  });

  it("should serialize a node to JSON", () => {
    const parent = new Node({ type: "parent", id: "p1" });
    const child1 = new Node({ type: "child", id: "c1" });
    const child2 = new Node({ type: "child", id: "c2" });

    parent.appendChild(child1);
    parent.appendChild(child2);

    const json = parent.toJSON();

    expect(json).toEqual({
      type: "parent",
      id: "p1",
      children: [
        { type: "child", id: "c1" },
        { type: "child", id: "c2" },
      ],
    });
  });

  it("should insert a node before a reference node", () => {
    const parent = new Node({ type: "parent" });
    const child1 = new Node({ type: "child1" });
    const child2 = new Node({ type: "child2" });
    const child3 = new Node({ type: "child3" });

    parent.appendChild(child1);
    parent.appendChild(child3);
    parent.insertBefore(child2, child3);

    expect(parent.children).toEqual([child1, child2, child3]);
    expect(child2.parent).toBe(parent);
  });

  it("should insert a node at the end if reference node is null", () => {
    const parent = new Node({ type: "parent" });
    const child1 = new Node({ type: "child1" });
    const child2 = new Node({ type: "child2" });

    parent.appendChild(child1);
    parent.insertBefore(child2, null);

    expect(parent.children).toEqual([child1, child2]);
    expect(child2.parent).toBe(parent);
  });

  it("should replace a child node", () => {
    const parent = new Node({ type: "parent" });
    const oldChild = new Node({ type: "old" });
    const newChild = new Node({ type: "new" });

    parent.appendChild(oldChild);
    parent.replaceChild(newChild, oldChild);

    expect(parent.children).toHaveLength(1);
    expect(parent.children[0]).toBe(newChild);
    expect(newChild.parent).toBe(parent);
    expect(oldChild.parent).toBeNull();
  });

  it("should get previous and next siblings", () => {
    const parent = new Node({ type: "parent" });
    const child1 = new Node({ type: "child1" });
    const child2 = new Node({ type: "child2" });
    const child3 = new Node({ type: "child3" });

    parent.appendChild(child1);
    parent.appendChild(child2);
    parent.appendChild(child3);

    expect(child1.prev).toBeNull();
    expect(child1.next).toBe(child2);

    expect(child2.prev).toBe(child1);
    expect(child2.next).toBe(child3);

    expect(child3.prev).toBe(child2);
    expect(child3.next).toBeNull();
  });

  it("should get all siblings", () => {
    const parent = new Node({ type: "parent" });
    const child1 = new Node({ type: "child1" });
    const child2 = new Node({ type: "child2" });
    const child3 = new Node({ type: "child3" });

    parent.appendChild(child1);
    parent.appendChild(child2);
    parent.appendChild(child3);

    expect(child1.siblings).toEqual([child2, child3]);
    expect(child2.siblings).toEqual([child1, child3]);
    expect(child3.siblings).toEqual([child1, child2]);
  });

  it("should insert a node before the current node", () => {
    const parent = new Node({ type: "parent" });
    const child1 = new Node({ type: "child1" });
    const child2 = new Node({ type: "child2" });

    parent.appendChild(child2);
    child2.before(child1);

    expect(parent.children).toEqual([child1, child2]);
    expect(child1.parent).toBe(parent);
  });

  it("should insert a node after the current node", () => {
    const parent = new Node({ type: "parent" });
    const child1 = new Node({ type: "child1" });
    const child2 = new Node({ type: "child2" });

    parent.appendChild(child1);
    child1.after(child2);

    expect(parent.children).toEqual([child1, child2]);
    expect(child2.parent).toBe(parent);
  });

  it("should clone a node (shallow)", () => {
    const parent = new Node({ type: "parent", id: "p1" });
    const child = new Node({ type: "child", id: "c1" });
    parent.appendChild(child);

    const clonedParent = parent.clone();

    expect(clonedParent.data).toEqual(parent.data);
    expect(clonedParent.id).not.toBe(parent.id); // Should have a new ID
    expect(clonedParent.children).toHaveLength(0); // Shallow clone
    expect(clonedParent.parent).toBeNull();
  });

  it("should clone a node (deep)", () => {
    const parent = new Node({ type: "parent", id: "p1" });
    const child = new Node({ type: "child", id: "c1" });
    parent.appendChild(child);

    const clonedParent = parent.clone(true);

    expect(clonedParent.data).toEqual(parent.data);
    expect(clonedParent.id).not.toBe(parent.id); // Should have a new ID
    expect(clonedParent.children).toHaveLength(1); // Deep clone
    expect(clonedParent.children[0].data).toEqual(child.data);
    expect(clonedParent.children[0].id).not.toBe(child.id); // Should have a new ID
    expect(clonedParent.children[0].parent).toBe(clonedParent);
  });
});
