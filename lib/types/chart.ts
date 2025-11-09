/**
 * Data structure for sales data with year-over-year and month-over-month comparisons
 */
export interface SalesData {
  month: string; // Display format: "1月", "2月", etc.
  actual: number; // Actual value (unit: 万)
  lastYear: number; // Last year's value (unit: 万)
  mom: number; // Month-over-Month percentage
  yoy: number; // Year-over-Year percentage
}

/**
 * Validation error structure
 */
export interface ValidationError {
  row?: number;
  field?: string;
  message: string;
  code?: string;
}

/**
 * File upload response
 */
export interface UploadResponse {
  success: boolean;
  data: SalesData[];
  errors: ValidationError[];
}

/**
 * Column name mappings for flexible data parsing
 */
export const COLUMN_MAPPINGS = {
  month: ['月份', 'month', '月', 'Month', 'MONTH'],
  actual: ['实际值', 'actual', '实际', 'Actual', 'ACTUAL', '本期'],
  lastYear: ['去年同期值', 'lastYear', 'last_year', '去年', 'LastYear', 'LAST_YEAR', '上年同期'],
  mom: ['环比', 'mom', 'MoM', 'MOM', '环比增长', '环比增长率'],
  yoy: ['同比', 'yoy', 'YoY', 'YOY', '同比增长', '同比增长率'],
} as const;

/**
 * Supported date formats
 */
export const DATE_FORMATS = [
  'M月', // 1月, 2月, etc.
  'MM月', // 01月, 02月, etc.
  'YYYY-MM', // 2025-01
  'YYYY年M月', // 2025年1月
  'YYYY年MM月', // 2025年01月
  'YYYY/MM', // 2025/01
  'M', // 1, 2, etc.
  'MM', // 01, 02, etc.
] as const;

