import { api, ApiError } from "./api-client";

// Must match MULTIPART_MAX_FILE_SIZE in .env.spring.
export const MAX_UPLOAD_BYTES = 1024 * 1024;

interface ImageResponseDTO {
  url: string;
}

export async function uploadImage(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ApiError("Image must be 1MB or smaller.", 413, "/api/media/upload");
  }
  const formData = new FormData();
  formData.append("file", file);

  const data = await api.postFormData<ImageResponseDTO>("/media/upload", formData, false);
  return data.url;
}
