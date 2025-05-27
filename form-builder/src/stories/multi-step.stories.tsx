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
import styles from "./advanced-form.module.css"; // Reusing the advanced-form styles
import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa"; // For step completion icons
import type { FormFieldState } from "../types"; // Import FormFieldState
import { advancedRenderers } from "./advanced-form-renderers"; // Import advancedRenderers from new file

const meta: Meta<typeof FormBuilder> = {
  title: "FormBuilder/MultiStepForm",
  component: FormBuilder,
  argTypes: {
    value: { control: "object" },
    document: { control: "object" },
    liveValidate: { control: "boolean" },
    renderers: { control: "object" },
  },
  render: function Render(args: StoryObj<typeof FormBuilder>["args"]) {
    const [{ value }, updateArgs] = useArgs();
    const [currentStep, setCurrentStep] = useState(0); // State to manage current step

    const handleChange = (newValue: object) => {
      updateArgs({ value: newValue });
    };

    const handleNext = () => {
      setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
      setCurrentStep((prev) => prev - 1);
    };

    // Define steps and their corresponding form sections
    const steps = React.useMemo(
      () => [
        {
          title: "Job location",
          document: parse({
            type: "form",
            title: "Job location",
            children: [
              {
                type: "text-field",
                label: "Location",
                dataPath: ".jobLocation.location",
                validate: { required: true, type: "string" },
                description: "city, area...",
              } as BuilderNodeData,
              {
                type: "fieldRow",
                children: [
                  {
                    type: "button",
                    label: "Manchester",
                    dataPath: ".jobLocation.suggestions.manchester",
                  } as BuilderNodeData,
                  {
                    type: "button",
                    label: "Liverpool",
                    dataPath: ".jobLocation.suggestions.liverpool",
                  } as BuilderNodeData,
                  {
                    type: "button",
                    label: "Leeds",
                    dataPath: ".jobLocation.suggestions.leeds",
                  } as BuilderNodeData,
                  {
                    type: "button",
                    label: "London",
                    dataPath: ".jobLocation.suggestions.london",
                  } as BuilderNodeData,
                  {
                    type: "button",
                    label: "Newcastle",
                    dataPath: ".jobLocation.suggestions.newcastle",
                  } as BuilderNodeData,
                ],
              } as BuilderNodeData,
            ],
          }) as unknown as BuilderNode<LocalFormBuilderNodeData>,
        },
        {
          title: "Job position",
          document: parse({
            type: "form",
            title: "Job position",
            children: [
              {
                type: "text-field",
                label: "Roles",
                dataPath: ".jobPosition.roles",
                validate: { required: true, type: "string" },
                description: "job title, position",
              } as BuilderNodeData,
              {
                type: "radio-group",
                label: "Suggestions",
                dataPath: ".jobPosition.suggestions",
                options: [
                  {
                    label: "360 Operator",
                    value: "360_operator",
                    description:
                      "Operate and maintain 360 excavator for construction projects.",
                    hourlyRate: "from £30 per hour",
                  },
                  {
                    label: "Site Manager",
                    value: "site_manager",
                    description:
                      "Manage project plans, budgets, and schedules throughout project lifecycle.",
                    hourlyRate: "from £32 per hour",
                  },
                  {
                    label: "Project Manager",
                    value: "project_manager",
                    description:
                      "Manage construction projects & ensure adherence to plans.",
                    hourlyRate: "from £42 per hour",
                  },
                  {
                    label: "Steel Fixer",
                    value: "steel_fixer",
                    description:
                      "Install steel reinforcement bars in concrete structures.",
                    hourlyRate: "from £22 per hour",
                  },
                ],
              } as BuilderNodeData,
            ],
          }) as unknown as BuilderNode<LocalFormBuilderNodeData>,
        },
        {
          title: "Personal details",
          document: parse({
            type: "form",
            title: "Personal details",
            children: [
              {
                type: "text-field",
                label: "Name",
                dataPath: ".personalDetails.name",
                validate: { required: true, type: "string" },
                description: "e.g. John Smith",
              } as BuilderNodeData,
              {
                type: "text-field",
                label: "Phone",
                dataPath: ".personalDetails.phone",
                inputType: "tel",
                validate: {
                  required: true,
                  type: "string",
                  pattern: "^[0-9]{10,15}$",
                },
                description: "e.g. 07991123456",
              } as BuilderNodeData,
              {
                type: "file-upload",
                label: "Certification (optional)",
                dataPath: ".personalDetails.certification",
              } as BuilderNodeData,
            ],
          }) as unknown as BuilderNode<LocalFormBuilderNodeData>,
        },
        {
          title: "Application Received",
          document: parse({
            type: "form",
            title: "Application Received",
            children: [
              {
                type: "success-message",
                label: "We've received your application!",
                description:
                  "We will process it and reach out to you in a days.",
              } as BuilderNodeData,
            ],
          }) as unknown as BuilderNode<LocalFormBuilderNodeData>,
        },
      ],
      []
    );

    const currentDocument = steps[currentStep].document;

    // Custom renderers for multi-step form
    const multiStepRenderers: RenderersMap = {
      ...advancedRenderers, // Inherit existing renderers from advancedForm
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
            <div className={styles.buttonContainer}>
              {currentStep > 0 && currentStep < steps.length - 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className={styles.button}
                >
                  Back
                </button>
              )}
              {currentStep < steps.length - 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className={styles.button}
                >
                  Next
                </button>
              )}
              {currentStep === steps.length - 1 && (
                <button type="submit" className={styles.placeOrderButton}>
                  Submit Application
                </button>
              )}
            </div>
          </fieldset>
        );
      },
      button: ({ node }) => {
        const handleClick = () => {
          if (node.data.dataPath.includes(".jobLocation.suggestions")) {
            const currentLocations = (
              (value as { jobLocation?: { location?: string } })?.jobLocation
                ?.location || ""
            )
              .split(", ")
              .filter(Boolean);
            const newLocation = node.data.label;
            if (!currentLocations.includes(newLocation)) {
              updateArgs({
                value: {
                  ...value,
                  jobLocation: {
                    ...((value as { jobLocation?: object })?.jobLocation || {}),
                    location: [...currentLocations, newLocation].join(", "),
                  },
                },
              });
            }
          } else if (node.data.dataPath.includes(".jobPosition.suggestions")) {
            // For job position suggestions, it's a radio group, so we'll handle it in radio-group renderer
          }
        };

        return (
          <button type="button" onClick={handleClick} className={styles.button}>
            {node.data.label}
          </button>
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
            {node.data.options.map(
              (option: {
                label: string;
                value: string;
                description?: string;
                hourlyRate?: string;
              }) => (
                <label key={option.value} className={styles.radioOption}>
                  <input
                    type="radio"
                    name={node.id}
                    value={option.value}
                    checked={selectedValue === option.value}
                    onChange={handleChange}
                  />
                  <div>
                    <strong>{option.label}</strong>
                    {option.description && <p>{option.description}</p>}
                    {option.hourlyRate && (
                      <span className={styles.hourlyRate}>
                        {option.hourlyRate}
                      </span>
                    )}
                  </div>
                </label>
              )
            )}
            {node.data.description && (
              <span className={styles.description}>
                {node.data.description}
              </span>
            )}
            {hasError && (
              <span className={styles.alert}>
                {fieldState.errors.join(", ")}
              </span>
            )}
          </div>
        );
      },
      "file-upload": ({ node, $formField }) => {
        const fieldState = $formField as FormFieldState;
        const hasError = fieldState.errors.length > 0;

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files && e.target.files.length > 0) {
            fieldState.setValue(e.target.files[0].name); // Store file name or actual file object
          }
        };

        return (
          <div className={`${styles.field} ${styles.fileUploadField}`}>
            <label htmlFor={node.id}>
              {node.data.label}
              {(node.data as LocalFormBuilderNodeData).validate?.required && (
                <span className={styles.requiredStar}>*</span>
              )}
            </label>
            <div className={styles.fileUploadBox}>
              <input
                id={node.id}
                type="file"
                onChange={handleFileChange}
                className={styles.hiddenInput}
              />
              <label htmlFor={node.id} className={styles.fileUploadLabel}>
                <div className={styles.uploadIcon}>
                  {/* SVG icon for upload */}
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 16V8M12 8L15 11M12 8L9 11"
                      stroke="#6A38ED"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 15C3 17.8284 3 19.2426 3.87868 20.1213C4.75736 21 6.17157 21 9 21H15C17.8284 21 19.2426 21 20.1213 20.1213C21 19.2426 21 17.8284 21 15"
                      stroke="#6A38ED"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                Click to upload or drag and drop
              </label>
              {fieldState.value && (
                <span className={styles.fileName}>
                  {fieldState.value as string}
                </span>
              )}
            </div>
            {node.data.description && (
              <span className={styles.description}>
                {node.data.description}
              </span>
            )}
            {hasError && (
              <span className={styles.alert}>
                {fieldState.errors.join(", ")}
              </span>
            )}
          </div>
        );
      },
      "success-message": ({ node }) => {
        return (
          <div className={styles.successMessageContainer}>
            <div className={styles.successIcon}>
              {/* Thumbs up icon */}
              <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M25 50C25 52.7614 22.7614 55 20 55C17.2386 55 15 52.7614 15 50C15 47.2386 17.2386 45 20 45C22.7614 45 25 47.2386 25 50Z"
                  fill="#6A38ED"
                />
                <path
                  d="M45 50C45 52.7614 42.7614 55 40 55C37.2386 55 35 52.7614 35 50C35 47.2386 37.2386 45 40 45C42.7614 45 45 47.2386 45 50Z"
                  fill="#6A38ED"
                />
                <path
                  d="M55 25C55 27.7614 52.7614 30 50 30C47.2386 30 45 27.7614 45 25C45 22.2386 47.2386 20 50 20C52.7614 20 55 22.2386 55 25Z"
                  fill="#6A38ED"
                />
                <path
                  d="M5 25C5 27.7614 2.76142 30 0 30C-2.76142 30 -5 27.7614 -5 25C-5 22.2386 -2.76142 20 0 20C2.76142 20 5 22.2386 5 25Z"
                  fill="#6A38ED"
                />
                <path
                  d="M30 0C32.7614 0 35 2.23858 35 5C35 7.76142 32.7614 10 30 10C27.2386 10 25 7.76142 25 5C25 2.23858 27.2386 0 30 0Z"
                  fill="#6A38ED"
                />
                <path
                  d="M30 60C32.7614 60 35 62.2386 35 65C35 67.7614 32.7614 70 30 70C27.2386 70 25 67.7614 25 65C25 62.2386 27.2386 60 30 60Z"
                  fill="#6A38ED"
                />
                <path
                  d="M50 10C52.7614 10 55 12.2386 55 15C55 17.7614 52.7614 20 50 20C47.2386 20 45 17.7614 45 15C45 12.2386 47.2386 10 50 10Z"
                  fill="#6A38ED"
                />
                <path
                  d="M10 10C12.7614 10 15 12.2386 15 15C15 17.7614 12.7614 20 10 20C7.23858 20 5 17.7614 5 15C5 12.2386 7.23858 10 10 10Z"
                  fill="#6A38ED"
                />
                <path
                  d="M50 40C52.7614 40 55 42.2386 55 45C55 47.7614 52.7614 50 50 50C47.2386 50 45 47.2386 45 45C45 42.2386 47.2386 40 50 40Z"
                  fill="#6A38ED"
                />
                <path
                  d="M10 40C12.7614 40 15 42.2386 15 45C15 47.7614 12.7614 50 10 50C7.23858 50 5 47.2386 5 45C5 42.2386 7.23858 40 10 40Z"
                  fill="#6A38ED"
                />
                <path
                  d="M30 20C32.7614 20 35 22.2386 35 25C35 27.7614 32.7614 30 30 30C27.2386 30 25 27.7614 25 25C25 22.2386 27.2386 20 30 20Z"
                  fill="#6A38ED"
                />
                <path
                  d="M30 30C32.7614 30 35 32.2386 35 35C35 37.7614 32.7614 40 30 40C27.2386 40 25 37.7614 25 35C25 32.2386 27.2386 30 30 30Z"
                  fill="#6A38ED"
                />
                <path
                  d="M30 40C32.7614 40 35 42.2386 35 45C35 47.7614 32.7614 50 30 50C27.2386 50 25 47.2386 25 45C25 42.2386 27.2386 40 30 40Z"
                  fill="#6A38ED"
                />
                <path
                  d="M30 50C32.7614 50 35 52.2386 35 55C35 57.7614 32.7614 60 30 60C27.2386 60 25 57.7614 25 55C25 52.2386 27.2386 50 30 50Z"
                  fill="#6A38ED"
                />
                <path
                  d="M20 30C22.7614 30 25 32.2386 25 35C25 37.7614 22.7614 40 20 40C17.2386 40 15 37.7614 15 35C15 32.2386 17.2386 30 20 30Z"
                  fill="#6A38ED"
                />
                <path
                  d="M40 30C42.7614 30 45 32.2386 45 35C45 37.7614 42.7614 40 40 40C37.2386 40 35 37.7614 35 35C35 32.2386 37.2386 30 40 30Z"
                  fill="#6A38ED"
                />
                <path
                  d="M20 20C22.7614 20 25 22.2386 25 25C25 27.7614 22.7614 30 20 30C17.2386 30 15 27.7614 15 25C15 22.2386 17.2386 20 20 20Z"
                  fill="#6A38ED"
                />
                <path
                  d="M40 20C42.7614 20 45 22.2386 45 25C45 27.7614 42.7614 30 40 30C37.2386 30 35 27.7614 35 25C35 22.2386 37.2386 20 40 20Z"
                  fill="#6A38ED"
                />
              </svg>
            </div>
            <h2>{node.data.label}</h2>
            <p>{node.data.description}</p>
          </div>
        );
      },
    };

    return (
      <div>
        <div className={styles.multiStepHeader}>
          {steps.map((step, index) => (
            <div
              key={index}
              className={`${styles.step} ${index === currentStep ? styles.activeStep : ""} ${index < currentStep ? styles.completedStep : ""}`}
              onClick={() => {
                if (index < currentStep) {
                  setCurrentStep(index);
                }
              }}
              style={{ cursor: index < currentStep ? "pointer" : "default" }}
            >
              {index < currentStep ? (
                <FaCheckCircle className={styles.completedIcon} />
              ) : (
                <span className={styles.stepNumber}>{index + 1}</span>
              )}
              <span className={styles.stepTitle}>{step.title}</span>
            </div>
          ))}
        </div>
        <FormBuilder
          {...args}
          value={value}
          document={currentDocument}
          renderers={multiStepRenderers}
          onChange={handleChange}
        />
      </div>
    );
  },
};

export default meta;

type Story = StoryObj<typeof FormBuilder>;

export const MultiStepForm: Story = {
  args: {
    value: {
      jobLocation: {
        location: "",
      },
      jobPosition: {
        roles: "",
        suggestions: "",
      },
      personalDetails: {
        name: "",
        phone: "",
        certification: "",
      },
    },
    renderers: {}, // Will be overridden by multiStepRenderers in render function
    liveValidate: true,
  },
};
