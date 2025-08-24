import React from "react";
import {Link} from "react-router-dom";
import {useLocation} from "react-router-dom";
import {LucideIcon} from "lucide-react";
import {ThemeToggle} from "@/components/ui/theme-toggle";

interface NavigationItem {
	name: string;
	href: string;
	icon: LucideIcon;
}

interface NavbarMobileMenuProps {
	navigationItems: NavigationItem[];
	isOpen: boolean;
	onClose: () => void;
}

const NavbarMobileMenu: React.FC<NavbarMobileMenuProps> = ({navigationItems, isOpen, onClose}) => {
	const location = useLocation();

	if (!isOpen) return null;

	return (
		<div className="md:hidden">
			<div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
				{navigationItems.map((item) => {
					const Icon = item.icon;
					const isActive =
						location.pathname === item.href ||
						(item.href !== "/dashboard" && location.pathname.startsWith(item.href));

					return (
						<Link
							key={item.name}
							to={item.href}
							className={`flex items-center px-3 py-3 rounded-md text-base font-medium transition-all duration-200 ${
								isActive
									? "text-nutri-green bg-nutri-green/10 border-l-4 border-nutri-green"
									: "text-gray-600 hover:text-nutri-blue hover:bg-nutri-blue/10 dark:text-gray-400 dark:hover:text-nutri-blue dark:hover:bg-nutri-blue/10"
							}`}
							onClick={onClose}>
							<Icon className="h-5 w-5 mr-3 flex-shrink-0" />
							<span className="truncate">{item.name}</span>
						</Link>
					);
				})}

				{/* Theme toggle for mobile */}
				<div className="px-3 py-3 md:hidden">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
							Tema
						</span>
						<ThemeToggle />
					</div>
				</div>
			</div>
		</div>
	);
};

export default NavbarMobileMenu;
