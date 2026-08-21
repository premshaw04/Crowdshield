import { IUploadsService, UploadResult } from './uploads.types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class UploadsDemo implements IUploadsService {
  async uploadFile(file: File): Promise<UploadResult> {
    await delay(1500); // Simulate network latency

    return new Promise((resolve, reject) => {
      // In demo mode, we just convert the file to a local object URL or Data URL
      // so it can be previewed immediately.
      const url = URL.createObjectURL(file);
      
      const img = new Image();
      img.onload = () => {
        resolve({
          url,
          filename: file.name,
          sizeBytes: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.onerror = () => {
        // If it's not an image or fails to load, just return what we know
        resolve({
          url,
          filename: file.name,
          sizeBytes: file.size
        });
      };
      img.src = url;
    });
  }
}

export const uploadsDemo = new UploadsDemo();
