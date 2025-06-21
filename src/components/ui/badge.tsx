
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 dark:bg-dark-accent-green dark:text-dark-bg-primary dark:hover:bg-dark-accent-green/90 shadow-md",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-dark-bg-surface dark:text-dark-text-primary dark:border-dark-border-secondary dark:hover:bg-dark-bg-elevated shadow-md",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 dark:bg-dark-accent-red dark:text-white shadow-md",
        outline: "text-foreground border-gray-400 dark:text-dark-text-primary dark:border-dark-border-secondary shadow-sm",
        success: "border-transparent bg-green-600 text-white hover:bg-green-700 dark:bg-dark-accent-green/80 dark:text-white dark:hover:bg-dark-accent-green shadow-md font-bold",
        warning: "border-transparent bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500/80 dark:text-white dark:hover:bg-amber-500 shadow-md font-bold",
        info: "border-transparent bg-blue-600 text-white hover:bg-blue-700 dark:bg-nutri-blue/80 dark:text-white dark:hover:bg-nutri-blue shadow-md font-bold",
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
