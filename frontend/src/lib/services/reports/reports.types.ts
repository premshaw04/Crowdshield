export interface Report {
  id: string;
  [key: string]: unknown;
}

export interface IReportsService {
  getReports(): Promise<Report[]>;
  generateReport(payload: unknown): Promise<Report>;
}
