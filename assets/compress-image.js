// ═══════════════════════════════════════════════
// NUKRAX — compress-image.js
// Resizes and re-encodes an image in the browser before upload, so
// storage usage stays small. Falls back to the original file if
// compression doesn't actually help or isn't supported.
// ═══════════════════════════════════════════════

export async function compressImage(file, { maxDimension = 1280, quality = 0.82 } = {}) {
  if (!file || !file.type || !file.type.startsWith('image/')) return file;
  // Skip already-tiny files — not worth the CPU cost.
  if (file.size < 150 * 1024) return file;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;

    if (width > maxDimension || height > maxDimension) {
      const scale = maxDimension / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file; // compression didn't actually help, keep original

    const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], newName, { type: 'image/jpeg' });
  } catch (err) {
    console.warn('Image compression skipped:', err);
    return file; // any failure just falls back to uploading the original
  }
}
