import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

// Shared by editors and readers so a single Enter renders as a line break in both.
export const markdownPlugins = [remarkGfm, remarkBreaks];
