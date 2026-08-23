import { RecommendationsApi } from './recommendations.api';
import { IRecommendationsService } from './recommendations.types';

export const recommendationsService: IRecommendationsService = new RecommendationsApi();

export type { IRecommendationsService };
