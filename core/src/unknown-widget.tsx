import type { BaseWidgetProps } from "./types";

export function UnknownWidget({ node }: BaseWidgetProps) {
  return (
    <details
      style={{
        color: "darkred",
        border: "1px solid darkred",
        padding: ".5rem",
        borderRadius: ".5rem",
        fontSize: ".8rem",
      }}
    >
      <summary>Widget not found for:</summary>
      <pre style={{ marginBlock: ".5rem" }} data-testid="unknown-widget-pre">
        {JSON.stringify(node.toJSON(), null, 2)}
      </pre>
    </details>
  );
}
