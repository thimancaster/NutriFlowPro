import * as React from "react";

import {cn} from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
	({className, type, ...props}, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
					"autofill:bg-background autofill:text-foreground",
					"[&:-webkit-autofill]:bg-background [&:-webkit-autofill]:text-foreground",
					"[&:-webkit-autofill]:!bg-white [&:-webkit-autofill:hover]:!bg-white [&:-webkit-autofill:focus]:!bg-white [&:-webkit-autofill:active]:!bg-white",
					// Cores específicas para tema claro
					"text-foreground placeholder:text-muted-foreground",
					// Garantir contraste no tema claro
					":root:not(.dark) & { color: rgb(17 24 39); }",
					":root:not(.dark) &::placeholder { color: rgb(107 114 128); opacity: 1; }",
					// Efeitos de hover e focus modernos
					"magnetic-hover ripple-effect transition-all duration-300",
					"hover:border-nutri-green hover:shadow-md hover:bg-gradient-to-r hover:from-transparent hover:to-nutri-green/5 hover:scale-[1.01]",
					"dark:hover:border-dark-accent-green dark:hover:to-dark-accent-green/5",
					"focus:border-nutri-blue focus:bg-gradient-to-r focus:from-nutri-blue/5 focus:to-transparent focus:scale-[1.02]",
					"dark:focus:border-nutri-blue dark:focus:from-nutri-blue/5",
					className
				)}
				ref={ref}
				{...props}
			/>
		);
	}
);
Input.displayName = "Input";

export {Input};
