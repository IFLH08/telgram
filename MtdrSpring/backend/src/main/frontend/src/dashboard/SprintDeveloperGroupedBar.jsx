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
  '#2563EB',
  '#16A34A',
  '#F97316',
  '#7C3AED',
  '#DB2777',
  '#0891B2',
  '#CA8A04',
  '#475569',
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
          <BarChart data={data} margin={{ top: 12, right: 12, bottom: 12, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="sprint"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              minTickGap={16}
              stroke="#475569"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              allowDecimals={allowDecimals}
              stroke="#475569"
            />
            <Tooltip
              cursor={{ fill: '#E2E8F0', opacity: 0.45 }}
              formatter={(value, name) => [formatValue(value, unit), name]}
              labelFormatter={(label) => `Sprint: ${label}`}
              contentStyle={{
                borderRadius: 8,
                borderColor: '#CBD5E1',
                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: 12 }} />
            {series.map((developer, index) => (
              <Bar
                key={developer.key}
                dataKey={developer.key}
                name={developer.label}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                radius={[5, 5, 0, 0]}
                maxBarSize={54}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
