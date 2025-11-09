'use client';

import { parseFile } from '@/lib/utils/data-parser';
import { SalesDataArraySchema } from '@/lib/validation/chart-schema';
import { useChartStore } from '@/stores/chart-store';
import { AlertCircle, BarChart3, FileSpreadsheet, Upload } from 'lucide-react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DataUploadProps {
  onLoadSample?: () => void;
}

export function DataUpload({ onLoadSample }: DataUploadProps) {
  const { setData, setErrors, setIsLoading, isLoading } = useChartStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsLoading(true);
    setErrors([]);

    try {
      const { data, errors: parseErrors } = await parseFile(file);

      if (parseErrors.length > 0) {
        setErrors(parseErrors);
        if (data.length === 0) {
          setIsLoading(false);
          return;
        }
      }

      // Validate parsed data with Zod
      try {
        const validatedData = SalesDataArraySchema.parse(data);
        setData(validatedData);

        // Data loaded with warnings, but valid data is still set
      } catch (zodError: any) {
        const zodErrors = zodError.errors?.map((err: any) => ({
          message: `验证失败: ${err.path.join('.')} - ${err.message}`,
          code: 'VALIDATION_ERROR'
        })) || [];

        setErrors([...parseErrors, ...zodErrors]);
      }
    } catch (error) {
      setErrors([{
        message: error instanceof Error ? error.message : '文件处理失败',
        code: 'PROCESSING_ERROR'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [setData, setErrors, setIsLoading]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  const handleSampleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLoadSample) {
      onLoadSample();
    }
  };

  return (
    <div
      {...getRootProps()}
      className={`
        w-full relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-all min-h-[240px] flex flex-col items-center justify-center bg-white dark:bg-gray-900
        ${isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]' : ''}
          ${isDragReject ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : ''}
        ${!isDragActive && !isDragReject ? 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600 hover:shadow-md' : ''}
          ${isLoading ? 'pointer-events-none opacity-50' : ''}
        `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center space-y-5 w-full">
        {isDragReject ? (
          <>
            <AlertCircle className="h-14 w-14 text-red-500 flex-shrink-0" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              不支持的文件格式
            </p>
          </>
        ) : isLoading ? (
          <>
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-500 border-t-transparent flex-shrink-0" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              正在处理文件...
            </p>
          </>
        ) : (
          <>
            {isDragActive ? (
              <>
                <Upload className="h-14 w-14 text-blue-500 flex-shrink-0" />
                <p className="text-base font-medium text-blue-600 dark:text-blue-400">
                  释放文件以开始上传
                </p>
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-16 w-16 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                    拖拽文件到此处，或点击选择文件
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    支持 CSV、Excel (.xlsx, .xls) 格式
                  </p>
                </div>
                {onLoadSample && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 w-full max-w-xs">
                    <button
                      type="button"
                      onClick={handleSampleClick}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <BarChart3 className="h-4 w-4" />
                      查看示例数据
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

