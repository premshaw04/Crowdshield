import { apiClient } from '../../api/client';
import { IUploadsService, UploadResult } from './uploads.types';

export class UploadsApi implements IUploadsService {
  async uploadFile(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    // Call the backend API (multipart/form-data)
    const response = await apiClient.upload<{ data: UploadResult }>('/api/v1/uploads', formData);
    return response.data;
  }
}

export const uploadsApi = new UploadsApi();
