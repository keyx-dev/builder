import type { Meta, StoryObj } from "@storybook/react";
import { useArgs } from "@storybook/preview-api";
import {
  FormBuilder,
  type FormBuilderNodeData as LocalFormBuilderNodeData,
} from "../";
import {
  parse,
  NodeRenderer,
  type BuilderNode,
  type RenderersMap,
  type BuilderNodeData,
} from "builder";
import styles from "./advanced-form.module.css"; // Import the new CSS file
import React from "react";
import { FaLock, FaCheckCircle } from "react-icons/fa"; // Import icons

const meta: Meta<typeof FormBuilder> = {
  title: "FormBuilder/AdvancedForm",
  component: FormBuilder,
  argTypes: {
    value: { control: "object" },
    document: { control: "object" },
    liveValidate: { control: "boolean" },
    renderers: { control: "object" },
  },
  render: function Render(args) {
    const [{ value, document: doc, renderers: currentRenderers }, updateArgs] =
      useArgs();

    const handleChange = (newValue: object) => {
      updateArgs({ value: newValue });
    };

    return (
      <FormBuilder
        {...args}
        value={value}
        document={doc as BuilderNode<LocalFormBuilderNodeData>}
        renderers={currentRenderers}
        onChange={handleChange}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof FormBuilder>;

import type { FormFieldState } from "../types";
import type { PropInjector } from "builder"; // Import PropInjector as type-only

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

const advancedRenderers: RenderersMap = {
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

const advancedStoryDocumentNode = parse({
  type: "form",
  title: "Order Form",
  children: [
    {
      type: "text-field",
      label: "Email address",
      dataPath: ".email",
      inputType: "email",
      validate: { required: true, email: true, type: "string" },
    } as BuilderNodeData,
    {
      type: "fieldRow",
      children: [
        {
          type: "text-field",
          label: "First Name",
          dataPath: ".firstName",
          validate: { required: true, min: 2, type: "string" },
        } as BuilderNodeData,
        {
          type: "text-field",
          label: "Last Name",
          dataPath: ".lastName",
          validate: { required: true, min: 2, type: "string" },
        } as BuilderNodeData,
      ],
    } as BuilderNodeData,
    {
      type: "text-field",
      label: "Address",
      dataPath: ".address.street",
      validate: { required: true, type: "string" },
    } as BuilderNodeData,
    {
      type: "text-field",
      label: "Suite",
      dataPath: ".address.suite",
      validate: { type: "string" },
    } as BuilderNodeData,
    {
      type: "fieldRow",
      children: [
        {
          type: "text-field",
          label: "City",
          dataPath: ".address.city",
          validate: { required: true, type: "string" },
        } as BuilderNodeData,
        {
          type: "select-field",
          label: "State",
          dataPath: ".address.state",
          validate: { required: true, type: "string" },
          options: [
            { label: "Illinois", value: "IL" },
            { label: "California", value: "CA" },
            { label: "New York", value: "NY" },
          ],
        } as BuilderNodeData,
        {
          type: "text-field",
          label: "Zip",
          dataPath: ".address.zip",
          validate: { required: true, type: "string", min: 5, max: 5 },
        } as BuilderNodeData,
      ],
    } as BuilderNodeData,
    {
      type: "text-field",
      label: "Card Number",
      dataPath: ".payment.cardNumber",
      inputType: "text",
      validate: { required: true, type: "string", min: 16, max: 16 },
      description: "Encrypted and Secure",
    } as BuilderNodeData,
    {
      type: "fieldRow",
      children: [
        {
          type: "text-field",
          label: "Expiry Date",
          dataPath: ".payment.expiryDate",
          inputType: "text",
          validate: {
            required: true,
            type: "string",
            pattern: "^(0[1-9]|1[0-2])\\/([0-9]{2})$",
          },
        } as BuilderNodeData,
        {
          type: "text-field",
          label: "CVV",
          dataPath: ".payment.cvv",
          inputType: "number",
          validate: { required: true, type: "number", min: 100, max: 9999 },
        } as BuilderNodeData,
        {
          type: "text-field",
          label: "Billing Zip",
          dataPath: ".payment.billingZip",
          inputType: "text",
          validate: { required: true, type: "string", min: 5, max: 5 },
        } as BuilderNodeData,
      ],
    } as BuilderNodeData,
    {
      type: "checkbox-group",
      label: "What radio technologies are you using?",
      dataPath: ".radioTechnologies",
      options: [
        { label: "2G", value: "2G" },
        { label: "3G", value: "3G" },
        { label: "4G LTE", value: "4G_LTE" },
        { label: "CAT-M", value: "CAT-M" },
      ],
    } as BuilderNodeData,
    {
      type: "radio-group",
      label: "How much data do you expect to use each month?",
      dataPath: ".dataUsage",
      options: [
        { label: "0-50 MB", value: "0-50MB" },
        { label: "50-250 MB", value: "50-250MB" },
        { label: "250 MB-1 GB", value: "250MB-1GB" },
        { label: "1GB+", value: "1GB+" },
      ],
    } as BuilderNodeData,
    {
      type: "text-field",
      label: "Promo code",
      dataPath: ".promoCode",
      validate: { type: "string" },
    } as BuilderNodeData,
    {
      type: "checkbox",
      label: "Sign me up for annoying offers",
      dataPath: ".annoyingOffers",
    } as BuilderNodeData,
  ],
}) as unknown as BuilderNode<LocalFormBuilderNodeData>;

export const AdvancedForm: Story = {
  args: {
    value: {
      email: "sean@hologra",
      firstName: "Sean",
      lastName: "Nels",
      address: {
        street: "100 N. West Street",
        suite: "Suite 700",
        city: "Chicago",
        state: "IL", // Illinois için "IL"
        zip: "60602",
      },
      payment: {
        cardNumber: "1234567890123456",
        expiryDate: "12/22",
        cvv: 123,
        billingZip: "60602",
      },
      radioTechnologies: ["4G_LTE", "CAT-M"], // Resimdeki işaretli olanlar
      dataUsage: "250MB-1GB", // Resimdeki işaretli olan
      promoCode: "SIMS4YOU",
      annoyingOffers: false,
    },
    document: advancedStoryDocumentNode,
    renderers: advancedRenderers,
    liveValidate: true,
  },
};
