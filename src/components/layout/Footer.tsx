
import React from "react";

export const Footer: React.FC = () => {
	return (
		<footer className="border-t border-border py-6 text-center text-sm text-muted-foreground bg-background/80 backdrop-blur-md">
			<div className="container mx-auto px-4">
				<p className="text-muted-foreground">
					© {new Date().getFullYear()} NutriFlow Pro. Todos os direitos
					reservados.
				</p>
			</div>
		</footer>
	);
};
