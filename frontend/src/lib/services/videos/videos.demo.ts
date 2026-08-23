import { IVideosService, UploadVideoPayload, VideoRecord, VideoStatus } from './videos.types';

const ALLOWED_EXTENSIONS = ['mp4', 'mov', 'avi'];
const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let mockVideosDb: VideoRecord[] = [];

export class VideosDemo implements IVideosService {
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

    await delay(1500); // Simulate network upload time
    
    const mockRecord: VideoRecord = {
      id: `vid_mock_${Math.random().toString(36).substring(2, 9)}`,
      eventId: payload.eventId,
      zoneId: payload.zoneId,
      cameraLabel: payload.cameraLabel,
      analysisMode: payload.analysisMode,
      status: 'processing', // Initial mock status
      filename: payload.file.name,
      sizeBytes: payload.file.size,
      createdAt: new Date().toISOString()
    };
    
    mockVideosDb = [mockRecord, ...mockVideosDb];
    
    // Simulate background processing moving it to 'ready' after 5 seconds
    setTimeout(() => {
      const idx = mockVideosDb.findIndex(v => v.id === mockRecord.id);
      if (idx !== -1) {
        mockVideosDb[idx] = { ...mockVideosDb[idx], status: 'ready', url: 'https://demo.crowdshield.local/mock-video.mp4' };
      }
    }, 5000);

    return mockRecord;
  }

  async getEventVideos(eventId: string): Promise<VideoRecord[]> {
    await delay(300);
    return mockVideosDb.filter(v => v.eventId === eventId);
  }

  async getAllVideos(): Promise<VideoRecord[]> {
    await delay(200);
    return mockVideosDb;
  }

  async getVideoById(videoId: string): Promise<VideoRecord | null> {
    await delay(200);
    return mockVideosDb.find(v => v.id === videoId) || null;
  }

  async deleteVideo(videoId: string): Promise<void> {
    await delay(300);
    const initialLen = mockVideosDb.length;
    mockVideosDb = mockVideosDb.filter(v => v.id !== videoId);
    if (mockVideosDb.length === initialLen) {
      throw new Error(`Video ${videoId} not found`);
    }
  }

  async getVideoStatus(videoId: string): Promise<{ status: VideoStatus; progress?: number }> {
    await delay(100);
    const vid = mockVideosDb.find(v => v.id === videoId);
    if (!vid) throw new Error('Not found');
    return { status: vid.status, progress: vid.status === 'processing' ? 45 : 100 };
  }
}
