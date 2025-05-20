import { type StoryObj } from "@storybook/react";
import { Builder, parse } from "..";
import { NodeRenderer } from "../node-renderer";

const meta = {
  title: "Builder",
  component: Builder,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rootNode: parse({
      type: "document",
      children: [
        {
          type: "list",
          children: [
            {
              type: "list-item",
              textContent: "item 1",
            },
            {
              type: "list-item",
              textContent: "item 2",
            },
          ],
        },
      ],
    }),
    widgets: {
      document: ({ node }) =>
        node.children?.map((child) => (
          <NodeRenderer node={child} key={child.id} />
        )),
      list: ({ node }) => (
        <ul>
          {node.children?.map((child) => (
            <NodeRenderer node={child} key={child.id} />
          ))}
        </ul>
      ),
      "list-item": ({ node }) => <li>{node.data.textContent as string}</li>,
    },
  },
};
