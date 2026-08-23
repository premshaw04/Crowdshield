import { IVideosService } from './videos.types';
import { VideosApi } from './videos.api';

export const videosService: IVideosService = new VideosApi();
