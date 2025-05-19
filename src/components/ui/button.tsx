
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden will-change-transform transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-nutri-blue text-white hover:bg-white hover:text-nutri-blue border border-nutri-blue hover:shadow-md active:scale-[0.98]",
        primary: "bg-nutri-green text-white hover:bg-white hover:text-nutri-green border border-nutri-green hover:shadow-md active:scale-[0.98]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md active:scale-[0.98]",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-md active:scale-[0.98]",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md active:scale-[0.98]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        nutri: "bg-nutri-green text-white hover:bg-white hover:text-nutri-green border border-nutri-green hover:shadow-md active:scale-[0.98]",
        "nutri-blue": "bg-nutri-blue text-white hover:bg-white hover:text-nutri-blue border border-nutri-blue hover:shadow-md active:scale-[0.98]",
        "nutri-outline": "border border-nutri-green text-nutri-green bg-white hover:bg-nutri-green/10 hover:shadow-md active:scale-[0.98]",
        "nutri-outline-blue": "border border-nutri-blue text-nutri-blue bg-white hover:bg-nutri-blue/10 hover:shadow-md active:scale-[0.98]",
        subscription: "bg-gradient-to-r from-nutri-blue-light to-nutri-blue-dark text-white hover:shadow-lg hover:translate-y-[-2px] active:translate-y-0 active:shadow-md active:scale-[0.98] border border-blue-400",
        "subscription-green": "bg-gradient-to-r from-nutri-green-light to-nutri-green-dark text-white hover:shadow-lg hover:translate-y-[-2px] active:translate-y-0 active:shadow-md active:scale-[0.98] border border-green-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      animation: {
        default: "",
        shimmer: "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer after:bg-[length:200%_100%] after:opacity-0 hover:after:opacity-100",
        pulse: "animate-pulse-soft",
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
