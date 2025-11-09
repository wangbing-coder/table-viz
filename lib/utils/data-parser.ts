import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { SalesData, ValidationError } from '@/lib/types/chart';
import { COLUMN_MAPPINGS } from '@/lib/types/chart';
import { parseMonth } from './date-parser';

/**
 * Find the actual column name from various possible mappings
 */
function findColumnName(headers: string[], mappings: readonly string[]): string | null {
  const normalizedHeaders = headers.map(h => h.trim());
  
  for (const mapping of mappings) {
    const index = normalizedHeaders.findIndex(h => 
      h.toLowerCase() === mapping.toLowerCase()
    );
    if (index !== -1) {
      return headers[index];
    }
  }
  
  return null;
}

/**
 * Map raw row data to SalesData structure
 */
function mapRowToSalesData(
  row: any,
  columnMap: Record<string, string>,
  rowIndex: number
): { data: SalesData | null; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  try {
    // Get month
    const monthRaw = row[columnMap.month];
    if (!monthRaw && monthRaw !== 0) {
      errors.push({
        row: rowIndex + 1,
        field: 'month',
        message: '月份字段为空',
        code: 'MISSING_FIELD'
      });
      return { data: null, errors };
    }
    
    const month = parseMonth(monthRaw);
    
    // Parse numeric fields
    const parseNumber = (value: any, fieldName: string): number | null => {
      if (value === null || value === undefined || value === '') {
        errors.push({
          row: rowIndex + 1,
          field: fieldName,
          message: `${fieldName}字段为空`,
          code: 'MISSING_FIELD'
        });
        return null;
      }
      
      const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
      
      if (isNaN(num) || !isFinite(num)) {
        errors.push({
          row: rowIndex + 1,
          field: fieldName,
          message: `${fieldName}不是有效数字: ${value}`,
          code: 'INVALID_NUMBER'
        });
        return null;
      }
      
      return num;
    };
    
    const actual = parseNumber(row[columnMap.actual], 'actual');
    const lastYear = parseNumber(row[columnMap.lastYear], 'lastYear');
    const mom = parseNumber(row[columnMap.mom], 'mom');
    const yoy = parseNumber(row[columnMap.yoy], 'yoy');
    
    if (errors.length > 0) {
      return { data: null, errors };
    }
    
    return {
      data: {
        month,
        actual: actual!,
        lastYear: lastYear!,
        mom: mom!,
        yoy: yoy!,
      },
      errors: []
    };
  } catch (error) {
    errors.push({
      row: rowIndex + 1,
      message: error instanceof Error ? error.message : '解析行数据失败',
      code: 'PARSE_ERROR'
    });
    return { data: null, errors };
  }
}

/**
 * Build column mapping from headers
 */
function buildColumnMap(headers: string[]): { 
  columnMap: Record<string, string> | null; 
  errors: ValidationError[] 
} {
  const errors: ValidationError[] = [];
  const columnMap: Record<string, string> = {};
  
  // Find each required column
  const requiredFields = ['month', 'actual', 'lastYear', 'mom', 'yoy'] as const;
  
  for (const field of requiredFields) {
    const mappings = COLUMN_MAPPINGS[field];
    const columnName = findColumnName(headers, mappings);
    
    if (!columnName) {
      errors.push({
        field,
        message: `未找到${field}列，期望列名: ${mappings.join(', ')}`,
        code: 'MISSING_COLUMN'
      });
    } else {
      columnMap[field] = columnName;
    }
  }
  
  if (errors.length > 0) {
    return { columnMap: null, errors };
  }
  
  return { columnMap, errors: [] };
}

/**
 * Parse CSV file
 */
export async function parseCSV(file: File): Promise<{ 
  data: SalesData[]; 
  errors: ValidationError[] 
}> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const { columnMap, errors: mapErrors } = buildColumnMap(headers);
        
        if (!columnMap) {
          resolve({ data: [], errors: mapErrors });
          return;
        }
        
        const data: SalesData[] = [];
        const errors: ValidationError[] = [];
        
        results.data.forEach((row, index) => {
          const { data: rowData, errors: rowErrors } = mapRowToSalesData(
            row,
            columnMap,
            index
          );
          
          if (rowData) {
            data.push(rowData);
          }
          errors.push(...rowErrors);
        });
        
        resolve({ data, errors });
      },
      error: (error) => {
        resolve({
          data: [],
          errors: [{
            message: `CSV解析失败: ${error.message}`,
            code: 'CSV_PARSE_ERROR'
          }]
        });
      }
    });
  });
}

/**
 * Parse Excel file
 */
export async function parseExcel(file: File): Promise<{ 
  data: SalesData[]; 
  errors: ValidationError[] 
}> {
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        data: [],
        errors: [{
          message: 'Excel文件中没有找到工作表',
          code: 'NO_SHEET'
        }]
      };
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
    
    if (jsonData.length === 0) {
      return {
        data: [],
        errors: [{
          message: 'Excel工作表为空',
          code: 'EMPTY_SHEET'
        }]
      };
    }
    
    // Get headers from first row
    const headers = Object.keys(jsonData[0] as object);
    const { columnMap, errors: mapErrors } = buildColumnMap(headers);
    
    if (!columnMap) {
      return { data: [], errors: mapErrors };
    }
    
    const data: SalesData[] = [];
    const errors: ValidationError[] = [];
    
    jsonData.forEach((row, index) => {
      const { data: rowData, errors: rowErrors } = mapRowToSalesData(
        row,
        columnMap,
        index
      );
      
      if (rowData) {
        data.push(rowData);
      }
      errors.push(...rowErrors);
    });
    
    return { data, errors };
  } catch (error) {
    return {
      data: [],
      errors: [{
        message: `Excel解析失败: ${error instanceof Error ? error.message : '未知错误'}`,
        code: 'EXCEL_PARSE_ERROR'
      }]
    };
  }
}

/**
 * Parse uploaded file based on type
 */
export async function parseFile(file: File): Promise<{ 
  data: SalesData[]; 
  errors: ValidationError[] 
}> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'csv') {
    return parseCSV(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(file);
  } else {
    return {
      data: [],
      errors: [{
        message: `不支持的文件格式: ${extension}。请上传CSV或Excel文件。`,
        code: 'UNSUPPORTED_FORMAT'
      }]
    };
  }
}

