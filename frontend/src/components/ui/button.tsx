import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Senior Architecture Pattern: Consistent UI Components 
 * Using forwardRef for proper DOM handling and type safety
 */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-[#2c3b6e] text-white hover:bg-[#1a2544] shadow-sm",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 shadow-sm",
      outline: "border border-slate-200 bg-transparent hover:bg-slate-50",
      ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 py-2",
      lg: "h-11 px-8 text-lg",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
