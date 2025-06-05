
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover-lift" | "magnetic" | "depth" | "glow";
  interactive?: boolean;
}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant = "default", interactive = false, children, ...props }, ref) => {
    const cardVariants = {
      default: "rounded-lg border bg-card text-card-foreground shadow-sm",
      "hover-lift": "rounded-lg border bg-card text-card-foreground shadow-sm smooth-lift magnetic-hover",
      magnetic: "rounded-lg border bg-card text-card-foreground shadow-sm magnetic-hover gradient-shift",
      depth: "rounded-lg border bg-card text-card-foreground shadow-sm depth-3d colored-shadow-lift",
      glow: "rounded-lg border bg-card text-card-foreground shadow-sm soft-pulse animated-border"
    };

    const interactiveStyles = interactive 
      ? "cursor-pointer ripple-effect hover:scale-[1.02] transition-all duration-300"
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants[variant],
          interactiveStyles,
          // Efeitos específicos para tema escuro
          "dark:bg-dark-bg-card dark:border-dark-border-primary dark:shadow-dark-lg",
          "hover:dark:shadow-dark-xl",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ModernCard.displayName = "ModernCard"

const ModernCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
ModernCardHeader.displayName = "ModernCardHeader"

const ModernCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-glow-hover",
      className
    )}
    {...props}
  />
))
ModernCardTitle.displayName = "ModernCardTitle"

const ModernCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground transition-colors duration-300", className)}
    {...props}
  />
))
ModernCardDescription.displayName = "ModernCardDescription"

const ModernCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
ModernCardContent.displayName = "ModernCardContent"

const ModernCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
ModernCardFooter.displayName = "ModernCardFooter"

export { 
  ModernCard, 
  ModernCardHeader, 
  ModernCardFooter, 
  ModernCardTitle, 
  ModernCardDescription, 
  ModernCardContent 
}
