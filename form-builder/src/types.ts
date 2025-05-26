import { type BuilderNodeData } from "builder";
import { z } from "zod"; // Zod'u import et

export interface FormFieldState {
  data: object;
  value: unknown;
  setValue: (value: unknown) => void;
  errors: string[];
  isDirty: boolean;
}

export interface FormBuilderNodeProviderProps {
  $formField?: FormFieldState;
}

export interface ValidateStringFieldData {
  type: "string";
  required?: boolean;
  "message:required"?: string;
  email?: boolean;
  "message:email"?: string;
  regex?: string;
  "message:regex"?: string;
  min?: number;
  "message:min"?: string;
  max?: number;
  "message:max"?: string;
  enum?: { fromOptions?: boolean; values?: string[] };
  "message:enum"?: string;
}

export interface ValidateNumberFieldData {
  type: "number";
  required?: boolean;
  min?: number;
  "message:min"?: string;
  max?: number;
  "message:max"?: string;
}

export interface ValidateBooleanFieldData {
  type: "boolean";
  required?: boolean;
}

export interface ValidateDateFieldData {
  type: "date";
  required?: boolean;
}

export interface ValidateArrayFieldData {
  type: "array";
  required?: boolean;
  "message:required"?: string;
  min?: number; // Minimum number of items
  "message:min"?: string;
  max?: number; // Maximum number of items
  "message:max"?: string;
}

// Union type for all possible field data with validation
export type FieldDataWithValidation =
  | ValidateStringFieldData
  | ValidateNumberFieldData
  | ValidateBooleanFieldData
  | ValidateDateFieldData
  | ValidateArrayFieldData;

export interface FormBuilderNodeData extends BuilderNodeData {
  dataPath?: string; // Make dataPath optional
  props?: Record<string, unknown>; // Add props
  schema?: z.ZodTypeAny; // Add schema
}
