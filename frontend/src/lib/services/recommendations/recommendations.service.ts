import { apiConfig } from '../../api/config';
import { RecommendationsApi } from './recommendations.api';
import { RecommendationsDemo } from './recommendations.demo';
import { IRecommendationsService } from './recommendations.types';

export const recommendationsService: IRecommendationsService = apiConfig.IS_DEMO_MODE 
  ? new RecommendationsDemo() 
  : new RecommendationsApi();

export type { IRecommendationsService };
