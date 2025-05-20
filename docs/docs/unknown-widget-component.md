# UnknownWidget Component

The `UnknownWidget` component is a fallback component used to render nodes with types that do not have a registered renderer. It helps in visualizing the structure even if a specific widget is not available.

## Usage

This component is typically used internally by `NodeRenderer` when a specific renderer is not found. You usually don't need to use it directly.

```typescript
import { UnknownWidget } from '@keyx/builder';

function RenderUnknown({ node }) {
  return (
    <UnknownWidget node={node} />
  );
}
```

## Props

(Add details about the props accepted by the UnknownWidget component, e.g., `node`)
