import { apiClient } from '../../api/client';
import { IVideosService, UploadVideoPayload, VideoRecord, VideoStatus } from './videos.types';

const ALLOWED_EXTENSIONS = ['mp4', 'mov', 'avi'];
const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

export class VideosApi implements IVideosService {
  validateFile(file: File) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      throw new Error(`Invalid file type. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`);
    }
  }

  async uploadVideo(payload: UploadVideoPayload): Promise<VideoRecord> {
    this.validateFile(payload.file);

    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('eventId', payload.eventId);
    if (payload.zoneId) formData.append('zoneId', payload.zoneId);
    if (payload.cameraLabel) formData.append('cameraLabel', payload.cameraLabel);
    if (payload.analysisMode) formData.append('analysisMode', payload.analysisMode);
    
    return apiClient.upload<VideoRecord>(`/events/${payload.eventId}/videos`, formData);
  }

  async getEventVideos(eventId: string): Promise<VideoRecord[]> {
    return apiClient.get<VideoRecord[]>(`/events/${eventId}/videos`);
  }

  async getAllVideos(): Promise<VideoRecord[]> {
    return apiClient.get<VideoRecord[]>(`/videos`);
  }

  async getVideoById(videoId: string): Promise<VideoRecord | null> {
    return apiClient.get<VideoRecord>(`/videos/${videoId}`);
  }

  async deleteVideo(videoId: string): Promise<void> {
    return apiClient.delete<void>(`/videos/${videoId}`);
  }

  async getVideoStatus(videoId: string): Promise<{ status: VideoStatus; progress?: number }> {
    return apiClient.get<{ status: VideoStatus; progress?: number }>(`/videos/${videoId}/status`);
  }
}
