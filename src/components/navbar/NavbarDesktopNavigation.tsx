import React, {memo, useMemo, useState, useEffect, useRef} from "react";
import {Link, useLocation} from "react-router-dom";
import {LucideIcon, ChevronDown} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationItem {
	name: string;
	href: string;
	icon: LucideIcon;
}

interface NavbarDesktopNavigationProps {
	navigationItems: NavigationItem[];
}

const NavbarDesktopNavigation: React.FC<NavbarDesktopNavigationProps> = memo(
	({navigationItems}) => {
		const location = useLocation();
		const navRef = useRef<HTMLDivElement>(null);
		const [visibleItems, setVisibleItems] = useState<NavigationItem[]>(navigationItems);
		const [overflowItems, setOverflowItems] = useState<NavigationItem[]>([]);

		// Define item groups for better organization
		const itemGroups = useMemo(() => {
			const primary = ["Dashboard", "Pacientes", "Agendamentos", "Calculadora"]; // Core tools always visible
			const clinical = ["Plano Alimentar", "Consulta", "Clínico"]; // Clinical workflow group

			return {
				primary: navigationItems.filter((item) => primary.includes(item.name)),
				clinical: navigationItems.filter((item) => clinical.includes(item.name)),
			};
		}, [navigationItems]);

		// Check for overflow and adjust visible items
		useEffect(() => {
			const checkOverflow = () => {
				// For now, let's force the dropdown to always show to test it
				setVisibleItems(itemGroups.primary);
				setOverflowItems([...itemGroups.clinical]);

				console.log("Primary items:", itemGroups.primary);
				console.log("Clinical items:", itemGroups.clinical);
				console.log("Overflow items set to:", itemGroups.clinical);
			};

			checkOverflow();
			window.addEventListener("resize", checkOverflow);
			return () => window.removeEventListener("resize", checkOverflow);
		}, [navigationItems, itemGroups]);

		const renderNavigationItem = (item: NavigationItem, isInDropdown = false) => {
			const Icon = item.icon;
			const isActive =
				location.pathname === item.href ||
				(item.href !== "/dashboard" && location.pathname.startsWith(item.href));

			if (isInDropdown) {
				return (
					<DropdownMenuItem key={item.name} asChild>
						<Link
							to={item.href}
							className={`flex items-center px-2 py-2 text-sm w-full ${
								isActive ? "bg-nutri-green/10 text-nutri-green" : "hover:bg-muted"
							}`}>
							<Icon className="h-4 w-4 mr-2" />
							{item.name}
						</Link>
					</DropdownMenuItem>
				);
			}

			return (
				<Link
					key={item.name}
					to={item.href}
					className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
						isActive
							? "bg-nutri-green text-white"
							: "text-gray-700 hover:bg-gray-100 hover:text-nutri-blue dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-nutri-blue"
					}`}>
					<Icon className="h-4 w-4 mr-2 flex-shrink-0" />
					<span>{item.name}</span>
				</Link>
			);
		};

		// Check if any overflow item is active
		const hasActiveOverflow = overflowItems.some(
			(item) =>
				location.pathname === item.href ||
				(item.href !== "/dashboard" && location.pathname.startsWith(item.href))
		);

		return (
			<div
				ref={navRef}
				className="hidden md:ml-2 lg:ml-4 md:flex items-center md:space-x-1 lg:space-x-3 xl:space-x-4 overflow-hidden max-w-full">
				{visibleItems.map((item) => renderNavigationItem(item))}

				{overflowItems.length > 0 && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="sm"
								className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:outline-none data-[state=open]:ring-0 ${
									hasActiveOverflow
										? "bg-nutri-green text-white"
										: "text-gray-700 hover:bg-gray-100 hover:text-nutri-blue dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-nutri-blue"
								}`}
								onMouseEnter={(e) => {
									// Trigger dropdown on hover
									const trigger = e.currentTarget;
									setTimeout(() => trigger.click(), 100);
								}}
								onBlur={(e) => {
									// Remove focus after interaction
									e.currentTarget.blur();
								}}
								style={{boxShadow: "none"}}>
								<span>Clínico</span>
								<ChevronDown className="h-4 w-4 ml-1" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-48"
							onMouseLeave={(e) => {
								// Close dropdown when mouse leaves
								const trigger = e.currentTarget.closest(
									"[data-radix-dropdown-menu-content]"
								);
								if (trigger) {
									document.dispatchEvent(
										new KeyboardEvent("keydown", {key: "Escape"})
									);
								}
							}}>
							{overflowItems.map((item) => renderNavigationItem(item, true))}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		);
	}
);

NavbarDesktopNavigation.displayName = "NavbarDesktopNavigation";

export default NavbarDesktopNavigation;
