import { apiConfig } from '../../api/config';
import { IReportsService } from './reports.types';
import { ReportsApi } from './reports.api';

export const reportsService: IReportsService  = new ReportsApi();
