import { describe, it, expect } from "vitest";
import { parse } from "../parse";
import { Node } from "../node";

describe("parse", () => {
  it("should parse a valid JSON object into a Node tree", () => {
    const json = {
      type: "div",
      id: "d1",
      children: [
        { type: "span", id: "s1", text: "Hello" },
        { type: "span", id: "s2", text: "World" },
      ],
    };

    const node = parse(json);

    expect(node).toBeInstanceOf(Node);
    expect(node.data.type).toBe("div");
    expect(node.children).toHaveLength(2);

    const child1 = node.children[0];
    expect(child1).toBeInstanceOf(Node);
    expect(child1.data.type).toBe("span");
    expect(child1.data.text).toBe("Hello");
    expect(child1.parent).toBe(node);

    const child2 = node.children[1];
    expect(child2).toBeInstanceOf(Node);
    expect(child2.data.type).toBe("span");
    expect(child2.data.text).toBe("World");
    expect(child2.parent).toBe(node);
  });

  it("should throw an error for invalid JSON object (missing type)", () => {
    const json = {
      id: "d1",
      children: [],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => parse(json as any)).toThrow(
      "Invalid JSON object: 'type' property is missing or not a string."
    );
  });

  it("should throw an error for invalid JSON object (type not a string)", () => {
    const json = {
      type: 123,
      id: "d1",
      children: [],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => parse(json as any)).toThrow(
      "Invalid JSON object: 'type' property is missing or not a string."
    );
  });

  it("should handle empty children array", () => {
    const json = {
      type: "div",
      id: "d1",
      children: [],
    };

    const node = parse(json);

    expect(node).toBeInstanceOf(Node);
    expect(node.data.type).toBe("div");
    expect(node.children).toHaveLength(0);
  });

  it("should handle missing children property", () => {
    const json = {
      type: "div",
      id: "d1",
    };

    const node = parse(json);

    expect(node).toBeInstanceOf(Node);
    expect(node.data.type).toBe("div");
    expect(node.children).toHaveLength(0);
  });
});
