// src/components/charts/GenericLineChart.tsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const GenericLineChart: React.FC<{
  data: any[];
  dataKey: string;
  yLabel?: string;
}> = ({ data, dataKey, yLabel }) => {
  // Recharts expects an array of objects with keys. Our backend supplies label + keys.
  const formatted = (data || []).map((d) => ({
    name: d.label,
    value: d[dataKey] ?? 0,
  }));

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: any) => (yLabel ? `${value} ${yLabel}` : value)} />
          <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenericLineChart;
