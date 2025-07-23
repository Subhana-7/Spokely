import React from "react";

interface InputProps {
  type: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  className?: string;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
}

const Input: React.FC<InputProps> = ({
  type,
  placeholder,
  value,
  onChange,
  error,
  className = "",
  rightIcon,
  onRightIconClick,
}) => {
  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-2 border ${
            error ? "border-red-500" : "border-black-600"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10 ${className}`}
        />
        {rightIcon && (
          <div
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 cursor-pointer"
            onClick={onRightIconClick}
          >
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Input;
