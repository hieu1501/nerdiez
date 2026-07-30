import { api } from "./api";

export class UploadError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "UploadError";
    this.status = status;
  }
}

function extractUrl(data: unknown): string {
  if (!data) return "";
  if (typeof data === "string") return data;

  const obj = data as Record<string, unknown>;
  const inner = obj.data && typeof obj.data === "object" ? obj.data as Record<string, unknown> : obj;

  return (inner.url || inner.path || inner.filePath || inner.fileUrl || inner.location || "") as string;
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const data = await api.postFormData<unknown>("/media/upload", formData, true);
  return extractUrl(data);
}
