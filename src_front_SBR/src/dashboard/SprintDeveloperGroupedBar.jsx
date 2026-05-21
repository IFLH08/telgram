import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CHART_COLORS = [
  '#3B77B6',
  '#F18631',
  '#4FA23F',
  '#C73532',
  '#8D6AB8',
  '#7A7A7A',
  '#B7A238',
  '#48A4A6',
];

function formatValue(value, unit) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return `0 ${unit}`;
  }

  return `${numberValue.toLocaleString('es-MX', {
    maximumFractionDigits: unit === 'hrs' ? 1 : 0,
  })} ${unit}`;
}

export function SprintDeveloperGroupedBar({
  title,
  description,
  data,
  series,
  unit,
  xAxisLabel,
  yAxisLabel,
  allowDecimals = false,
}) {
  return (
    <section className="dashboard-card">
      <div className="dashboard-card-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="dashboard-chart-frame" role="img" aria-label={title}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 18, bottom: 46, left: 42 }}>
            <CartesianGrid stroke="#E5E7EB" />
            <XAxis
              dataKey="sprint"
              axisLine={{ stroke: '#6B7280' }}
              tickLine={{ stroke: '#6B7280' }}
              tickMargin={10}
              minTickGap={16}
              stroke="#111827"
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -28 } : undefined}
            />
            <YAxis
              axisLine={{ stroke: '#6B7280' }}
              tickLine={{ stroke: '#6B7280' }}
              tickMargin={8}
              allowDecimals={allowDecimals}
              stroke="#111827"
              label={
                yAxisLabel
                  ? { value: yAxisLabel, angle: -90, position: 'insideLeft', offset: -28, style: { textAnchor: 'middle' } }
                  : undefined
              }
            />
            <Tooltip
              cursor={{ fill: '#E5E7EB', opacity: 0.5 }}
              formatter={(value, name) => [formatValue(value, unit), name]}
              labelFormatter={(label) => `Sprint: ${label}`}
              contentStyle={{
                borderRadius: 8,
                borderColor: '#CBD5E1',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
              }}
            />
            <Legend align="left" verticalAlign="top" wrapperStyle={{ paddingBottom: 12 }} />
            {series.map((developer, index) => (
              <Bar
                key={developer.key}
                dataKey={developer.key}
                name={developer.label}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                radius={[0, 0, 0, 0]}
                maxBarSize={48}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
