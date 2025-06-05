
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // Cores específicas para tema claro
          "text-foreground placeholder:text-muted-foreground",
          // Garantir contraste no tema claro
          ":root:not(.dark) & { color: rgb(17 24 39); }",
          ":root:not(.dark) &::placeholder { color: rgb(107 114 128); opacity: 1; }",
          // Efeitos de hover e focus modernos
          "magnetic-hover ripple-effect transition-all duration-300",
          "hover:border-nutri-green hover:shadow-md hover:bg-gradient-to-br hover:from-transparent hover:to-nutri-green/5 hover:scale-[1.01]",
          "dark:hover:border-dark-accent-green dark:hover:to-dark-accent-green/5",
          "focus:border-nutri-blue focus:bg-gradient-to-br focus:from-nutri-blue/5 focus:to-transparent focus:scale-[1.02]",
          "dark:focus:border-nutri-blue dark:focus:from-nutri-blue/5",
          "resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
