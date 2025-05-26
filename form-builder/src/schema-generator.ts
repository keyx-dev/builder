/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { type BuilderNode } from "builder";
import type {
  FieldDataWithValidation,
  ValidateStringFieldData,
  ValidateNumberFieldData,
  ValidateArrayFieldData,
  FormBuilderNodeData as LocalFormBuilderNodeData, // Import LocalFormBuilderNodeData
} from "./types"; // Import the union type and specific types

const validationMessages = {
  required: "This field is required",
  email: "Invalid email address",
  regex: "Invalid format",
  minString: "Must be at least %min% characters",
  maxString: "Must be at most %max% characters",
  minNumber: "Must be at least %min%",
  maxNumber: "Must be at most %max%",
  minArray: "Must have at least %min% items",
  maxArray: "Must have at most %max% items",
  invalidEnumValue: "Invalid enum value",
};

function template(str: string, data: Record<string, string> = {}) {
  return str.replace(/%(\w+)%/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : match;
  });
}

function applyStringValidations(
  schema: z.ZodString,
  validate: ValidateStringFieldData,
  options?: { label: string; value: string }[]
): z.ZodTypeAny {
  let currentSchema = schema;
  if (validate?.required) {
    currentSchema = currentSchema.min(1, {
      message: validate["message:required"] || validationMessages.required,
    });
  }
  if (validate?.email) {
    currentSchema = currentSchema.email({
      message: validate["message:email"] || validationMessages.email,
    });
  }
  if (validate?.regex) {
    currentSchema = currentSchema.regex(new RegExp(validate.regex), {
      message: validate["message:regex"] || validationMessages.regex,
    });
  }
  if (validate?.enum) {
    let enumValues: string[] = [];
    if (validate.enum.fromOptions && options) {
      enumValues = options.map((opt) => opt.value);
    } else if (validate.enum.values) {
      enumValues = validate.enum.values;
    }
    if (enumValues.length > 0) {
      const [firstValue, ...restValues] = enumValues;
      if (firstValue === undefined) {
        // If enumValues is not empty but the first value is undefined,
        // it means something is wrong with the options/values.
        // In this case, no value should be considered valid.
        return z.never();
      }
      // Zod's enum requires at least one value in the tuple
      return z.enum([firstValue, ...restValues], {
        message:
          validate["message:enum"] || validationMessages.invalidEnumValue,
      });
    } else {
      // If enumValues is empty, no value should be considered valid.
      return z.never();
    }
  }
  // Apply min/max only if enum is not present
  if (validate?.min !== undefined) {
    currentSchema = currentSchema.min(validate.min, {
      message:
        validate["message:min"] ||
        template(validationMessages.minString, {
          min: validate.min.toString(),
        }),
    });
  }
  if (validate?.max !== undefined) {
    currentSchema = currentSchema.max(validate.max, {
      message:
        validate["message:max"] ||
        template(validationMessages.maxString, {
          max: validate.max.toString(),
        }),
    });
  }
  return currentSchema;
}

function applyNumberValidations(
  schema: z.ZodNumber,
  validate: ValidateNumberFieldData
): z.ZodNumber {
  let currentSchema = schema;
  if (validate?.min !== undefined) {
    currentSchema = currentSchema.min(validate.min, {
      message:
        validate["message:min"] ||
        template(validationMessages.minNumber, {
          min: validate.min.toString(),
        }),
    });
  }
  if (validate?.max !== undefined) {
    currentSchema = currentSchema.max(validate.max, {
      message:
        validate["message:max"] ||
        template(validationMessages.maxNumber, {
          max: validate.max.toString(),
        }),
    });
  }
  // Required for numbers is typically handled by min/max or nullable/optional
  return currentSchema;
}

function applyArrayValidations(
  schema: z.ZodArray<any>,
  validate: ValidateArrayFieldData
): z.ZodArray<any> {
  let currentSchema = schema;
  if (validate?.required) {
    currentSchema = currentSchema.min(1, {
      message: validate["message:required"] || validationMessages.required,
    });
  }
  if (validate?.min !== undefined) {
    currentSchema = currentSchema.min(validate.min, {
      message: template(validationMessages.minArray, {
        min: validate.min.toString(),
      }),
    });
  }
  if (validate?.max !== undefined) {
    currentSchema = currentSchema.max(validate.max, {
      message: template(validationMessages.maxArray, {
        max: validate.max.toString(),
      }),
    });
  }
  return currentSchema;
}

function createZodSchema(
  validate?: FieldDataWithValidation,
  options?: { label: string; value: string }[]
): z.ZodTypeAny {
  const dataType = validate?.type;

  switch (dataType) {
    case "string":
      // Check if validate is defined before passing it
      if (validate?.type === "string") {
        return applyStringValidations(z.string(), validate, options);
      }
      return z.string(); // Return a basic schema if validate is undefined or not string type
    case "number":
      // Check if validate is defined and is number type
      if (validate?.type === "number") {
        return applyNumberValidations(z.number(), validate);
      }
      return z.number(); // Return a basic schema if validate is undefined or not number type
    case "boolean":
      // Required for boolean is typically handled by nullable/optional
      // Check if validate is defined and is boolean type
      if (validate?.type === "boolean") {
        return z.boolean();
      }
      return z.boolean(); // Return a basic schema if validate is undefined or not boolean type
    case "date":
      // Required for date is typically handled by nullable/optional
      // Check if validate is defined and is date type
      if (validate?.type === "date") {
        return z.date();
      }
      return z.date(); // Return a basic schema if validate is undefined or not date type
    case "array":
      // Array validation for items is handled in generateFormSchema.
      // Here we apply validations to the array itself (min/max items, required).
      // Check if validate is defined and is array type
      if (validate?.type === "array") {
        return applyArrayValidations(z.array(z.any()), validate); // z.any() is a placeholder for item schema
      }
      return z.array(z.any()); // Return a basic schema if validate is undefined or not array type
    default:
      return z.any();
  }
}

