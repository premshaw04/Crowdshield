import { apiConfig } from '../../api/config';
import { IUploadsService } from './uploads.types';
import { uploadsApi } from './uploads.api';
import { uploadsDemo } from './uploads.demo';

export const uploadsService: IUploadsService = new Proxy({} as IUploadsService, {
  get: (target, prop: keyof IUploadsService) => {
    const service = apiConfig.IS_DEMO_MODE ? uploadsDemo : uploadsApi;
    return service[prop];
  }
});
