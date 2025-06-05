
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden will-change-transform transition-all duration-300 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "bg-nutri-blue text-white hover:bg-white hover:text-nutri-blue border border-nutri-blue hover:shadow-md active:scale-[0.98] dark:bg-nutri-blue dark:hover:bg-nutri-blue/90 dark:border-nutri-blue/50 dark:shadow-dark-glow dark:hover:shadow-dark-glow-blue",
        primary: "bg-nutri-green text-white hover:bg-white hover:text-nutri-green border border-nutri-green hover:shadow-md active:scale-[0.98] dark:bg-dark-accent-green dark:text-dark-bg-primary dark:hover:bg-dark-accent-green/90 dark:border-dark-accent-green/50 dark:shadow-dark-glow dark:hover:shadow-dark-glow",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md active:scale-[0.98] dark:shadow-dark-md dark:hover:shadow-dark-lg",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-md active:scale-[0.98] dark:border-dark-border-secondary dark:bg-dark-bg-elevated/50 dark:hover:bg-dark-bg-surface dark:text-dark-text-primary dark:hover:border-dark-border-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md active:scale-[0.98] dark:bg-dark-bg-surface dark:text-dark-text-primary dark:hover:bg-dark-bg-elevated dark:border dark:border-dark-border-subtle",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-dark-bg-elevated/60 dark:text-dark-text-primary transition-colors duration-200",
        link: "text-primary underline-offset-4 hover:underline dark:text-dark-accent-green",
        nutri: "bg-nutri-green text-white hover:bg-white hover:text-nutri-green border border-nutri-green hover:shadow-md active:scale-[0.98] dark:bg-dark-accent-green dark:text-dark-bg-primary dark:hover:bg-dark-accent-green/90 dark:shadow-dark-glow",
        "nutri-blue": "bg-nutri-blue text-white hover:bg-white hover:text-nutri-blue border border-nutri-blue hover:shadow-md active:scale-[0.98] dark:bg-nutri-blue dark:hover:bg-nutri-blue/90 dark:shadow-dark-glow-blue",
        "nutri-outline": "border border-nutri-green text-nutri-green bg-white hover:bg-nutri-green/10 hover:shadow-md active:scale-[0.98] dark:border-dark-accent-green dark:text-dark-accent-green dark:bg-transparent dark:hover:bg-dark-accent-green/10",
        "nutri-outline-blue": "border border-nutri-blue text-nutri-blue bg-white hover:bg-nutri-blue/10 hover:shadow-md active:scale-[0.98] dark:border-nutri-blue dark:text-nutri-blue dark:bg-transparent dark:hover:bg-nutri-blue/10",
        subscription: "bg-gradient-to-r from-nutri-blue-light to-nutri-blue-dark text-white hover:shadow-lg hover:translate-y-[-2px] active:translate-y-0 active:shadow-md active:scale-[0.98] border border-blue-400 dark:shadow-dark-glow-blue dark:hover:shadow-dark-glow-blue",
        "subscription-green": "bg-gradient-to-r from-nutri-green-light to-nutri-green-dark text-white hover:shadow-lg hover:translate-y-[-2px] active:translate-y-0 active:shadow-md active:scale-[0.98] border border-green-400 dark:from-dark-accent-green dark:to-emerald-500 dark:shadow-dark-glow dark:hover:shadow-dark-glow",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      animation: {
        default: "",
        shimmer: "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer after:bg-[length:200%_100%] after:opacity-0 hover:after:opacity-100 dark:after:via-dark-accent-green/20",
        pulse: "animate-pulse-soft",
        glow: "dark:animate-glow",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, animation, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
