import React, {memo, useMemo} from "react";
import {Link, useLocation} from "react-router-dom";
import {LucideIcon, ChevronDown} from "lucide-react";
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
	maxVisible?: number;
}

const NavbarDesktopNavigation: React.FC<NavbarDesktopNavigationProps> = memo(
	({navigationItems, maxVisible = 4}) => {
		const location = useLocation();

		// Split items into visible and overflow
		const {visibleItems, overflowItems} = useMemo(() => {
			if (navigationItems.length <= maxVisible) {
				return {visibleItems: navigationItems, overflowItems: []};
			}
			return {
				visibleItems: navigationItems.slice(0, maxVisible),
				overflowItems: navigationItems.slice(maxVisible),
			};
		}, [navigationItems, maxVisible]);

		const isItemActive = (href: string) =>
			location.pathname === href ||
			(href !== "/dashboard" && location.pathname.startsWith(href));

		const renderNavigationItem = (item: NavigationItem, isInDropdown = false) => {
			const Icon = item.icon;
			const isActive = isItemActive(item.href);

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
					className={`inline-flex items-center px-2 lg:px-3 py-1.5 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
						isActive
							? "bg-nutri-green text-white"
							: "text-gray-700 hover:bg-gray-100 hover:text-nutri-blue dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-nutri-blue"
					}`}>
					<Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 mr-1 lg:mr-2 flex-shrink-0" />
					<span className="hidden lg:inline">{item.name}</span>
					<span className="lg:hidden">
						{item.name.length > 8 ? item.name.slice(0, 6) + "..." : item.name}
					</span>
				</Link>
			);
		};

		// Check if any overflow item is active
		const hasActiveOverflow = overflowItems.some((item) => isItemActive(item.href));

		return (
			<div className="hidden md:ml-2 lg:ml-4 md:flex items-center md:space-x-0.5 lg:space-x-1 xl:space-x-2 flex-shrink-0">
				{visibleItems.map((item) => renderNavigationItem(item))}

				{overflowItems.length > 0 && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								className={`inline-flex items-center px-2 lg:px-3 py-1.5 lg:py-2 rounded-md text-xs lg:text-sm font-medium transition-colors duration-200 ${
									hasActiveOverflow
										? "bg-nutri-green text-white"
										: "text-gray-700 hover:bg-gray-100 hover:text-nutri-blue dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-nutri-blue"
								}`}>
								<span className="hidden lg:inline">Mais</span>
								<span className="lg:hidden">+</span>
								<ChevronDown className="h-3.5 w-3.5 lg:h-4 lg:w-4 ml-1" />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-48 bg-background border shadow-lg z-50">
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
