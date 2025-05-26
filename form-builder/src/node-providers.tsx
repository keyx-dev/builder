import { Slot } from "@radix-ui/react-slot";
import type { PropInjector, BuilderNode } from "builder";
import React, { useContext } from "react"; // Import React
import { FormContext } from "./context";
import { findPath } from "./utils";
import { get } from "lodash";
import type {
  FormFieldState,
  FormBuilderNodeData as LocalFormBuilderNodeData,
} from "./types"; // Import LocalFormBuilderNodeData

export const nodeProviders: PropInjector[] = [
  ({
    node,
    children,
  }: {
    node: BuilderNode; // Changed to BuilderNode
    children: React.ReactNode;
  }) => {
    const formContext = useContext(FormContext);
    if (!formContext) {
      console.error("FormContext not found for node:", node);
      return children; // Render children directly if context is missing
    }

    const { data, setData, getErrors, isDirty, arrayFieldIndices } =
      formContext;
    const pathSegments = findPath(
      node as unknown as BuilderNode<LocalFormBuilderNodeData>,
      arrayFieldIndices
    ); // Cast node here

    const value = get(data, pathSegments);

    const handleSetValue = (newValue: unknown) => {
      setData(
        node as unknown as BuilderNode<LocalFormBuilderNodeData>,
        pathSegments,
        newValue
      ); // Cast node here
    };

    const errors = getErrors(pathSegments);
    const dirty = isDirty(pathSegments);

    const formField: FormFieldState = {
      data,
      value,
      setValue: handleSetValue,
      errors,
      isDirty: dirty,
    };

    return <Slot $formField={formField}>{children}</Slot>;
  },
];
