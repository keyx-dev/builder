import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Builder,
  type BuilderNode,
  type RenderersMap,
  type BuilderNodeData,
  type ChangeType,
  type ChangeDetails,
} from "builder";
import { set, cloneDeep } from "lodash";
import { z } from "zod";
import type { FormBuilderNodeData as LocalFormBuilderNodeData } from "./types"; // Alias to avoid conflict
import { generateFormSchema } from "./schema-generator";
import { FormContext, type IFormContext } from "./context";
import { nodeProviders } from "./node-providers";

interface FormBuilderProps {
  value: object;
  onChange: (
    value: object,
    isValid: boolean,
    errors?: Record<string, string[]>
  ) => void;
  document: BuilderNode<LocalFormBuilderNodeData>; // Use aliased local type
  renderers?: RenderersMap; // Changed from widgets to renderers
  initialDirtyFields?: Record<string, boolean>;
  liveValidate?: boolean;
  children?: React.ReactNode; // Add children prop
}

export function FormBuilder({
  value,
  onChange,
  document,
  renderers = {}, // Changed from widgets to renderers
  initialDirtyFields = {},
  liveValidate = true,
}: FormBuilderProps) {
  const [formSchema, setFormSchema] = useState<z.AnyZodObject | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({}); // path string -> errors
  const [dirtyFields, setDirtyFields] =
    useState<Record<string, boolean>>(initialDirtyFields);
  const [arrayFieldIndices, setArrayFieldIndices] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (document) {
      try {
        const schema = generateFormSchema(document);
        setFormSchema(schema);
        // Optionally, validate initial value
        // validateAll(value, schema);
      } catch (error) {
        console.error("Error generating form schema:", error);
        setFormSchema(undefined);
      }
    }
  }, [document]);

  const handleNodeUpdate = useCallback(
    (
      changedNode: BuilderNode<BuilderNodeData>, // This BuilderNodeData is from "builder"
      type: ChangeType,
      details?: ChangeDetails<BuilderNodeData> // This BuilderNodeData is from "builder"
    ) => {
      // TODO: Implement more specific logic based on node updates if necessary
      console.log("Node updated in FormBuilder:", changedNode, type, details);
      // For now, a simple re-validation or data handling might be triggered here
      // For example, if a node is removed, its data might need to be cleared from the form value
    },
    []
  );

  const handleSetData = useCallback(
    (
      node: BuilderNode<LocalFormBuilderNodeData>, // Use aliased local type
      fieldPath: string[],
      newValue: unknown
    ) => {
      // Use the 'node' parameter to satisfy TS6133
      console.log("Setting data for node:", node.id);

      const newData = cloneDeep(value);
      set(newData, fieldPath, newValue);

      const pathString = fieldPath.join(".");
      setDirtyFields((prev) => ({ ...prev, [pathString]: true }));

      let isValidOverall = true;
      const currentAllFieldErrors: Record<string, string[]> = {};

      if (liveValidate && formSchema) {
        const validationAttempt = formSchema.safeParse(newData);
        if (!validationAttempt.success) {
          isValidOverall = false;
          validationAttempt.error.errors.forEach((issue) => {
            const pk = issue.path.join(".");
            if (!currentAllFieldErrors[pk]) currentAllFieldErrors[pk] = [];
            currentAllFieldErrors[pk].push(issue.message);
          });
        }
        // Update fieldErrors state based on the full validation result
        setFieldErrors(currentAllFieldErrors);
      }
      // Pass the latest computed errors and validity to onChange
      onChange(newData, isValidOverall, currentAllFieldErrors);
    },
    // Dependencies: value and formSchema are key. onChange, liveValidate are stable.
    // validateField is removed as direct dependency, its logic is somewhat integrated or covered by full parse.
    [value, onChange, formSchema, liveValidate]
  );

  const getFieldErrors = useCallback(
    (fieldPath: string[]) => {
      return fieldErrors[fieldPath.join(".")] || [];
    },
    [fieldErrors]
  );

  const isFieldDirty = useCallback(
    (fieldPath: string[]) => {
      return !!dirtyFields[fieldPath.join(".")];
    },
    [dirtyFields]
  );

  const setArrayIndex = useCallback((arrayPathKey: string, index: number) => {
    setArrayFieldIndices((prev) => ({ ...prev, [arrayPathKey]: index }));
  }, []);

  const clearArrayIndex = useCallback((arrayPathKey: string) => {
    setArrayFieldIndices((prev) => {
      const newIndices = { ...prev };
      delete newIndices[arrayPathKey];
      return newIndices;
    });
  }, []);

  const contextValue = useMemo<IFormContext>(
    () => ({
      data: value,
      setData: handleSetData,
      getErrors: getFieldErrors,
      isDirty: isFieldDirty,
      formSchema,
      arrayFieldIndices,
      setArrayFieldIndex: setArrayIndex,
      clearArrayFieldIndex: clearArrayIndex,
    }),
    [
      value,
      handleSetData,
      getFieldErrors,
      isFieldDirty,
      formSchema,
      arrayFieldIndices,
      setArrayIndex,
      clearArrayIndex,
    ]
  );

  return (
    <FormContext.Provider value={contextValue}>
      <Builder
        rootNode={document}
        renderers={renderers} // Use the renamed prop
        propInjectors={nodeProviders}
        onNodeUpdate={handleNodeUpdate}
      />
    </FormContext.Provider>
  );
}
