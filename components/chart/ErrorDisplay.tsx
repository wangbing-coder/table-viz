'use client';

import { Card, Callout } from '@tremor/react';
import { AlertTriangle, X } from 'lucide-react';
import { useChartStore } from '@/stores/chart-store';

export function ErrorDisplay() {
  const { errors, clearErrors } = useChartStore();

  if (errors.length === 0) return null;

  return (
    <Card className="w-full">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
            数据验证错误 ({errors.length})
          </h3>
          <button
            onClick={clearErrors}
            className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-60 space-y-2 overflow-y-auto">
          {errors.map((error, index) => (
            <Callout
              key={index}
              title={error.message}
              icon={AlertTriangle}
              color="red"
              className="text-sm"
            >
              {error.row && (
                <span className="text-xs">
                  行 {error.row}
                  {error.field && ` - 字段: ${error.field}`}
                </span>
              )}
            </Callout>
          ))}
        </div>
      </div>
    </Card>
  );
}

