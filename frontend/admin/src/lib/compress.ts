const MAX_DIMENSION = 1920;
const QUALITY = 0.82;

/**
 * Compresses an image file using canvas before upload.
 * Resizes to max 1920px on longest side and converts to JPEG at 82% quality.
 * Returns original file if already small or compression fails.
 */
export async function compressImage(file: File): Promise<File> {
  if (file.size < 200 * 1024) return file;
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    if (width === bitmap.width && height === bitmap.height) {
      bitmap.close();
      return file;
    }

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) { bitmap.close(); return file; }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: QUALITY });
    return new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file;
  }
}
