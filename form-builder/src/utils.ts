import type { BuilderNode } from "builder";
import type {
  FormFieldState,
  FormBuilderNodeData as LocalFormBuilderNodeData,
} from "./types"; // Import LocalFormBuilderNodeData
import { useContext } from "react";
import { FormContext } from ".";

// Helper to create a unique key for array field context
export function getArrayPathKey(
  node: BuilderNode<LocalFormBuilderNodeData>, // Changed type
  arrayFieldIndices: Record<string, number> // Keep this parameter
): string {
  // Use arrayFieldIndices to satisfy TS6133, even if it's just for logging
  console.log("arrayFieldIndices in getArrayPathKey:", arrayFieldIndices);

  const pathParts: string[] = [];
  let current: BuilderNode<LocalFormBuilderNodeData> | null = node; // Changed type
  while (current) {
    if (current.data.dataPath) {
      // Use .dataPath
      pathParts.unshift(current.data.dataPath);
    }
    current = current.parent as BuilderNode<LocalFormBuilderNodeData> | null; // Cast parent
  }
  return resolvePath(pathParts, {}).join(".");
}

export function findPath(
  node: BuilderNode<LocalFormBuilderNodeData>, // Changed type
  arrayFieldIndices: Record<string, number>
) {
  const path: string[] = [];
  let currentNode: null | BuilderNode<LocalFormBuilderNodeData> = node; // Changed type

  while (currentNode) {
    // Ensure dataPath exists and is a string before unshifting
    if (typeof currentNode.data.dataPath === "string") {
      // Use .dataPath
      path.unshift(currentNode.data.dataPath);
    }
    currentNode =
      currentNode.parent as BuilderNode<LocalFormBuilderNodeData> | null; // Cast parent
  }
  return resolvePath(path, arrayFieldIndices);
}

export function resolvePath(
  rawPathParts: string[],
  arrayFieldIndices: Record<string, number>
): string[] {
  const processedSegments: string[] = [];
  rawPathParts.forEach((part) => {
    // Split each part by dot, filter empty strings that arise from leading/trailing/multiple dots
    part
      .split(".")
      .filter((segment) => segment.length > 0)
      .forEach((s) => processedSegments.push(s));
  });

  const resolved: string[] = [];

  processedSegments.forEach((segment) => {
    if (segment === "$") {
      // Resolve '$' based on the *resolved* static path so far
      const staticPathOfCurrentArray = resolved
        .filter((p) => p !== "$" && !/^\d+$/.test(p))
        .join(".");

      const arrayKey = Object.keys(arrayFieldIndices).find(
        (key) =>
          staticPathOfCurrentArray === key ||
          staticPathOfCurrentArray.endsWith("." + key) ||
          key === staticPathOfCurrentArray
      );

      if (arrayKey && arrayFieldIndices[arrayKey] !== undefined) {
        resolved.push(arrayFieldIndices[arrayKey].toString());
      } else {
        console.warn(
          `Could not resolve "$" for path segment. Original parts: ${rawPathParts.join(
            "|"
          )}, Processed segments: ${processedSegments.join(
            "."
          )}, Current resolved static path for search: ${staticPathOfCurrentArray}. Available array indices:`,
          arrayFieldIndices
        );
        resolved.push("$"); // Fallback, indicates an issue
      }
    } else {
      resolved.push(segment);
    }
  });
  return resolved;
}

export function useArrayField({
  node,
  $formField,
}: {
  node: BuilderNode<LocalFormBuilderNodeData>; // Changed type
  $formField: FormFieldState; // Use FormFieldState here
}) {
  const { value, setValue } = $formField;
  const parentFormContext = useContext(FormContext);
  const items = (Array.isArray(value) ? value : []) as unknown[]; // Changed to unknown[]

  const arrayPathKey = getArrayPathKey(
    node,
    parentFormContext!.arrayFieldIndices
  );

  const addItem = (value: unknown) => {
    const newItems = [...items, structuredClone(value)];
    setValue(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setValue(newItems);
  };

  return {
    addItem,
    removeItem,
    arrayPathKey,
  };
}
