import React, {useState, memo, useMemo, useCallback} from "react";
import {Link} from "react-router-dom";
import {
	LayoutDashboard,
	Users,
	Calculator,
	Activity,
	Calendar,
	Menu,
	X,
	FileText,
	Trophy,
} from "lucide-react";
import {useAuth} from "@/contexts/auth/AuthContext";
import {Button} from "@/components/ui/button";
import {ThemeToggle} from "@/components/ui/theme-toggle";
import {NavbarDesktopNavigation, NavbarUserMenu, NavbarMobileMenu} from "./navbar/index";
import NotificationBell from "./notifications/NotificationBell";
import GlobalSearch from "./search/GlobalSearch";

// Memoize navigation items to prevent recreation on every render
const navigationItems = [
	{name: "Dashboard", href: "/dashboard", icon: LayoutDashboard},
	{name: "Pacientes", href: "/patients", icon: Users},
	{name: "Agendamentos", href: "/appointments", icon: Calendar},
	{name: "Atendimento", href: "/clinical", icon: Activity},
	{name: "Relatórios", href: "/reports", icon: FileText},
	{name: "Conquistas", href: "/gamification", icon: Trophy},
];

const Navbar = memo(() => {
	const {logout} = useAuth();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const handleLogout = useCallback(async () => {
		try {
			await logout();
		} catch (error) {
			console.error("Error logging out:", error);
		}
	}, [logout]);

	const toggleMobileMenu = useCallback(() => {
		setIsMobileMenuOpen((prev) => !prev);
	}, []);

	const closeMobileMenu = useCallback(() => {
		setIsMobileMenuOpen(false);
	}, []);

	const logoElement = useMemo(
		() => (
			<Link to="/dashboard" className="flex items-center">
				<span className="text-nutri-green font-bold text-xl sm:text-2xl">Nutri</span>
				<span className="text-nutri-blue font-bold text-xl sm:text-2xl">Flow</span>
				<span className="text-nutri-blue font-bold text-xl sm:text-2xl ml-1">Pro</span>
			</Link>
		),
		[]
	);

	return (
		<nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 w-full">
			<div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
				<div className="flex justify-between items-center h-16 w-full gap-2">
					{/* Left side - Logo and Desktop Navigation */}
					<div className="flex items-center gap-1 lg:gap-2">
						<div className="flex-shrink-0 flex items-center">
							{logoElement}
						</div>

						<NavbarDesktopNavigation navigationItems={navigationItems} />
					</div>

					{/* Right side - Search, Notifications, Theme toggle and User menu */}
					<div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
						{/* Global Search */}
						<GlobalSearch />

						{/* Notifications */}
						<NotificationBell />

						<div className="hidden md:flex items-center h-9">
							<ThemeToggle />
						</div>

						<NavbarUserMenu onLogout={handleLogout} />

						{/* Mobile menu button with consistent sizing */}
						<div className="md:hidden">
							<Button
								variant="ghost"
								size="sm"
								onClick={toggleMobileMenu}
								className="inline-flex items-center justify-center p-2 h-9 w-9">
								{isMobileMenuOpen ? (
									<X className="h-5 w-5" />
								) : (
									<Menu className="h-5 w-5" />
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>

			<NavbarMobileMenu
				navigationItems={navigationItems}
				isOpen={isMobileMenuOpen}
				onClose={closeMobileMenu}
			/>
		</nav>
	);
});

Navbar.displayName = "Navbar";

export default Navbar;
