
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 dark:bg-dark-accent-green dark:text-dark-bg-primary dark:hover:bg-dark-accent-green/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-dark-bg-surface dark:text-dark-text-primary dark:border-dark-border-secondary dark:hover:bg-dark-bg-elevated",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 dark:bg-dark-accent-red dark:text-white",
        outline: "text-foreground dark:text-dark-text-primary dark:border-dark-border-secondary",
        success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200/80 dark:bg-dark-accent-green/20 dark:text-dark-accent-green dark:hover:bg-dark-accent-green/30",
        warning: "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200/80 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30",
        info: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200/80 dark:bg-nutri-blue/20 dark:text-nutri-blue dark:hover:bg-nutri-blue/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
