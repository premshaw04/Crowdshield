import { PredictionsApi } from './predictions.api';
import { IPredictionsService } from './predictions.types';

export const predictionsService: IPredictionsService = new PredictionsApi();

export type { IPredictionsService };
