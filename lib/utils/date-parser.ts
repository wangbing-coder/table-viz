import { DATE_FORMATS } from '@/lib/types/chart';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/**
 * Parse various date formats and normalize to "M月" format
 * @param dateStr - Date string in various formats
 * @returns Normalized date string like "1月", "2月", etc.
 */
export function parseMonth(dateStr: string | number): string {
  if (!dateStr) {
    throw new Error('日期不能为空');
  }

  const str = String(dateStr).trim();

  // Try each format
  for (const format of DATE_FORMATS) {
    const parsed = dayjs(str, format, true);
    if (parsed.isValid()) {
      const month = parsed.month() + 1; // dayjs months are 0-indexed
      return `${month}月`;
    }
  }

  // Try to extract just the number if it's a plain number
  const match = str.match(/^(\d{1,2})/);
  if (match) {
    const month = parseInt(match[1], 10);
    if (month >= 1 && month <= 12) {
      return `${month}月`;
    }
  }

  throw new Error(`无法解析日期格式: ${str}`);
}

