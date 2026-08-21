import { apiConfig } from '../../api/config';
import { IGeocodingService } from './geocoding.types';
import { geocodingApi } from './geocoding.api';
import { geocodingDemo } from './geocoding.demo';

export const geocodingService: IGeocodingService = new Proxy({} as IGeocodingService, {
  get: (target, prop: keyof IGeocodingService) => {
    const service = apiConfig.IS_DEMO_MODE ? geocodingDemo : geocodingApi;
    return service[prop];
  }
});
