import { apiClient } from '../../api/client';
import { IReportsService, Report } from './reports.types';

export class ReportsApi implements IReportsService {
  async getReports(): Promise<Report[]> {
    return apiClient.get<Report[]>('/reports');
  }

  async generateReport(payload: unknown): Promise<Report> {
    return apiClient.post<Report>('/reports/generate', payload);
  }
}
