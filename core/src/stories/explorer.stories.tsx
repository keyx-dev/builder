import { memo, useState, type ReactNode } from "react";
import type { BuilderNode, BuilderNodeData } from "../types";
import { Builder } from "../builder";
import type { Meta, StoryObj } from "@storybook/react";
import { Render } from "./utils";
import "./explorer.css";

const meta: Meta<typeof Builder> = {
  title: "Builder",
  component: Builder,
  render: Render,
};
export default meta;
export type Story = StoryObj<typeof Builder>;

interface ExplorerData extends BuilderNodeData {
  name: string;
  children: (FolderData | FileData)[];
}

interface FolderData extends BuilderNodeData {
  name: string;
  children?: (FolderData | FileData)[];
}

interface FileData extends BuilderNodeData {
  name: string;
}

export const Explorer: Story = {
  args: {
    data: {
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
    },
    renderers: {
      explorer: ({
        node,
        children,
      }: {
        node: BuilderNode<ExplorerData>;
        children?: ReactNode;
      }) => (
        <>
          <span>{node.data.name}</span>
          <ul>{children}</ul>
        </>
      ),
      folder: memo(function Folder({
        node,
        children,
      }: {
        node: BuilderNode<FolderData>;
        children?: ReactNode;
      }) {
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
            {!collapsed && <ul>{children}</ul>}
          </li>
        );
      }),
      file: memo(({ node }: { node: BuilderNode<FileData> }) => (
        <li>
          <span className="muted">{isLastChild(node) ? "└" : "├"} </span>
          <button
            onClick={() => {
              const newName = window.prompt("Change name", node.data.name);

              if (newName) {
                node.setData("name", newName);
              }
            }}
          >
            <span className="glyphs">📄</span>
            {node.data.name as string}
          </button>
        </li>
      )),
    },
  },
};

const isLastChild = (
  node:
    | BuilderNode<ExplorerData>
    | BuilderNode<FolderData>
    | BuilderNode<FileData>
) => node.parent!.children[node.parent!.children.length - 1] === node;