export function generateSchemaForNode(
  node: BuilderNode<LocalFormBuilderNodeData>
): z.ZodTypeAny | null {
  const validateOptions = node.data.validate as
    | FieldDataWithValidation
    | undefined;
  const dataType = validateOptions?.type; // Get type from validate
  // const options = node.data.options as // Removed unused variable
  //   | { label: string; value: string }[]
  //   | undefined;

  if (!dataType) {
    if (
      node.data.type === "form" ||
      node.data.type === "section" ||
      node.data.type === "array-field"
    ) {
      // These types might not have a direct dataType but contain children that do.
      // For 'array-field', we'll build a schema for its children.
      // For 'form' and 'section', the schema is an object of its children's schemas.
      return null; // Handled by generateFormSchema
    }
    console.warn(
      `Node type ${node.data.type} with path ${node.data["dataPath"]} is missing validate.type. Skipping schema generation for this node.`
    );
    return null;
  }
  return createZodSchema(
    validateOptions,
    node.data.options as { label: string; value: string }[] | undefined
  ); // Pass the explicitly cast options
}

export function generateFormSchema(
  rootNode: BuilderNode<LocalFormBuilderNodeData>
): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  function buildShape(node: BuilderNode<LocalFormBuilderNodeData>) {
    // Removed currentPathParts as it was unused
    const dataPath = node.data["dataPath"] as string | undefined;

    if (dataPath) {
      // Remove leading dot and split
      const pathSegments = dataPath.replace(/^\./, "").split(".");

      const validateOptions = node.data.validate as
        | FieldDataWithValidation
        | undefined;
      const dataType = validateOptions?.type; // Get type from validate
      // const options = node.data.options as // Removed unused variable
      //   | { label: string; value: string }[]
      //   | undefined;

      if (dataType === "array") {
        if (node.children && node.children.length > 0) {
          const childShape: Record<string, z.ZodTypeAny> = {};
          // Assuming all children of an array-field define the structure of one array item
          node.children.forEach((childNode) => {
            const childDataPath = childNode.data["dataPath"] as
              | string
              | undefined;
            if (childDataPath) {
              // For children of array, path starts with '$'
              const childKey = childDataPath
                .replace(/^\.\$\./, "")
                .replace(/^\$\./, ""); // .$.recipient -> recipient, $.recipient -> recipient
              const childSchema = generateSchemaForNode(childNode);
              if (childSchema && childKey) {
                childShape[childKey] = childSchema;
              }
            }
          });
          if (Object.keys(childShape).length > 0) {
            let arraySchema = z.array(z.object(childShape));
            // validateOptions is already narrowed to ValidateArrayFieldData by the outer if (dataType === "array")
            if (validateOptions?.required) {
              arraySchema = arraySchema.min(1, {
                message:
                  validateOptions["message:required"] ||
                  validationMessages.required,
              });
            }
            if (validateOptions?.min !== undefined) {
              arraySchema = arraySchema.min(validateOptions.min, {
                message:
                  validateOptions["message:min"] ||
                  template(validationMessages.minArray, {
                    min: validateOptions.min.toString(),
                  }),
              });
            }
            if (validateOptions?.max !== undefined) {
              arraySchema = arraySchema.max(validateOptions.max, {
                message:
                  validateOptions["message:max"] ||
                  template(validationMessages.maxArray, {
                    max: validateOptions.max.toString(),
                  }),
              });
            }
            shape[pathSegments[pathSegments.length - 1]] = arraySchema;
          }
        } else {
          // Array field with no children definition, treat as array of any
          let baseArraySchema = z.array(z.any());
          // validateOptions is already narrowed to ValidateArrayFieldData by the outer if (dataType === "array")
          if (validateOptions?.required) {
            baseArraySchema = baseArraySchema.min(1, {
              message:
                validateOptions["message:required"] ||
                validationMessages.required,
            });
          }
          // Add min/max for array items if specified in validate
          if (validateOptions?.min !== undefined) {
            baseArraySchema = baseArraySchema.min(validateOptions.min, {
              message:
                validateOptions["message:min"] ||
                template(validationMessages.minArray, {
                  min: validateOptions.min.toString(),
                }),
            });
          }
          if (validateOptions?.max !== undefined) {
            baseArraySchema = baseArraySchema.max(validateOptions.max, {
              message:
                validateOptions["message:max"] ||
                template(validationMessages.maxArray, {
                  max: validateOptions.max.toString(),
                }),
            });
          }
          shape[pathSegments[pathSegments.length - 1]] = baseArraySchema;
        }
      } else {
        const fieldSchema = generateSchemaForNode(node);
        if (fieldSchema) {
          // For nested paths like "user.name", create nested objects in the schema
          let currentLevel = shape;
          for (let i = 0; i < pathSegments.length - 1; i++) {
            const segment = pathSegments[i];
            if (
              !currentLevel[segment] ||
              !(currentLevel[segment] instanceof z.ZodObject)
            ) {
              currentLevel[segment] = z.object({});
            }
            currentLevel = (currentLevel[segment] as z.ZodObject<any>).shape;
          }
          currentLevel[pathSegments[pathSegments.length - 1]] = fieldSchema;
        }
      }
    }

    // Recursively build shape for children, typically for 'form' or 'section'
    if (node.data.type === "form" || node.data.type === "section") {
      node.children?.forEach((child) => buildShape(child)); // Removed currentPathParts
    }
  }

  // Start building from the children of the root "form" node
  rootNode.children?.forEach((child) => buildShape(child)); // Removed empty array
  return z.object(shape);
}
