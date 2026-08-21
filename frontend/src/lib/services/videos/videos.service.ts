import { apiConfig } from '../../api/config';
import { IVideosService } from './videos.types';
import { VideosApi } from './videos.api';
import { VideosDemo } from './videos.demo';

export const videosService: IVideosService = apiConfig.IS_DEMO_MODE 
  ? new VideosDemo() 
  : new VideosApi();
