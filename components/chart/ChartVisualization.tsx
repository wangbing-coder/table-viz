'use client';

import { sampleSalesData } from '@/lib/data/sample-data';
import { useChartStore } from '@/stores/chart-store';
import { Button, Card } from '@tremor/react';
import html2canvas from 'html2canvas';
import { Code, FileImage, Upload } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { CombinedThreeLayerChart } from './CombinedThreeLayerChart';
import { DataUpload } from './DataUpload';
import { ErrorDisplay } from './ErrorDisplay';
import { JsonDataEditor } from './JsonDataEditor';

export function ChartVisualization() {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const { data, setData, errors } = useChartStore();
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const loadSampleData = () => {
    setData(sampleSalesData);
  };

  const toggleJsonEditor = () => {
    setShowJsonEditor(!showJsonEditor);
  };

  const clearData = () => {
    setData([]);
    useChartStore.getState().setErrors([]);
  };

  const exportToPNG = useCallback(async () => {
    if (!chartRef.current) {
      alert('图表未准备好，请稍后再试');
      return;
    }

    setIsExporting(true);

    try {
      // 等待图表完全渲染
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });

      canvas.toBlob((blob) => {
        setIsExporting(false);

        if (!blob) {
          alert('生成图片失败');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `三层复合图表-${new Date().toLocaleDateString('zh-CN')}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 100);
      }, 'image/png', 1.0);
    } catch (error) {
      alert(`导出失败：${error instanceof Error ? error.message : '未知错误'}`);
      setIsExporting(false);
    }
  }, []);

  return (
    <div className="w-full py-4 sm:py-6 space-y-6">
      {/* Header - Independent Component */}
      <div className="w-full">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            三层复合图表
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            上传数据文件或手动编辑，可视化展示环比、同比和实际值数据
          </p>
        </div>
      </div>

      {/* Data Upload Section - Only show when no data */}
      {data.length === 0 && (
        <div className="w-full flex items-center justify-center min-h-[400px]">
          <div className="w-full max-w-2xl px-4 sm:px-6">
            {/* Error Display */}
            {errors.length > 0 && (
              <div className="mb-4">
                <ErrorDisplay />
              </div>
            )}

            <DataUpload onLoadSample={loadSampleData} />
          </div>
        </div>
      )}

      {/* Action Buttons - Show when data exists */}
      {data.length > 0 && (
        <div className="w-full">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end gap-2">
              <Button
                icon={FileImage}
                onClick={exportToPNG}
                disabled={isExporting}
                variant="secondary"
                size="sm"
              >
                {isExporting ? '导出中...' : '导出'}
              </Button>
              <Button
                variant="secondary"
                icon={Code}
                onClick={toggleJsonEditor}
                size="sm"
              >
                编辑
              </Button>
              <Button
                variant="secondary"
                icon={Upload}
                onClick={clearData}
                size="sm"
              >
                重新上传
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Chart Section - Independent Component */}
      {data.length > 0 && (
        <div className="w-full">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Card className="w-full h-[550px] flex-shrink-0 flex flex-col" ref={chartRef} data-chart-container>
              <div className="flex-1 min-h-0 overflow-hidden" style={{ padding: '8px' }}>
                <CombinedThreeLayerChart data={data} />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* JSON Editor Modal */}
      {showJsonEditor && (
        <JsonDataEditor
          isOpen={showJsonEditor}
          onToggle={toggleJsonEditor}
        />
      )}
    </div>
  );
}

