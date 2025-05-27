import type { Meta, StoryObj } from "@storybook/react";
import { useArgs } from "@storybook/preview-api";
import {
  FormBuilder,
  type FormBuilderNodeData as LocalFormBuilderNodeData,
} from "../";
import { parse, type BuilderNode, type BuilderNodeData } from "builder";
import { advancedRenderers } from "./advanced-form-renderers";

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
    const [{ value, document: doc }, updateArgs] = useArgs();

    const handleChange = (newValue: object) => {
      updateArgs({ value: newValue });
    };

    return (
      <FormBuilder
        {...args}
        value={value}
        document={doc as BuilderNode<LocalFormBuilderNodeData>}
        renderers={advancedRenderers} // Use advancedRenderers directly
        onChange={handleChange}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof FormBuilder>;

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
