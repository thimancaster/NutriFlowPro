
import React from "react";
import {Button} from "@/components/ui/button";
import {Menu, X} from "lucide-react";

interface MobileMenuButtonProps {
	isOpen: boolean;
	onClick: () => void;
}

export const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
	isOpen,
	onClick,
}) => {
	return (
		<Button
			variant="ghost"
			size="icon"
			className="md:hidden text-foreground hover:bg-accent transition-all duration-200 hover:scale-105"
			onClick={onClick}>
			{isOpen ? (
				<X className="h-6 w-6" />
			) : (
				<Menu className="h-6 w-6" />
			)}
		</Button>
	);
};
