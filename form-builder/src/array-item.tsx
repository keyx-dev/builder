import { type ReactNode, useContext } from "react";
import { FormContext, type IFormContext } from ".";
import { type BuilderNode } from "builder";

interface ArrayItemProps {
  node: BuilderNode;
  arrayPathKey: string;
  index: number;
  children: ReactNode;
}

export function ArrayItem({
  node,
  arrayPathKey,
  index,
  children,
}: ArrayItemProps) {
  const parentFormContext = useContext(FormContext);

  const itemContextValue: IFormContext = {
    data: parentFormContext?.data || {}, // Ensure data is always an object
    setData: parentFormContext?.setData || (() => {}),
    getErrors: parentFormContext?.getErrors || (() => []),
    isDirty: parentFormContext?.isDirty || (() => false),
    formSchema: parentFormContext?.formSchema,
    setArrayFieldIndex: parentFormContext?.setArrayFieldIndex || (() => {}),
    clearArrayFieldIndex: parentFormContext?.clearArrayFieldIndex || (() => {}),
    arrayFieldIndices: {
      ...(parentFormContext?.arrayFieldIndices || {}),
      [arrayPathKey]: index,
    },
  };

  return (
    <FormContext.Provider
      key={`${node.id}-item-${index}`}
      value={itemContextValue}
    >
      {children}
    </FormContext.Provider>
  );
}
