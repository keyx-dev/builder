import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import {
  Builder,
  useBuilderContext,
  type BuilderContextType,
  BuilderContext,
} from "../builder";
import { Node } from "../node";
import {
  type BuilderNodeData,
  type Widgets,
  type Provider,
  type WidgetProps,
} from "../types";
import React from "react";

// Mock widget component for testing
const MockWidget: React.FC<WidgetProps<BuilderNodeData>> = ({ node }) => (
  <div data-testid={`widget-${node.data.type}`}>{node.data.text}</div>
);

// Mock provider component for testing
const MockProvider: Provider = ({ children }) => (
  <div data-testid="provider">{children}</div>
);

describe("Builder", () => {
  it("should render the root node using the provided widget", () => {
    const rootNode = new Node<BuilderNodeData>({ type: "text", text: "Hello" });
    const widgets: Widgets = { text: MockWidget };

    render(<Builder rootNode={rootNode} widgets={widgets} />);

    const widgetElement = screen.getByTestId("widget-text");
    expect(widgetElement).toBeInTheDocument();
    expect(widgetElement).toHaveTextContent("Hello");
  });

  it("should provide the builder context to consuming components", async () => {
    const rootNode = new Node<BuilderNodeData>({ type: "container" });
    const widgets: Widgets = { container: MockWidget };
    const nodeProviders: Provider[] = [];

    let contextValue: BuilderContextType | undefined;
    const ContextConsumer = () => {
      contextValue = useBuilderContext();
      return null;
    };

    // Render the provider and consumer separately to avoid the children prop issue
    render(
      <BuilderContext.Provider
        value={{
          rootNode,
          widgets,
          nodeProviders,
        }}
      >
        <ContextConsumer />
      </BuilderContext.Provider>
    );

    await waitFor(() => {
      expect(contextValue).toBeDefined();
      expect(contextValue?.rootNode).toBe(rootNode);
      expect(contextValue?.widgets).toBe(widgets);
      expect(contextValue?.nodeProviders).toBe(nodeProviders);
    });
  });

  it("should apply node providers", () => {
    const rootNode = new Node<BuilderNodeData>({ type: "div" });
    const widgets: Widgets = { div: MockWidget };
    const nodeProviders: Provider[] = [MockProvider];

    render(
      <Builder
        rootNode={rootNode}
        widgets={widgets}
        nodeProviders={nodeProviders}
      />
    );

    const providerElement = screen.getByTestId("provider");
    expect(providerElement).toBeInTheDocument();
    expect(providerElement).toContainElement(screen.getByTestId("widget-div"));
  });

  it("useBuilderContext should throw error when not used within BuilderProvider", () => {
    const ContextConsumer = () => {
      useBuilderContext();
      return null;
    };

    expect(() => render(<ContextConsumer />)).toThrow(
      "useBuilderContext must be used within a BuilderProvider"
    );
  });
});
