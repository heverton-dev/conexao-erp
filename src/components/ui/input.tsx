import * as React from "react";

import { cn } from "~/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-border bg-input-bg px-4 py-2.5",
          "text-sm text-text-main font-medium shadow-sm",
          "transition-all duration-200",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-text-muted/60 placeholder:font-normal",
          "hover:border-accent/30",
          "focus-visible:outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:shadow-[0_0_0_0.5px_var(--color-accent-muted)]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border",
          "aria-invalid:border-error aria-invalid:ring-error/30",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
