export interface UploadResult {
  url: string;
  filename: string;
  sizeBytes: number;
  width?: number;
  height?: number;
}

export interface IUploadsService {
  uploadFile(file: File): Promise<UploadResult>;
}
