import { apiConfig } from '../../api/config';
import { IReportsService } from './reports.types';
import { ReportsApi } from './reports.api';
import { ReportsDemo } from './reports.demo';

export const reportsService: IReportsService = apiConfig.IS_DEMO_MODE 
  ? new ReportsDemo() 
  : new ReportsApi();
