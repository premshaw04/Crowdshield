import { apiConfig } from '../../api/config';
import { IHeatmapService } from './heatmap.types';
import { HeatmapApi } from './heatmap.api';
import { HeatmapDemo } from './heatmap.demo';

export const heatmapService: IHeatmapService = apiConfig.IS_DEMO_MODE 
  ? new HeatmapDemo() 
  : new HeatmapApi();
