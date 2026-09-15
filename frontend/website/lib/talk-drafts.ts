import { editorStorageKey } from "./auth-storage";
import type { PatchTalkRequest } from "./personal-api";

export interface TalkDraft {
  publicUri?: string;
  content: string;
  originalContent: string;
}
export function talkDraftKey(username: string, topicPublicUri: string, publicUri?: string): string {
  return editorStorageKey(username, `talks:${encodeURIComponent(topicPublicUri)}`, publicUri);
}
export function parseTalkDraft(value: string | null): TalkDraft | null {
  try {
    const draft: unknown = JSON.parse(value ?? "null");
    if (!draft || typeof draft !== "object") return null;
    const fields = draft as Record<string, unknown>;
    if (!["content", "originalContent"].every((key) => typeof fields[key] === "string")) return null;
    if (fields.publicUri !== undefined && (typeof fields.publicUri !== "string" || !fields.publicUri || /[/\\?#]/.test(fields.publicUri))) return null;
    return { content: fields.content as string, originalContent: fields.originalContent as string, publicUri: fields.publicUri as string | undefined };
  } catch { return null; }
}
export function talkDraftError(draft: TalkDraft): string | null {
  if (!draft.content.trim()) return "Enter reply content.";
  if (draft.content.length > 10_000) return "Use up to 10,000 characters for content.";
  return null;
}
export function talkPatch(draft: TalkDraft): PatchTalkRequest {
  const patch: PatchTalkRequest = {};
  if (draft.content !== draft.originalContent) patch.content = draft.content;
  return patch;
}
export function talkDraftChanged(draft: TalkDraft): boolean {
  return draft.content !== draft.originalContent;
}
