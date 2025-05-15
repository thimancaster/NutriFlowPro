
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"
import { cn } from "@/lib/utils"
import { forwardRef, ElementRef, ComponentPropsWithoutRef } from "react"

const AspectRatio = forwardRef<
  ElementRef<typeof AspectRatioPrimitive.Root>,
  ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root> & {
    animateIn?: boolean;
    className?: string;
  }
>(({ className, animateIn, ...props }, ref) => (
  <AspectRatioPrimitive.Root
    className={cn(
      animateIn ? "animate-scale-in" : "",
      className
    )}
    ref={ref}
    {...props}
  />
))

AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
