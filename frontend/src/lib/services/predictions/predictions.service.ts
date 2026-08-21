import { apiConfig } from '../../api/config';
import { PredictionsApi } from './predictions.api';
import { PredictionsDemo } from './predictions.demo';
import { IPredictionsService } from './predictions.types';

export const predictionsService: IPredictionsService = apiConfig.IS_DEMO_MODE 
  ? new PredictionsDemo() 
  : new PredictionsApi();

export type { IPredictionsService };
