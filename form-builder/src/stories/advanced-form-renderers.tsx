import React from "react";
import { NodeRenderer, type BuilderNode, type RenderersMap, type PropInjector } from "builder";
import type { FormBuilderNodeData as LocalFormBuilderNodeData } from "../";
import type { FormFieldState } from "../types";
import styles from "./advanced-form.module.css";
import { FaLock, FaCheckCircle } from "react-icons/fa";

interface CoreContext {
  renderers: RenderersMap;
  propInjectors: PropInjector[];
}

// Custom renderer for array items
const ArrayItemRenderer: React.FC<{
  node: BuilderNode;
  index: number;
  onRemove: (index: number) => void;
  core: CoreContext;
}> = ({ node, index, onRemove, core }) => {
  return (
    <div className={styles.arrayItem}>
      <h3>Education #{index + 1}</h3>
      {node.children &&
        node.children.map((n) => (
          <NodeRenderer
            key={n.id}
            node={n}
            renderers={core.renderers}
            propInjectors={core.propInjectors}
          />
        ))}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className={styles.button}
      >
        Remove Education
      </button>
    </div>
  );
};

export const advancedRenderers: RenderersMap = {
  form: ({ node, context: { core } }) => {
    return (
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{node.data.title}</legend>
        <div className={styles.fieldList}>
          {node.children &&
            node.children.map((n) => (
              <NodeRenderer
                key={n.id}
                node={n}
                renderers={core.renderers}
                propInjectors={core.propInjectors}
              />
            ))}
        </div>
      </fieldset>
    );
  },
  "text-field": ({ node, $formField }) => {
    const fieldState = $formField as FormFieldState;
    const hasError = fieldState.errors.length > 0;
    const isPaymentField = ["cardNumber", "expiryDate", "cvv"].includes(
      node.data.dataPath.split(".").pop()
    );
    const isPromoCodeField = node.data.dataPath === ".promoCode";

    return (
      <div className={styles.field}>
        <label htmlFor={node.id}>
          {node.data.label}
          {(node.data as LocalFormBuilderNodeData).validate?.required && (
            <span className={styles.requiredStar}>*</span>
          )}
        </label>
        <input
          id={node.id}
          type={node.data.inputType || "text"}
          value={fieldState.value as string | number}
          onChange={(e) => fieldState.setValue(e.target.value)}
          className={`${isPaymentField || isPromoCodeField ? styles.inputWithIcon : ""} ${hasError ? styles.error : ""}`}
        />
        {isPaymentField && <FaLock className={styles.icon} />}
        {isPromoCodeField && fieldState.value && (
          <FaCheckCircle className={styles.icon} />
        )}
        {node.data.description && (
          <span className={styles.description}>{node.data.description}</span>
        )}
        {hasError && (
          <span className={styles.alert}>{fieldState.errors.join(", ")}</span>
        )}
      </div>
    );
  },
  "select-field": ({ node, $formField }) => {
    const fieldState = $formField as FormFieldState;
    const hasError = fieldState.errors.length > 0;
    return (
      <div className={styles.field}>
        <label htmlFor={node.id}>
          {node.data.label}
          {(node.data as LocalFormBuilderNodeData).validate?.required && (
            <span className={styles.requiredStar}>*</span>
          )}
        </label>
        <select
          id={node.id}
          value={fieldState.value as string}
          onChange={(e) => fieldState.setValue(e.target.value)}
          className={hasError ? styles.error : ""}
        >
          {node.data.options.map((option: { label: string; value: string }) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {node.data.description && (
          <span className={styles.description}>{node.data.description}</span>
        )}
        {hasError && (
          <span className={styles.alert}>{fieldState.errors.join(", ")}</span>
        )}
      </div>
    );
  },
  "checkbox-group": ({ node, $formField }) => {
    const fieldState = $formField as FormFieldState;
    const selectedValues = (fieldState.value || []) as string[];
    const hasError = fieldState.errors.length > 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value: checkboxValue, checked } = e.target;
      if (checked) {
        fieldState.setValue([...selectedValues, checkboxValue]);
      } else {
        fieldState.setValue(selectedValues.filter((v) => v !== checkboxValue));
      }
    };

    return (
      <div className={styles.checkboxGroup}>
        <label>{node.data.label}</label>
        {node.data.options.map((option: { label: string; value: string }) => (
          <label key={option.value}>
            <input
              type="checkbox"
              value={option.value}
              checked={selectedValues.includes(option.value)}
              onChange={handleChange}
            />
            {option.label}
          </label>
        ))}
        {node.data.description && (
          <span className={styles.description}>{node.data.description}</span>
        )}
        {hasError && (
          <span className={styles.alert}>{fieldState.errors.join(", ")}</span>
        )}
      </div>
    );
  },
  "radio-group": ({ node, $formField }) => {
    const fieldState = $formField as FormFieldState;
    const selectedValue = fieldState.value as string;
    const hasError = fieldState.errors.length > 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      fieldState.setValue(e.target.value);
    };

    return (
      <div className={styles.radioGroup}>
        <label>{node.data.label}</label>
        {node.data.options.map((option: { label: string; value: string }) => (
          <label key={option.value}>
            <input
              type="radio"
              name={node.id} // Radio buttons should have the same name
              value={option.value}
              checked={selectedValue === option.value}
              onChange={handleChange}
            />
            {option.label}
          </label>
        ))}
        {node.data.description && (
          <span className={styles.description}>{node.data.description}</span>
        )}
        {hasError && (
          <span className={styles.alert}>{fieldState.errors.join(", ")}</span>
        )}
      </div>
    );
  },
  checkbox: ({ node, $formField }) => {
    const fieldState = $formField as FormFieldState;
    const isChecked = fieldState.value as boolean;
    const hasError = fieldState.errors.length > 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      fieldState.setValue(e.target.checked);
    };

    return (
      <div className={styles.checkboxField}>
        <input
          id={node.id}
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
        />
        <label htmlFor={node.id}>
          {node.data.label}
          {(node.data as LocalFormBuilderNodeData).validate?.required && (
            <span className={styles.requiredStar}>*</span>
          )}
        </label>
        {node.data.description && (
          <span className={styles.description}>{node.data.description}</span>
        )}
        {hasError && (
          <span className={styles.alert}>{fieldState.errors.join(", ")}</span>
        )}
      </div>
    );
  },
  "array-field": ({ node, $formField, context: { core } }) => {
    const fieldState = $formField as FormFieldState;
    const items = (fieldState.value || []) as Record<string, unknown>[];

    const handleAddItem = () => {
      const newItem = {};
      fieldState.setValue([...items, newItem]);
    };

    const handleRemoveItem = (indexToRemove: number) => {
      fieldState.setValue(items.filter((_, index) => index !== indexToRemove));
    };

    return (
      <div className={styles.arrayFieldContainer}>
        <h3>{node.data.label}</h3>
        {items.map((item, index) => {
          const clonedChildren = node.children?.map((child) => {
            const clonedChild = child.clone(true);
            clonedChild.setData(
              "dataPath",
              `${node.data.dataPath}[${index}]${child.data.dataPath}`
            );
            return clonedChild;
          });

          const itemNode = node.clone(false);
          itemNode.setData("dataPath", `${node.data.dataPath}[${index}]`);
          itemNode.children = clonedChildren || [];

          return (
            <ArrayItemRenderer
              key={index}
              node={itemNode}
              index={index}
              onRemove={handleRemoveItem}
              core={core}
            />
          );
        })}
        <button type="button" onClick={handleAddItem} className={styles.button}>
          {node.data.buttonLabel || "Add"}
        </button>
      </div>
    );
  },
  fieldRow: ({ node, context: { core } }) => {
    // New fieldRow renderer
    return (
      <div className={styles.fieldRow}>
        {node.children &&
          node.children.map((n) => (
            <NodeRenderer
              key={n.id}
              node={n}
              renderers={core.renderers}
              propInjectors={core.propInjectors}
            />
          ))}
      </div>
    );
  },
};
