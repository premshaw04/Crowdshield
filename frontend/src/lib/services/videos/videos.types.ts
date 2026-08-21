export type VideoStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export interface VideoRecord {
  id: string;
  eventId: string;
  zoneId?: string;
  cameraLabel?: string;
  analysisMode?: string;
  status: VideoStatus;
  filename: string;
  sizeBytes: number;
  url?: string;
  createdAt: string;
}

export interface UploadVideoPayload {
  file: File;
  eventId: string;
  zoneId?: string;
  cameraLabel?: string;
  analysisMode?: string;
}

export interface IVideosService {
  validateFile(file: File): void;
  uploadVideo(payload: UploadVideoPayload): Promise<VideoRecord>;
  getEventVideos(eventId: string): Promise<VideoRecord[]>;
  getAllVideos(): Promise<VideoRecord[]>;
  getVideoById(videoId: string): Promise<VideoRecord | null>;
  deleteVideo(videoId: string): Promise<void>;
  getVideoStatus(videoId: string): Promise<{ status: VideoStatus; progress?: number }>;
}
