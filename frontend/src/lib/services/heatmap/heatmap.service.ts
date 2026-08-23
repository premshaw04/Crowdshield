import { apiConfig } from '../../api/config';
import { IHeatmapService } from './heatmap.types';
import { HeatmapApi } from './heatmap.api';

export const heatmapService: IHeatmapService  = new HeatmapApi();
