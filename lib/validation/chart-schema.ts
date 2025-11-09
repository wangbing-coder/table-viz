import { z } from 'zod';

/**
 * Zod schema for sales data validation
 */
export const SalesDataSchema = z.object({
  month: z.string().min(1, '月份不能为空'),
  actual: z.number().finite('实际值必须是有效数字'),
  lastYear: z.number().finite('去年同期值必须是有效数字'),
  mom: z.number().finite('环比必须是有效数字'),
  yoy: z.number().finite('同比必须是有效数字'),
});

/**
 * Array schema for bulk validation
 */
export const SalesDataArraySchema = z.array(SalesDataSchema);

/**
 * Type inference from schema
 */
export type SalesDataSchemaType = z.infer<typeof SalesDataSchema>;

