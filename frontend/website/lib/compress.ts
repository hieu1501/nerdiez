import { MAX_UPLOAD_BYTES } from "./upload";

const MAX_DIMENSION = 1920;
const QUALITIES = [0.82, 0.7, 0.6, 0.5];
const SCALES = [1, 0.75, 0.5];
// Re-encoding to JPEG would drop GIF animation and SVG vectors.
const SKIPPED_TYPES = ["image/gif", "image/svg+xml"];

/**
 * Compresses an image file using canvas before upload.
 * Resizes to max 1920px on longest side, and re-encodes to JPEG when the file is
 * over the upload limit, lowering quality then size until it fits.
 * Returns original file if already small or compression fails.
 */
export async function compressImage(file: File): Promise<File> {
  if (file.size < 200 * 1024) return file;
  if (!file.type.startsWith("image/") || SKIPPED_TYPES.includes(file.type)) return file;

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const resized = width !== bitmap.width || height !== bitmap.height;
    if (!resized && file.size <= MAX_UPLOAD_BYTES) return file;

    let blob: Blob | null = null;
    encode: for (const scale of SCALES) {
      const w = Math.round(width * scale);
      const h = Math.round(height * scale);
      const canvas = new OffscreenCanvas(w, h);
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;

      // JPEG has no alpha, so transparent areas would turn black.
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(bitmap, 0, 0, w, h);

      for (const quality of QUALITIES) {
        blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
        if (blob.size <= MAX_UPLOAD_BYTES) break encode;
      }
    }

    if (!blob || (!resized && blob.size >= file.size)) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file;
  } finally {
    bitmap?.close();
  }
}
