// src/components/charts/ChartGrid.tsx
import React from "react";
import GenericLineChart from "./GenericLineChart";

const ChartGrid: React.FC<{ chartData: any[] }> = ({ chartData }) => {
  // chartData is array: [{ label, sessionsCount, subscriptionsCount, paymentsTotal }, ...]
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 bg-white rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">Sessions (by month)</h2>
        <GenericLineChart
          data={chartData}
          dataKey="sessionsCount"
          yLabel="Sessions"
        />
      </div>

      <div className="p-4 bg-white rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">New Subscriptions</h2>
        <GenericLineChart
          data={chartData}
          dataKey="subscriptionsCount"
          yLabel="Subscriptions"
        />
      </div>

      <div className="p-4 bg-white rounded-xl shadow md:col-span-2">
        <h2 className="text-lg font-semibold mb-2">Earnings</h2>
        <GenericLineChart data={chartData} dataKey="paymentsTotal" yLabel="₹" />
      </div>
    </div>
  );
};

export default ChartGrid;
