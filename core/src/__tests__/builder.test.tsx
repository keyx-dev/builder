import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { Builder } from "../builder";
import { Node } from "../node";
import type { BuilderNodeData, RenderersMap } from "../types";
import { RecursiveNodeRenderer } from "../recursive-node-renderer";

// Mock renderers
const MockTextRenderer: React.FC<{ node: Node<BuilderNodeData> }> = ({
  node,
}) => <div>{node.data.text}</div>;
const MockContainerRenderer: React.FC<{
  node: Node<BuilderNodeData>;
  children?: React.ReactNode;
}> = ({ node, children }) => (
  <div data-testid={`container-${node.id}`}>{children}</div>
);

const mockRenderers: RenderersMap = {
  text: MockTextRenderer,
  container: MockContainerRenderer,
};

describe("Builder", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render null if rootNode is null", () => {
    const onNodeUpdate = vi.fn();
    render(
      <Builder
        rootNode={null}
        onNodeUpdate={onNodeUpdate}
        renderers={mockRenderers}
      />
    );
    expect(screen.queryByTestId("container-node-0")).toBeNull();
    expect(onNodeUpdate).not.toHaveBeenCalled();
  });

  it("should render the root node and its children", () => {
    const rootNode = new Node<BuilderNodeData>({ type: "container" });
    const textNode1 = new Node<BuilderNodeData>({
      type: "text",
      text: "Hello",
    });
    const textNode2 = new Node<BuilderNodeData>({
      type: "text",
      text: "World",
    });

    rootNode.appendChild(textNode1);
    rootNode.appendChild(textNode2);

    const onNodeUpdate = vi.fn();
    render(
      <Builder
        rootNode={rootNode}
        onNodeUpdate={onNodeUpdate}
        renderers={mockRenderers}
      />
    );

    expect(screen.getByTestId(`container-${rootNode.id}`)).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("World")).toBeInTheDocument();
  });

  it("should call onNodeUpdate when a node's data changes", () => {
    const rootNode = new Node<BuilderNodeData>({ type: "container" });
    const textNode = new Node<BuilderNodeData>({
      type: "text",
      text: "Initial",
    });
    rootNode.appendChild(textNode);

    const onNodeUpdate = vi.fn();
    render(
      <Builder
        rootNode={rootNode}
        onNodeUpdate={onNodeUpdate}
        renderers={mockRenderers}
      />
    );

    textNode.setData("text", "Updated");

    expect(onNodeUpdate).toHaveBeenCalledWith(
      textNode,
      "dataChanged",
      expect.objectContaining({
        type: "dataChanged",
        key: "text",
        value: "Updated",
      })
    );
  });

  it("should call onNodeUpdate when a descendant node changes (dataChanged)", () => {
    const rootNode = new Node<BuilderNodeData>({ type: "container" });
    const childNode = new Node<BuilderNodeData>({ type: "container" });
    const grandChildNode = new Node<BuilderNodeData>({
      type: "text",
      text: "Grandchild",
    });

    rootNode.appendChild(childNode);
    childNode.appendChild(grandChildNode);

    const onNodeUpdate = vi.fn();
    render(
      <Builder
        rootNode={rootNode}
        onNodeUpdate={onNodeUpdate}
        renderers={mockRenderers}
      />
    );

    grandChildNode.setData("text", "Updated Grandchild");

    expect(onNodeUpdate).toHaveBeenCalledWith(
      grandChildNode,
      "dataChanged",
      expect.objectContaining({
        type: "dataChanged",
        key: "text",
        value: "Updated Grandchild",
      })
    );
  });

  it("should call onNodeUpdate when a descendant node changes (appendChild)", () => {
    const rootNode = new Node<BuilderNodeData>({ type: "container" });
    const childNode = new Node<BuilderNodeData>({ type: "container" });
    rootNode.appendChild(childNode);

    const onNodeUpdate = vi.fn();
    render(
      <Builder
        rootNode={rootNode}
        onNodeUpdate={onNodeUpdate}
        renderers={mockRenderers}
      />
    );

    const newGrandChild = new Node<BuilderNodeData>({
      type: "text",
      text: "New Grandchild",
    });
    childNode.appendChild(newGrandChild);

    expect(onNodeUpdate).toHaveBeenCalledWith(
      childNode, // changedNode should be childNode, not newGrandChild
      "appendChild",
      expect.objectContaining({ type: "appendChild", child: newGrandChild })
    );
  });

  it("should pass global props to renderers", () => {
    const rootNode = new Node<BuilderNodeData>({
      type: "text",
      text: "Global Prop Test",
    });
    const onNodeUpdate = vi.fn();
    const globalProp = "testValue";

    const MockGlobalPropRenderer: React.FC<{
      node: Node<BuilderNodeData>;
      globalProp?: string;
    }> = ({ node, globalProp }) => (
      <div>
        {node.data.text} - {globalProp}
      </div>
    );

    const customRenderers: RenderersMap = {
      text: MockGlobalPropRenderer,
    };

    render(
      <Builder
        rootNode={rootNode}
        onNodeUpdate={onNodeUpdate}
        renderers={customRenderers}
        globalProp={globalProp}
      />
    );

    expect(
      screen.getByText(`Global Prop Test - ${globalProp}`)
    ).toBeInTheDocument();
  });

  it("should apply prop injectors", () => {
    const rootNode = new Node<BuilderNodeData>({
      type: "text",
      text: "Injected Prop Test",
    });
    const onNodeUpdate = vi.fn();

    const MockPropInjector: React.FC<{
      node: Node<BuilderNodeData>;
      children?: React.ReactNode;
      injectedProp?: string;
    }> = ({ children, injectedProp }) => (
      <div data-testid="injector-wrapper" data-injected-prop={injectedProp}>
        {children}
      </div>
    );

    const customRenderers: RenderersMap = {
      text: ({ node }) => <span>{node.data.text}</span>,
    };

    render(
      <Builder
        rootNode={rootNode}
        onNodeUpdate={onNodeUpdate}
        renderers={customRenderers}
        propInjectors={[MockPropInjector]}
        injectedProp="injectedValue"
      />
    );

    const injectorWrapper = screen.getByTestId("injector-wrapper");
    expect(injectorWrapper).toBeInTheDocument();
    expect(injectorWrapper).toHaveAttribute(
      "data-injected-prop",
      "injectedValue"
    );
    expect(screen.getByText("Injected Prop Test")).toBeInTheDocument();
  });
});

