import { IReportsService, Report } from './reports.types';

export class ReportsDemo implements IReportsService {
  async getReports(): Promise<Report[]> {
    return [];
  }

  async generateReport(payload: unknown): Promise<Report> {
    return { id: 'rep_mock_1', ...payload as Record<string, unknown> };
  }
}
