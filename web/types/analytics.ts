export interface AnalyticsDataPoint {
  date: string;
  views: number; // Number of views for this date
  signups: number; // Number of signups for this date
  conversionRate: number; // Conversion rate for this date
}
