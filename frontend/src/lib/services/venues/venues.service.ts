import { apiConfig } from '../../api/config';
import { IVenuesService } from './venues.types';
import { venuesApi } from './venues.api';
import { venuesDemo } from './venues.demo';

export const venuesService: IVenuesService = new Proxy({} as IVenuesService, {
  get: (target, prop: keyof IVenuesService) => {
    const service = apiConfig.IS_DEMO_MODE ? venuesDemo : venuesApi;
    return service[prop];
  }
});
