import type { BuilderNode } from "builder";
import { createContext } from "react";
import type { z } from "zod";
import type { FormBuilderNodeData as LocalFormBuilderNodeData } from "./types";

export interface IFormContext {
  data: object;
  setData: (
    node: BuilderNode<LocalFormBuilderNodeData>,
    fieldPath: string[],
    value: unknown
  ) => void;
  getErrors: (fieldPath: string[]) => string[];
  isDirty: (fieldPath: string[]) => boolean;
  formSchema?: z.AnyZodObject;
  arrayFieldIndices: Record<string, number>; // Tracks current index for array fields during rendering
  setArrayFieldIndex: (arrayPathKey: string, index: number) => void;
  clearArrayFieldIndex: (arrayPathKey: string) => void;
}

export const FormContext = createContext<IFormContext | null>(null);
