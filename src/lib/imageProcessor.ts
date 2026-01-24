/**
 * Image processing utilities for product photos
 * - Resize to 1:1 aspect ratio (square)
 * - WebP conversion for better compression
 * - Multi-resolution generation for responsive loading
 */

const TARGET_ASPECT_RATIO = 1; // 1:1 aspect ratio (square)

// Resolution sizes for responsive images
export const IMAGE_SIZES = {
  thumb: 200,  // For small thumbnails
  card: 400,   // For product cards in menu
  full: 800,   // For product detail page
} as const;

export type ImageVariant = keyof typeof IMAGE_SIZES;

/**
 * Check if browser supports WebP encoding
 */
const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
};

/**
 * Resize and crop image to 1:1 aspect ratio at specified size
 */
const resizeToSquare = (img: HTMLImageElement, targetSize: number, format: 'webp' | 'jpeg' = 'webp'): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const imgAspectRatio = img.width / img.height;
      
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = img.width;
      let sourceHeight = img.height;
      
      // Crop to 1:1 aspect ratio (center crop)
      if (imgAspectRatio > TARGET_ASPECT_RATIO) {
        // Image is wider, crop horizontally
        sourceWidth = img.height * TARGET_ASPECT_RATIO;
        sourceX = (img.width - sourceWidth) / 2;
      } else if (imgAspectRatio < TARGET_ASPECT_RATIO) {
        // Image is taller, crop vertically
        sourceHeight = img.width / TARGET_ASPECT_RATIO;
        sourceY = (img.height - sourceHeight) / 2;
      }
      
      canvas.width = targetSize;
      canvas.height = targetSize;
      
      // Use high-quality image scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw cropped and resized image
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, targetSize, targetSize
      );
      
      const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';
      const quality = format === 'webp' ? 0.85 : 0.92;
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        mimeType,
        quality
      );
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Load image from File
 */
const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export interface GeneratedImages {
  thumb: Blob;   // 200x200
  card: Blob;    // 400x400
  full: Blob;    // 800x800
  format: 'webp' | 'jpeg';
}

/**
 * Generate multiple resolution images from a single file
 * Returns WebP if supported, JPEG as fallback
 */
export const generateResponsiveImages = async (file: File): Promise<GeneratedImages> => {
  const img = await loadImage(file);
  const format = supportsWebP() ? 'webp' : 'jpeg';
  
  // Generate all sizes in parallel
  const [thumb, card, full] = await Promise.all([
    resizeToSquare(img, IMAGE_SIZES.thumb, format),
    resizeToSquare(img, IMAGE_SIZES.card, format),
    resizeToSquare(img, IMAGE_SIZES.full, format),
  ]);
  
  // Clean up object URL
  URL.revokeObjectURL(img.src);
  
  return { thumb, card, full, format };
};

/**
 * Resize and crop image to 1:1 aspect ratio (square)
 * @deprecated Use generateResponsiveImages instead for new uploads
 */
export const resizeImageTo1x1 = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        const format = supportsWebP() ? 'webp' : 'jpeg';
        const blob = await resizeToSquare(img, IMAGE_SIZES.full, format);
        URL.revokeObjectURL(img.src);
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert Blob to base64 data URL
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Convert base64 data URL to Blob
 */
export const base64ToBlob = async (base64: string): Promise<Blob> => {
  const response = await fetch(base64);
  return response.blob();
};

/**
 * Create a File from Blob with proper name
 */
export const blobToFile = (blob: Blob, filename: string): File => {
  return new File([blob], filename, { type: blob.type });
};

/**
 * Get the file extension for the generated format
 */
export const getImageExtension = (format: 'webp' | 'jpeg'): string => {
  return format === 'webp' ? 'webp' : 'jpg';
};

/**
 * Generate storage paths for all image variants
 */
export const getImagePaths = (slug: string, format: 'webp' | 'jpeg'): Record<ImageVariant, string> => {
  const ext = getImageExtension(format);
  return {
    thumb: `products/${slug}_200.${ext}`,
    card: `products/${slug}_400.${ext}`,
    full: `products/${slug}.${ext}`,
  };
};
