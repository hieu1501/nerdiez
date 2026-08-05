import { visit } from "unist-util-visit";
import type { Element, Root, ElementContent } from "hast";

const isImg = (n: ElementContent): n is Element & { tagName: "img" } =>
  n.type === "element" && n.tagName === "img";

function buildFigure(img: Element, compact?: boolean): Element {
  const alt = (img.properties?.alt as string) || "";

  img.properties = {
    ...img.properties,
    className: [
      "rounded-lg",
      "max-h-96",
      "w-auto",
      "object-contain",
    ],
  };

  const fig: Element = {
    type: "element",
    tagName: "figure",
    properties: {
      className: [
        "not-prose",
        compact ? "my-4" : "my-8",
        "mx-0",
        "flex",
        "flex-col",
        "items-center",
      ],
    },
    children: [img],
  };

  if (alt) {
    fig.children.push({
      type: "element",
      tagName: "figcaption",
      properties: {
        className: [
          "mt-2",
          "text-center",
          "text-sm",
          "text-gray-500",
          "dark:text-gray-400",
        ],
      },
      children: [{ type: "text", value: alt }],
    });
  }

  return fig;
}

function hasRealText(nodes: ElementContent[]): boolean {
  return nodes.some((c) => c.type === "text" && c.value.trim() !== "");
}

function isBr(n: ElementContent): boolean {
  return n.type === "element" && (n as Element).tagName === "br";
}

function trimBreaks(nodes: ElementContent[]): ElementContent[] {
  let start = 0;
  let end = nodes.length - 1;
  while (start <= end && isBr(nodes[start])) start++;
  while (end >= start && isBr(nodes[end])) end--;
  return nodes.slice(start, end + 1);
}

export default function rehypeFigure() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index: number | undefined, parent: Root | Element | undefined) => {
      if (node.tagName !== "p") return;
      if (!parent || index === undefined) return;

      const imgIndices = node.children
        .map((c, i) => (isImg(c) ? i : -1))
        .filter((i) => i !== -1);

      if (imgIndices.length === 0) return;

      const hasBr = node.children.some(
        (c) => c.type === "element" && (c as Element).tagName === "br",
      );
      const compact = hasBr;

      const replacements: ElementContent[] = [];
      let lastIdx = 0;

      for (const imgIdx of imgIndices) {
        const before = trimBreaks(node.children.slice(lastIdx, imgIdx));
        if (before.length > 0 && hasRealText(before)) {
          replacements.push({
            type: "element",
            tagName: "p",
            properties: {},
            children: before,
          });
        }

        replacements.push(buildFigure(node.children[imgIdx] as Element, compact));

        lastIdx = imgIdx + 1;
      }

      const after = trimBreaks(node.children.slice(lastIdx));
      if (after.length > 0 && hasRealText(after)) {
        replacements.push({
          type: "element",
          tagName: "p",
          properties: {},
          children: after,
        });
      }

      parent.children.splice(index, 1, ...replacements);
    });
  };
}
