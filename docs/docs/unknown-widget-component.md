# Handling Unknown Node Types

The `@keyx/builder` library provides a built-in mechanism within the `RecursiveNodeRenderer` to handle cases where a node's `type` does not have a corresponding renderer registered in the `renderers` map. This ensures that the tree structure remains visible and debuggable even if some components are missing.

## How Unknown Types Are Handled

When `RecursiveNodeRenderer` encounters a `node.data.type` for which no `RendererComponent` is found in the provided `renderers` map:

1.  A warning message is logged to the console, indicating the missing renderer.
2.  A default `div` element is rendered as a fallback. This `div` has a distinct visual style (a red dashed border) to easily identify unrendered parts of the tree.
3.  The `node.data` is displayed within this fallback `div` in a pre-formatted JSON block, which is useful for debugging and understanding the structure of the unknown node.
4.  Crucially, the children of the unknown node are still recursively rendered. This means that even if a parent node's type is unknown, its valid children (if they have registered renderers) will still be displayed, preserving the overall layout and allowing for partial rendering.

## Example of Fallback Rendering

Consider a scenario where you have a node with `type: "custom-chart"`, but you haven't provided a renderer for it in your `renderers` map:

```json
{
  "type": "document",
  "children": [
    {
      "type": "paragraph",
      "textContent": "This is a known paragraph."
    },
    {
      "type": "custom-chart",
      "chartData": { "labels": ["A", "B"], "values": [10, 20] },
      "children": [
        {
          "type": "paragraph",
          "textContent": "This paragraph is a child of the unknown chart."
        }
      ]
    }
  ]
}
```

When rendered by the `Builder` component, the "custom-chart" node would appear similar to this in the DOM:

```html
<div style="border: 1px dashed red; padding: 10px; margin: 5px;">
  <strong>Unknown type: custom-chart</strong>
  <pre>
    {
      "type": "custom-chart",
      "chartData": {
        "labels": ["A", "B"],
        "values": [10, 20]
      }
    }
  </pre>
  <!-- The child paragraph will still be rendered here -->
  <p>This paragraph is a child of the unknown chart.</p>
</div>
```

This fallback mechanism helps developers quickly identify missing renderers and debug their node structures without the application crashing or displaying a completely blank screen.
