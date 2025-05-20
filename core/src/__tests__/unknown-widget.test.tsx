import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UnknownWidget } from "../unknown-widget";
import { Node } from "../node";
import { type BuilderNodeData } from "../types";

describe("UnknownWidget", () => {
  it("should render a details element with summary and pre", () => {
    const node = new Node<BuilderNodeData>({ type: "unknown", id: "u1" });
    render(<UnknownWidget node={node} />);

    const detailsElement = screen.getByRole("group");
    expect(detailsElement).toBeInTheDocument();

    const summaryElement = screen.getByText("Widget not found for:");
    expect(summaryElement).toBeInTheDocument();

    const preElement = screen.getByTestId("unknown-widget-pre");
    expect(preElement).toBeInTheDocument();
    expect(preElement).toHaveTextContent(
      /{\s*"type":\s*"unknown",\s*"id":\s*"u1"\s*}/
    );
  });
});
