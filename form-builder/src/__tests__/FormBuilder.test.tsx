import { render, screen, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FormBuilder } from "../form-builder";
import { Node } from "builder";
import type { BuilderNode, BuilderNodeData } from "builder";
import type { FormBuilderNodeData } from "../types";
import { z } from "zod";
import { FormContext, type IFormContext } from "../context";
import { useContext } from "react";

// Mock Builder bileşeni
vi.mock("builder", async (importOriginal) => {
  const actual = await importOriginal<typeof import("builder")>();
  return {
    ...actual,
    Builder: vi.fn(({ rootNode }) => {
      return (
        <div data-testid="mock-builder">
          Mock Builder Rendered for: {rootNode.id}
          {/* FormContext'in değerlerini test etmek için bir yardımcı bileşen */}
          <FormContext.Consumer>
            {(context) => (
              <div
                data-testid="form-context-values"
                data-context-data={JSON.stringify(context!.data)}
                data-context-errors={JSON.stringify(
                  context!.getErrors(["email"])
                )}
                data-context-dirty={JSON.stringify(context!.isDirty(["name"]))}
              >
                {/* Context değerlerini burada kullanabiliriz */}
              </div>
            )}
          </FormContext.Consumer>
        </div>
      );
    }),
  };
});

// Mock generateFormSchema fonksiyonu
vi.mock("../schema-generator", () => ({
  generateFormSchema: vi.fn((document: BuilderNode) => {
    // Basit bir şema döndür
    return z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
      items: z.array(z.string()).optional(), // Array testleri için eklendi
    });
  }),
}));

describe("FormBuilder", () => {
  const mockDocumentData: BuilderNodeData = {
    type: "FormData",
    props: {},
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string", format: "email" },
        items: { type: "array", items: { type: "string" } },
      },
      required: ["name", "email"],
    },
  };

  const mockDocument: BuilderNode = new Node(mockDocumentData);

  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing and displays the Builder component", () => {
    render(
      <FormBuilder value={{}} onChange={mockOnChange} document={mockDocument} />
    );

    expect(screen.getByTestId("mock-builder")).toBeInTheDocument();
    expect(
      screen.getByText(/Mock Builder Rendered for: node-0/i)
    ).toBeInTheDocument();
  });

  it("generates form schema on document change", async () => {
    const { generateFormSchema } = await import("../schema-generator");
    render(
      <FormBuilder value={{}} onChange={mockOnChange} document={mockDocument} />
    );

    await waitFor(() => {
      expect(generateFormSchema).toHaveBeenCalledWith(mockDocument);
    });
  });

  it("calls onChange with updated value and validation status on handleSetData", async () => {
    const initialValue = { name: "", email: "" };
    let capturedContextValue: IFormContext | null;
    const ContextCapturer = () => {
      const context = useContext(FormContext);
      capturedContextValue = context;
      return null;
    };

    act(() => {
      render(
        <FormBuilder
          value={initialValue}
          onChange={mockOnChange}
          document={mockDocument}
        >
          <ContextCapturer />
        </FormBuilder>
      );
    });

    // capturedContextValue'nun ayarlanmasını bekle
    await waitFor(() => expect(capturedContextValue).toBeDefined());

    const contextValue = capturedContextValue!;

    // Simulate setting data
    contextValue.setData(mockDocument, ["name"], "John Doe");

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        { name: "John Doe", email: "" },
        false, // Should be false because email is required and empty
        expect.any(Object)
      );
      const lastCall =
        mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
      expect(lastCall[2]).toHaveProperty("email");
      expect(lastCall[2].email).toContain("Invalid email address");
    });

    // Test with valid data
    mockOnChange.mockClear();
    contextValue.setData(mockDocument, ["email"], "john.doe@example.com");

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        { name: "John Doe", email: "john.doe@example.com" },
        true, // Should be true now
        {} // No errors
      );
    });
  });

  it("updates dirtyFields correctly", async () => {
    const initialValue = { name: "", email: "" };
    let capturedContextValue: IFormContext | null;
    const ContextCapturer = () => {
      const context = useContext(FormContext);
      capturedContextValue = context;
      return null;
    };

    act(() => {
      render(
        <FormBuilder
          value={initialValue}
          onChange={mockOnChange}
          document={mockDocument}
        >
          <ContextCapturer />
        </FormBuilder>
      );
    });

    await waitFor(() => expect(capturedContextValue).toBeDefined());
    const contextValue = capturedContextValue!;

    expect(contextValue.isDirty(["name"])).toBe(false);
    contextValue.setData(mockDocument, ["name"], "Jane Doe");
    await waitFor(() => {
      expect(contextValue.isDirty(["name"])).toBe(true);
    });
  });

  it("returns field errors correctly", async () => {
    const initialValue = { name: "", email: "invalid" };
    let capturedContextValue: IFormContext | null;
    const ContextCapturer = () => {
      const context = useContext(FormContext);
      capturedContextValue = context;
      return null;
    };

    act(() => {
      render(
        <FormBuilder
          value={initialValue}
          onChange={mockOnChange}
          document={mockDocument}
        >
          <ContextCapturer />
        </FormBuilder>
      );
    });

    await waitFor(() => expect(capturedContextValue).toBeDefined());
    const contextValue = capturedContextValue!;

    // Trigger validation by setting data
    contextValue.setData(mockDocument, ["name"], "Test Name");

    await waitFor(() => {
      expect(contextValue.getErrors(["email"])).toContain(
        "Invalid email address"
      );
    });
    expect(contextValue.getErrors(["name"])).toEqual([]);
  });

  it("sets and clears array field indices correctly", async () => {
    const initialValue = { items: [] };
    const mockArrayDocument: BuilderNode = new Node<FormBuilderNodeData>({
      type: "FormData",
      props: {},
      schema: z.object({
        items: z.array(z.string()),
      }),
    });

    let capturedContextValue: IFormContext | null;
    const ContextCapturer = () => {
      const context = useContext(FormContext);
      capturedContextValue = context;
      return null;
    };

    act(() => {
      render(
        <FormBuilder
          value={initialValue}
          onChange={mockOnChange}
          document={mockArrayDocument}
        >
          <ContextCapturer />
        </FormBuilder>
      );
    });

    await waitFor(() => expect(capturedContextValue).toBeDefined());
    const contextValue = capturedContextValue!;

    const arrayPathKey = "items";
    expect(contextValue.arrayFieldIndices[arrayPathKey]).toBeUndefined();

    contextValue.setArrayFieldIndex(arrayPathKey, 0);
    await waitFor(() => {
      expect(contextValue.arrayFieldIndices[arrayPathKey]).toBe(0);
    });

    contextValue.clearArrayFieldIndex(arrayPathKey);
    await waitFor(() => {
      expect(contextValue.arrayFieldIndices[arrayPathKey]).toBeUndefined();
    });
  });
});
