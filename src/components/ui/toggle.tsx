import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import {cva, type VariantProps} from "class-variance-authority";

import {cn} from "@/lib/utils";

const toggleVariants = cva(
	"inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted/80 hover:text-muted-foreground hover:backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent/90 data-[state=on]:text-accent-foreground data-[state=on]:backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md dark:hover:bg-dark-bg-surface/80 dark:data-[state=on]:bg-dark-accent-green/90",
	{
		variants: {
			variant: {
				default: "bg-transparent dark:text-dark-text-primary",
				outline:
					"border border-input/80 bg-transparent hover:bg-accent/80 hover:text-accent-foreground hover:backdrop-blur-sm dark:border-dark-border-primary/80 dark:hover:bg-dark-bg-surface/80 dark:text-dark-text-primary",
				nutri: "bg-nutri-green/90 text-white hover:bg-white/95 hover:text-nutri-green border border-nutri-green backdrop-blur-sm dark:bg-dark-accent-green/90 dark:hover:bg-dark-bg-surface/95 dark:hover:text-dark-accent-green dark:border-dark-accent-green",
				"nutri-blue":
					"bg-nutri-blue/90 text-white hover:bg-white/95 hover:text-nutri-blue border border-nutri-blue backdrop-blur-sm dark:hover:bg-dark-bg-surface/95",
			},
			size: {
				default: "h-10 px-3",
				sm: "h-9 px-2.5",
				lg: "h-11 px-5",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

const Toggle = React.forwardRef<
	React.ElementRef<typeof TogglePrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
		VariantProps<typeof toggleVariants>
>(({className, variant, size, ...props}, ref) => (
	<TogglePrimitive.Root
		ref={ref}
		className={cn(toggleVariants({variant, size, className}))}
		{...props}
	/>
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export {Toggle, toggleVariants};
