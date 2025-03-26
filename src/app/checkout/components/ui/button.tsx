import * as React from "react";
import { cn } from "../ui/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "link";
  size?: "sm" | "default" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          "active:scale-95", // subtle press effect
          fullWidth && "w-full",
          
          // Variants
          variant === "default" && "bg-primary text-primary-foreground shadow hover:bg-primary/90",
          variant === "destructive" && "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
          variant === "outline" && "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
          variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
          variant === "link" && "text-primary underline-offset-4 hover:underline",
          
          // Sizes
          size === "sm" && "h-8 px-3 text-xs",
          size === "default" && "h-10 px-4 py-2 text-sm",
          size === "lg" && "h-11 px-8 text-base",
          
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className={cn("mr-2 h-4 w-4 animate-spin", size === "sm" && "h-3 w-3")} />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };