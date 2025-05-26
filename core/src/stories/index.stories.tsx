import { type Meta, type StoryObj } from "@storybook/react";
import { Builder } from "../builder";
import type { BuilderNodeData, RendererProps } from "../types";
import "./explorer.css";
import { Render } from "./utils";

const meta: Meta<typeof Builder> = {
  title: "Builder",
  component: Builder,
  render: Render,
};

export default meta;

export type Story = StoryObj<typeof Builder>;

export const Default: Story = {
  args: {
    data: {
      type: "list",
      children: [
        {
          type: "item",
          content: "1",
        },
        {
          type: "item",
          content: "2",
        },
      ],
    },
    renderers: {
      list: ({ children }) => {
        return <ul>{children}</ul>;
      },
      item: ({
        node,
      }: RendererProps<BuilderNodeData & { content: string }>) => {
        return (
          <li>
            <span>{node.data.content}</span>{" "}
            <button onClick={() => node.remove()}>remove</button>
          </li>
        );
      },
    },
  },
};