describe("RecursiveNodeRenderer", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render a known node type", () => {
    const node = new Node<BuilderNodeData>({
      type: "text",
      text: "Hello Renderer",
    });
    render(
      <RecursiveNodeRenderer
        node={node}
        renderers={mockRenderers}
        propInjectors={[]}
      />
    );
    expect(screen.getByText("Hello Renderer")).toBeInTheDocument();
  });

  it("should render children recursively", () => {
    const rootNode = new Node<BuilderNodeData>({ type: "container" });
    const textNode1 = new Node<BuilderNodeData>({
      type: "text",
      text: "Child 1",
    });
    const textNode2 = new Node<BuilderNodeData>({
      type: "text",
      text: "Child 2",
    });

    rootNode.appendChild(textNode1);
    rootNode.appendChild(textNode2);

    render(
      <RecursiveNodeRenderer
        node={rootNode}
        renderers={mockRenderers}
        propInjectors={[]}
      />
    );

    expect(screen.getByTestId(`container-${rootNode.id}`)).toBeInTheDocument();
    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
  });

  it("should display a warning for unknown node types", () => {
    const node = new Node<BuilderNodeData>({
      type: "unknownType",
      data: { foo: "bar" },
    });
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    render(
      <RecursiveNodeRenderer
        node={node}
        renderers={mockRenderers}
        propInjectors={[]}
      />
    );

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "No renderer found for type: unknownType"
    );
    expect(screen.getByText("Unknown type: unknownType")).toBeInTheDocument();
    expect(screen.getByText(/"foo": "bar"/)).toBeInTheDocument();
    consoleWarnSpy.mockRestore();
  });

  it("should pass global props to child renderers", () => {
    const rootNode = new Node<BuilderNodeData>({ type: "container" });
    const textNode = new Node<BuilderNodeData>({
      type: "text",
      text: "Child Text",
    });
    rootNode.appendChild(textNode);

    const globalProp = "globalValue";

    const MockGlobalPropRenderer: React.FC<{
      node: Node<BuilderNodeData>;
      globalProp?: string;
    }> = ({ node, globalProp }) => (
      <div>
        {node.data.text} - {globalProp}
      </div>
    );

    const customRenderers: RenderersMap = {
      container: MockContainerRenderer,
      text: MockGlobalPropRenderer,
    };

    render(
      <RecursiveNodeRenderer
        node={rootNode}
        renderers={customRenderers}
        propInjectors={[]}
        globalProp={globalProp}
      />
    );

    expect(screen.getByText(`Child Text - ${globalProp}`)).toBeInTheDocument();
  });

  it("should apply prop injectors to the rendered element", () => {
    const node = new Node<BuilderNodeData>({
      type: "text",
      text: "Injected Text",
    });

    const MockPropInjector: React.FC<{
      node: Node<BuilderNodeData>;
      children?: React.ReactNode;
      injectedProp?: string;
    }> = ({ children, injectedProp }) => (
      <div data-testid="injector-wrapper" data-injected-prop={injectedProp}>
        {children}
      </div>
    );

    const customRenderers: RenderersMap = {
      text: ({ node }) => <span>{node.data.text}</span>,
    };

    render(
      <RecursiveNodeRenderer
        node={node}
        renderers={customRenderers}
        propInjectors={[MockPropInjector]}
        injectedProp="injectedValue"
      />
    );

    const injectorWrapper = screen.getByTestId("injector-wrapper");
    expect(injectorWrapper).toBeInTheDocument();
    expect(injectorWrapper).toHaveAttribute(
      "data-injected-prop",
      "injectedValue"
    );
    expect(screen.getByText("Injected Text")).toBeInTheDocument();
  });
});
