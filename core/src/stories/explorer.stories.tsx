import { type StoryObj } from "@storybook/react";
import { Builder, parse, type BuilderNode } from "..";
import { NodeRenderer } from "../node-renderer";
import { useState } from "react";
import "./explorer.css";

const meta = {
  title: "Builder",
  component: Builder,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Explorer: Story = {
  args: {
    rootNode: parse({
      type: "explorer",
      name: "Explorer",
      children: [
        {
          type: "folder",
          name: "app",
          children: [
            {
              type: "folder",
              name: "lib",
              children: [
                { type: "file", name: "data.ts" },
                { type: "file", name: "definitions.ts" },
                { type: "file", name: "placeholder-data.ts" },
                { type: "file", name: "utils.ts" },
              ],
            },
            { type: "folder", name: "query" },
            { type: "folder", name: "seed" },
            { type: "folder", name: "ui" },
            { type: "file", name: "layout.tsx" },
            { type: "file", name: "page.tsx" },
          ],
        },
        {
          type: "folder",
          name: "public",
          children: [
            { type: "file", name: "favicon.ico" },
            { type: "file", name: "hero-desktop.png" },
            { type: "file", name: "hero-mobile.png" },
            { type: "file", name: "opengraph-image.png" },
          ],
        },
        { type: "file", name: ".env.example" },
        { type: "file", name: ".gitignore" },
        { type: "file", name: "README.md" },
        { type: "file", name: "next.config.ts" },
        { type: "file", name: "package.json" },
        { type: "file", name: "pnpm-lock.yaml" },
        { type: "file", name: "postcss.config.js" },
        { type: "file", name: "tailwind.config.ts" },
        { type: "file", name: "tsconfig.json" },
      ],
    }),
    widgets: {
      explorer: ({ node }) => (
        <ul>
          <li>
            <span>Explorer</span>
            {node.children?.map((child) => (
              <NodeRenderer node={child} key={child.id} />
            ))}
          </li>
        </ul>
      ),
      folder: function Folder({ node }) {
        const [collapsed, setCollapsed] = useState(true);

        return (
          <li>
            <span className="muted">
              {isLastChild(node) || (!collapsed && node.children.length)
                ? "└"
                : "├"}{" "}
            </span>
            <button onClick={() => setCollapsed((c) => !c)}>
              <span className="glyphs">{collapsed ? "📁" : "📂"}</span>
              {node.data.name as string}
            </button>
            {!collapsed && (
              <ul>
                {node.children?.map((child) => (
                  <NodeRenderer node={child} key={child.id} />
                ))}
              </ul>
            )}
          </li>
        );
      },
      file: ({ node }) => (
        <li>
          <span className="muted">{isLastChild(node) ? "└" : "├"} </span>
          <button
            onClick={() => {
              alert(`Selected file: ${getPath(node)}`);
            }}
          >
            <span className="glyphs">📄</span>
            {node.data.name as string}
          </button>
        </li>
      ),
    },
  },
};

const isLastChild = (node: BuilderNode) =>
  node.parent!.children[node.parent!.children.length - 1] === node;

const getPath = (node: BuilderNode) => {
  const paths = [];
  let currentNode: null | BuilderNode = node;
  while (currentNode) {
    paths.unshift(currentNode.data.name);
    currentNode = currentNode.parent;
  }

  return paths.join("/");
};
