/**
 * Image processing utilities for product photos
 * - Resize to 1:1 aspect ratio (square)
 * - AI enhancement for product photography
 */

const TARGET_ASPECT_RATIO = 1; // 1:1 aspect ratio (square)
const MAX_SIZE = 800; // Max width/height in pixels

/**
 * Resize and crop image to 1:1 aspect ratio (square)
 */
export const resizeImageTo1x1 = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
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
        
        // Crop to 4:5 aspect ratio (center crop)
        if (imgAspectRatio > TARGET_ASPECT_RATIO) {
          // Image is wider than 4:5, crop horizontally
          sourceWidth = img.height * TARGET_ASPECT_RATIO;
          sourceX = (img.width - sourceWidth) / 2;
        } else if (imgAspectRatio < TARGET_ASPECT_RATIO) {
          // Image is taller than 4:5, crop vertically
          sourceHeight = img.width / TARGET_ASPECT_RATIO;
          sourceY = (img.height - sourceHeight) / 2;
        }
        
        // Calculate output dimensions (square, so width = height)
        let outputSize = Math.min(sourceWidth, sourceHeight);
        
        // Scale down if too large
        if (outputSize > MAX_SIZE) {
          outputSize = MAX_SIZE;
        }
        
        canvas.width = outputSize;
        canvas.height = outputSize;
        
        // Use high-quality image scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw cropped and resized image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, outputSize, outputSize
        );
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          0.92 // High quality JPEG
        );
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
