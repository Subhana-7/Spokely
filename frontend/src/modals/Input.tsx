import React from 'react';

interface InputProps {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const Input: React.FC<InputProps> = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  className = '' 
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 bg-white/90 border border-white/50 rounded-xl text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white transition-all ${className}`}
    />
  );
};

export default Input;