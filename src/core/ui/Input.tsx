import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "~/core/utils";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, type, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-text-muted text-xs font-medium uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={isPassword && show ? "text" : type}
            className={cn(
              "rounded-lg border border-input-border bg-input-bg px-4 py-3 text-text-main text-sm outline-none transition-all w-full",
              "placeholder:text-text-muted/50",
              "focus:border-accent focus:ring-2 focus:ring-ring",
              "min-h-[44px]",
              isPassword && "pr-12",
              error && "border-error focus:border-error focus:ring-error/30",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
              tabIndex={-1}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
