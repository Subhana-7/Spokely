import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'upcoming' | 'completed' | 'private' | 'public' | 'peer' | 'mentor' |'pending' |'accepted' | 'cancelled';
  size?: 'sm' | 'md';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'upcoming', 
  size = 'md',
  className = '' 
}) => {
  const baseClasses = "inline-flex items-center rounded-full font-semibold text-center transition-colors";

  const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  upcoming: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  private: "bg-orange-100 text-orange-800",
  public: "bg-purple-100 text-purple-800",
  peer: "bg-lime-100 text-lime-800",
  mentor: "bg-indigo-100 text-indigo-800",
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};


  const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm"
  };

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].join(' ');

  return (
    <span className={combinedClasses}>
      {children}
    </span>
  );
};

export default Badge;
