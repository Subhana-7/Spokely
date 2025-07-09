import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'info';
  padding?: 'sm' | 'md' | 'lg';
}

const SpokelyCard: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  variant = 'primary',
  padding = 'md'
}) => {
  const baseClasses = "bg-white rounded-2xl border border-gray-100 transition-all duration-200 hover:shadow-md";

  const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
    primary: "shadow-sm",
    secondary: "bg-lime-50 border-lime-200",
    info: "bg-blue-50 border-blue-200"
  };

  const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    className
  ].join(' ');

  return (
    <div className={combinedClasses}>
      {children}
    </div>
  );
};

export default SpokelyCard;
