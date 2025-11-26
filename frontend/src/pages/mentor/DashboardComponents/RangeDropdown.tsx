// src/components/RangeDropdown.tsx
import React from "react";

const options = [
  { label: "Last 6 months", value: 6 },
  { label: "Last 12 months", value: 12 },
  { label: "Last 24 months", value: 24 },
];

const RangeDropdown: React.FC<{ months: number; setMonths: (m: number) => void }> = ({
  months,
  setMonths,
}) => {
  return (
    <select
      value={months}
      onChange={(e) => setMonths(Number(e.target.value))}
      className="rounded-md px-3 py-2 bg-white text-sm"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
};

export default RangeDropdown;
