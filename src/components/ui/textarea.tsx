
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
          // Cores harmonizadas para modo claro
          "text-foreground placeholder:text-muted-foreground",
          "border-border hover:border-primary/50 focus:border-primary",
          // Efeitos de hover e focus modernos
          "transition-all duration-300",
          "hover:shadow-sm hover:bg-gradient-to-br hover:from-transparent hover:to-primary/5 hover:scale-[1.01]",
          "focus:bg-gradient-to-br focus:from-primary/5 focus:to-transparent focus:scale-[1.02] focus:shadow-md",
          "dark:hover:border-dark-accent-green dark:hover:to-dark-accent-green/5",
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
