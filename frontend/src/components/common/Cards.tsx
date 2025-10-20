import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "info";
  padding?: "sm" | "md" | "lg";
}

const SpokelyCard: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "primary",
  padding = "md",
}) => {
  const baseClasses =
    "bg-white text-black rounded-2xl border border-yellow-500 shadow-md transition-all duration-200 hover:shadow-lg";

  const variantClasses: Record<NonNullable<CardProps["variant"]>, string> = {
    primary: "",
    secondary: "bg-gray-100",
    info: "bg-gray-50",
  };

  const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    className,
  ].join(" ");

  return <div className={combinedClasses}>{children}</div>;
};

export default SpokelyCard;
