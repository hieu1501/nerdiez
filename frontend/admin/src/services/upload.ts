import { api } from "./api";

interface ImageResponseDTO {
  url: string;
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const data = await api.postFormData<ImageResponseDTO>("/media/upload", formData, true);
  return data.url;
}
