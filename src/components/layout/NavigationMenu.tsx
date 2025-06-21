
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

export const NavigationMenu: React.FC = () => {
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

	return (
		<nav className="hidden md:flex space-x-2">
			{navigation.map((item) => (
				<Link
					key={item.name}
					to={item.href}
					className={cn(
						"text-sm font-medium transition-all duration-200 px-3 py-2 rounded-md",
						isActive(item.href, item.exact)
							? "text-primary bg-primary/10 shadow-sm"
							: "text-muted-foreground hover:text-foreground hover:bg-accent",
						item.className
					)}>
					<span className="relative z-10">{item.name}</span>
				</Link>
			))}
		</nav>
	);
};
