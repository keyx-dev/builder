import type { Meta, StoryObj } from "@storybook/react";
import { useArgs } from "@storybook/preview-api";
import {
  FormBuilder,
  type FormBuilderNodeData as LocalFormBuilderNodeData, // Alias to avoid conflict
} from "../";
import {
  parse,
  NodeRenderer,
  type BuilderNode,
  type RenderersMap,
  type BuilderNodeData, // Import BuilderNodeData for casting
} from "builder"; // Import from builder
import styles from "./index.module.css";

const meta: Meta<typeof FormBuilder> = {
  title: "FormBuilder",
  component: FormBuilder,
  argTypes: {
    value: { control: "object" },
    document: { control: "object" },
    liveValidate: { control: "boolean" },
    // widgets prop is removed, renderers is the new prop
    renderers: { control: "object" },
  },
  render: function Render(args) {
    const [{ value, document: doc, renderers: currentRenderers }, updateArgs] =
      useArgs(); // rename document to doc

    const handleChange = (newValue: object) => {
      updateArgs({ value: newValue });
    };

    return (
      <FormBuilder
        {...args}
        value={value}
        document={doc as BuilderNode<LocalFormBuilderNodeData>} // Cast to local type
        renderers={currentRenderers} // Pass renderers from args
        onChange={handleChange}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof FormBuilder>;

import type { FormFieldState } from "../types"; // Import FormFieldState

// Define renderers once to be reused
const defaultRenderers: RenderersMap = {
  form: ({ node, context: { core } }) => {
    return (
      <fieldset className={styles.fieldset}>
        <legend>{node.data.title}</legend>
        <div className={styles.fieldList}>
          {node.children &&
            node.children.map((n) => (
              <NodeRenderer
                key={n.id}
                node={n}
                renderers={core.renderers} // Pass renderers
                propInjectors={core.propInjectors} // Pass imported nodeProviders
              /> // Pass them down
            ))}
        </div>
      </fieldset>
    );
  },
  "text-field": ({ node, $formField }) => {
    // Removed unused r and p
    // Assuming $formField is injected by a propInjector in FormBuilder
    const fieldState = $formField as FormFieldState; // Use FormFieldState type
    return (
      <div className={styles.field}>
        <label htmlFor={node.id}>
          {node.data.label}
          {(node.data as LocalFormBuilderNodeData).validate?.required && ( // Cast to local type
            <span className={styles.alert}>*</span>
          )}
        </label>
        <input
          id={node.id}
          type={node.data.inputType || "text"}
          value={fieldState.value as string | number} // More specific type for value
          onChange={(e) => fieldState.setValue(e.target.value)}
        />
        {node.data.description && <span>{node.data.description}</span>}
        {fieldState.errors.length > 0 && (
          <span className={styles.alert}>{fieldState.errors.join(", ")}</span>
        )}
      </div>
    );
  },
};

const storyDocumentNode = parse({
  type: "form",
  title: "User Form",
  children: [
    {
      type: "text-field",
      label: "Name",
      dataPath: ".name",
      validate: { required: true, min: 2, type: "string" },
      description: "Your full name",
    } as BuilderNodeData, // Cast to BuilderNodeData from "builder" for parse function
    {
      type: "text-field",
      label: "Email",
      dataPath: ".email",
      inputType: "email",
      validate: { required: true, email: true, type: "string" },
    } as BuilderNodeData, // Cast to BuilderNodeData from "builder"
    {
      type: "text-field",
      label: "Age",
      dataPath: ".age",
      inputType: "number",
      validate: { required: true, min: 18, max: 99, type: "number" },
    } as BuilderNodeData, // Cast to BuilderNodeData from "builder"
  ],
}) as unknown as BuilderNode<LocalFormBuilderNodeData>; // Final cast to local type

export const Simple: Story = {
  args: {
    value: {
      name: "Cihad",
      email: "cihad@example.com",
      age: 38,
    },
    document: storyDocumentNode,
    renderers: defaultRenderers,
    liveValidate: true,
  },
};
