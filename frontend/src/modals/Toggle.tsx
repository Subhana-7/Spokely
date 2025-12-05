import React from "react";

interface ToggleOption {
  value: string;
  label: string;
}

interface ToggleProps {
  options: ToggleOption[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  options,
  selected,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex bg-white/20 rounded-xl p-1 ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            selected === option.value
              ? "bg-white text-gray-900 shadow-md"
              : "text-gray-800 hover:bg-white/30"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default Toggle;
