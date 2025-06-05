import * as React from "react";

import {cn} from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({className, ...props}, ref) => {
		return (
			<textarea
				className={cn(
					"flex min-h-[80px] w-full rounded-md border border-input/80 bg-background/95 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
					// Dark mode enhancements
					"dark:bg-dark-bg-elevated/95 dark:border-dark-border-primary/80 dark:text-dark-text-primary dark:placeholder:text-dark-text-secondary",
					// Modern effects with transparency
					"transition-all duration-300",
					"hover:border-primary/60 hover:shadow-md hover:bg-background/98 hover:backdrop-blur-md",
					"dark:hover:border-dark-accent-green/60 dark:hover:bg-dark-bg-elevated/98",
					"focus:border-primary focus:bg-background/98 focus:backdrop-blur-md focus:shadow-lg",
					"dark:focus:border-dark-accent-green dark:focus:bg-dark-bg-elevated/98",
					"resize-none",
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Textarea.displayName = "Textarea";

export {Textarea};
