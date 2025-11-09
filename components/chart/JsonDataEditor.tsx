'use client';

import { SalesDataArraySchema } from '@/lib/validation/chart-schema';
import { useChartStore } from '@/stores/chart-store';
import { Button, Card } from '@tremor/react';
import { AlertCircle, Code, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface JsonDataEditorProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function JsonDataEditor({ isOpen, onToggle }: JsonDataEditorProps) {
  const { data, setData, setErrors } = useChartStore();
  const [jsonText, setJsonText] = useState('');
  const [validationError, setValidationError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Update JSON text when dialog opens
  useEffect(() => {
    if (isOpen) {
      const formatted = JSON.stringify(data, null, 2);
      setJsonText(formatted);
      setValidationError('');
    }
  }, [isOpen, data]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleSave = () => {
    setIsSaving(true);
    setValidationError('');
    setErrors([]);

    try {
      // Parse JSON
      const parsed = JSON.parse(jsonText);

      // Validate with Zod
      const validatedData = SalesDataArraySchema.parse(parsed);

      // Update store
      setData(validatedData);
      onToggle();
    } catch (error) {
      if (error instanceof SyntaxError) {
        setValidationError(`JSON 格式错误: ${error.message}`);
      } else if (error instanceof Error) {
        setValidationError(`数据验证失败: ${error.message}`);
      } else {
        setValidationError('未知错误');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValidationError('');
    onToggle();
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setValidationError('');
    } catch (error) {
      setValidationError('无法格式化：JSON 格式错误');
    }
  };

  return (
    <>
      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleCancel}
        >
          <Card
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    编辑 JSON 数据
                  </h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={formatJson}
                  >
                    格式化
                  </Button>
                  <Button
                    size="xs"
                    variant="secondary"
                    icon={X}
                    onClick={handleCancel}
                  >
                    取消
                  </Button>
                  <Button
                    size="xs"
                    icon={isSaving ? undefined : Save}
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? '保存中...' : '保存'}
                  </Button>
                </div>
              </div>

              {/* Validation Error */}
              {validationError && (
                <div className="flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{validationError}</p>
                </div>
              )}

              {/* JSON Editor */}
              <div className="relative">
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="w-full h-[400px] p-4 font-mono text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder='[\n  {\n    "month": "1月",\n    "actual": 48,\n    "lastYear": 35,\n    "mom": 37,\n    "yoy": 36\n  }\n]'
                  spellCheck={false}
                />
              </div>

              {/* Helper Text */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>💡 提示：</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>使用 JSON 数组格式，每个对象包含：month（月份）、actual（实际值）、lastYear（去年同期）、mom（环比%）、yoy（同比%）</li>
                  <li>点击"格式化"按钮可以自动美化 JSON 格式</li>
                  <li>保存前会自动验证数据格式</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

