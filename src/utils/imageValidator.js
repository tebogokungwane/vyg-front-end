/**
 * Validates image quality before upload.
 * Returns a promise that resolves with { valid, error } 
 */

export const validateImageQuality = (file, options = {}) => {
  const {
    minWidth = 200,
    minHeight = 200,
    maxSizeMB = 10,
    allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml"],
    recommendedWidth = null,
    recommendedHeight = null,
  } = options;

  return new Promise((resolve) => {
    // Check file type
    if (!allowedTypes.includes(file.type) && !file.type.startsWith("image/")) {
      resolve({
        valid: false,
        error: `Invalid file type. Allowed: PNG, JPG, WebP, SVG.`,
      });
      return;
    }

    // Check file size
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > maxSizeMB) {
      resolve({
        valid: false,
        error: `File is too large (${sizeMB.toFixed(1)}MB). Maximum allowed: ${maxSizeMB}MB.`,
      });
      return;
    }

    // Check if file is too small (likely low quality)
    if (file.size < 5000 && !file.type.includes("svg")) {
      resolve({
        valid: false,
        error: `File is too small (${(file.size / 1024).toFixed(1)}KB). Please upload a higher quality image.`,
      });
      return;
    }

    // For SVG files, skip dimension check
    if (file.type === "image/svg+xml") {
      resolve({ valid: true, error: null });
      return;
    }

    // Check image dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          valid: false,
          error: `Image is too small (${img.width}×${img.height}px). Minimum required: ${minWidth}×${minHeight}px.`,
        });
        return;
      }

      // Warn if image is very low resolution for its intended use
      if (recommendedWidth && recommendedHeight) {
        if (img.width < recommendedWidth || img.height < recommendedHeight) {
          resolve({
            valid: true,
            warning: `Image is ${img.width}×${img.height}px. Recommended: ${recommendedWidth}×${recommendedHeight}px for best quality.`,
            error: null,
          });
          return;
        }
      }

      resolve({ valid: true, error: null, dimensions: { width: img.width, height: img.height } });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        valid: false,
        error: "Could not read image. The file may be corrupted.",
      });
    };

    img.src = objectUrl;
  });
};

// Preset validators for specific use cases
export const validateLogo = (file) =>
  validateImageQuality(file, {
    minWidth: 100,
    minHeight: 100,
    maxSizeMB: 5,
    recommendedWidth: 200,
    recommendedHeight: 200,
  });

export const validateFavicon = (file) =>
  validateImageQuality(file, {
    minWidth: 32,
    minHeight: 32,
    maxSizeMB: 2,
    allowedTypes: ["image/png", "image/jpeg", "image/jpg", "image/x-icon", "image/vnd.microsoft.icon", "image/svg+xml", "image/webp"],
    recommendedWidth: 64,
    recommendedHeight: 64,
  });

export const validateBackground = (file) =>
  validateImageQuality(file, {
    minWidth: 800,
    minHeight: 600,
    maxSizeMB: 10,
    recommendedWidth: 1920,
    recommendedHeight: 1080,
  });

export const validateNationImage = (file) =>
  validateImageQuality(file, {
    minWidth: 50,
    minHeight: 50,
    maxSizeMB: 3,
    recommendedWidth: 200,
    recommendedHeight: 200,
  });
