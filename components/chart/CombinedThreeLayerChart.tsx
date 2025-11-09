'use client';

import type { SalesData } from '@/lib/types/chart';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';

interface CombinedThreeLayerChartProps {
  data: SalesData[];
}

export function CombinedThreeLayerChart({ data }: CombinedThreeLayerChartProps) {
  // Memoize chart components to prevent unnecessary re-renders
  const chartContent = useMemo(() => (
    <div style={{ height: '534px', display: 'flex', width: '100%', position: 'relative' }}>
      {/* Left side titles - Using absolute positioning for perfect alignment */}
      <div style={{ width: '88px', height: '534px', position: 'relative', flexShrink: 0 }}>
        {/* Top Layer Label - 环比 */}
        <div style={{ position: 'absolute', top: '70px', left: '8px', display: 'flex', alignItems: 'center', gap: '4px', transform: 'translateY(-50%)' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', lineHeight: 1 }}>环比</span>
        </div>
        {/* Middle Layer Label - 同比 */}
        <div style={{ position: 'absolute', top: '210px', left: '8px', display: 'flex', alignItems: 'center', gap: '4px', transform: 'translateY(-50%)' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', lineHeight: 1 }}>同比</span>
        </div>
        {/* Bottom Layer Labels - 实际值 和 去年同期 */}
        <div style={{ position: 'absolute', top: '407px', left: '8px', display: 'flex', flexDirection: 'column', gap: '8px', transform: 'translateY(-50%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#10b981', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', lineHeight: 1 }}>实际值</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#eab308', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap', lineHeight: 1 }}>去年同期</span>
          </div>
        </div>
      </div>

      {/* Right side charts stacked - Same flex structure */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '534px' }}>
        {/* Top Layer - MoM Line Chart */}
        <div style={{ height: '140px', width: '100%', display: 'flex', alignItems: 'stretch' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 25, right: 30, left: 30, bottom: 5 }}
            >
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <ReferenceLine y={0} stroke="currentColor" strokeDasharray="3 3" opacity={0.3} />
              <Line
                type="monotone"
                dataKey="mom"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ fill: '#3b82f6', r: 4 }}
                label={{
                  position: 'top',
                  fill: '#1f2937',
                  fontSize: 12,
                  fontWeight: 600,
                  formatter: (value: any) => `${value}%`,
                  offset: 5
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Middle Layer - YoY Bar Chart */}
        <div style={{ height: '140px', width: '100%', display: 'flex', alignItems: 'stretch' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 25, right: 30, left: 30, bottom: 5 }}
            >
              <XAxis dataKey="month" hide />
              <YAxis hide />
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <ReferenceLine y={0} stroke="currentColor" strokeDasharray="3 3" opacity={0.3} />
              <Bar
                dataKey="yoy"
                radius={[4, 4, 0, 0]}
                label={{
                  position: 'top',
                  fill: '#1f2937',
                  fontSize: 12,
                  fontWeight: 600,
                  formatter: (value: any) => `${value}%`,
                  offset: 5
                }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.yoy >= 0 ? '#3b82f6' : '#f97316'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Layer - Actual Values Bar Chart */}
        <div style={{ height: '254px', width: '100%', display: 'flex', alignItems: 'stretch' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 25, right: 30, left: 30, bottom: 40 }}
            >
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#1f2937', fontWeight: 500 }}
                axisLine={{ stroke: '#1f2937', strokeWidth: 1.5 }}
                tickLine={false}
                angle={0}
                textAnchor="middle"
              />
              <YAxis hide />
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <ReferenceLine y={0} stroke="currentColor" strokeWidth={1} />
              <Bar
                dataKey="lastYear"
                fill="#eab308"
                radius={[4, 4, 0, 0]}
                label={{
                  position: 'top',
                  fill: '#1f2937',
                  fontSize: 12,
                  fontWeight: 600
                }}
              />
              <Bar
                dataKey="actual"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                label={{
                  position: 'top',
                  fill: '#1f2937',
                  fontSize: 12,
                  fontWeight: 600
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  ), [data]);

  return chartContent;
}
