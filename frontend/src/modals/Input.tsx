import React from "react";

interface InputProps {
  type: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string; 
  className?: string;
}

const Input: React.FC<InputProps> = ({ type, placeholder, value, onChange, error }) => {
  return (
    <div className="space-y-1">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 border ${
          error ? "border-red-500" : "border-black-600"
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500`}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Input;
