
import React from "react";
import {Link, useLocation} from "react-router-dom";
import {cn} from "@/lib/utils";

const navigation = [
	{name: "Dashboard", href: "/dashboard", className: "dashboard-section", exact: true},
	{name: "Pacientes", href: "/patients", className: "patients-link"},
	{name: "Calculadora", href: "/calculator", className: "calculator-link", exact: true},
	{name: "Planos Alimentares", href: "/meal-plans", className: "meal-plans-link"},
	{name: "Agendamentos", href: "/appointments", className: "appointments-link", exact: true},
];

interface MobileMenuProps {
	isOpen: boolean;
	onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({isOpen, onClose}) => {
	const location = useLocation();

	const isActive = (itemHref: string, isExact?: boolean) => {
		if (isExact || itemHref === "/") {
			return location.pathname === itemHref;
		}

		if (location.pathname.startsWith(itemHref)) {
			if (location.pathname === itemHref) return true;
			const afterHref = location.pathname.substring(itemHref.length);
			if (afterHref.startsWith("/")) {
				return true;
			}
		}
		return false;
	};

	if (!isOpen) return null;

	return (
		<div className="md:hidden py-4 px-4 border-t border-border bg-background/95 backdrop-blur-md">
			<nav className="flex flex-col space-y-2">
				{navigation.map((item) => (
					<Link
						key={item.name}
						to={item.href}
						className={cn(
							"text-sm font-medium transition-all duration-200 p-3 rounded-md",
							isActive(item.href, item.exact)
								? "bg-primary/10 text-primary"
								: "text-muted-foreground hover:text-foreground hover:bg-accent",
							item.className
						)}
						onClick={onClose}>
						{item.name}
					</Link>
				))}
			</nav>
		</div>
	);
};
