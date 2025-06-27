import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'google' | 'secondary';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...props }) => {
  const baseStyle = "w-full py-2 rounded-md font-medium transition-colors";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    google: "bg-white border border-gray-300 text-black hover:bg-gray-100",
    secondary: "bg-gray-600 text-white hover:bg-gray-700"
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]}`}
      {...props} // <-- includes type, onClick, etc.
    >
      {children}
    </button>
  );
};

export default Button;
