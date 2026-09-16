import * as React from "react";

import { cn } from "~/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-border/70 bg-surface/60 px-3.5 py-2.5 text-base shadow-sm placeholder:text-muted-foreground hover:border-border focus-visible:outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:shadow-[0_0_0_0.5px_var(--color-accent-muted)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
