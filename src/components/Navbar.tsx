import React, {memo, useMemo, useCallback} from "react";
import {Link} from "react-router-dom";
import {useAuth} from "@/contexts/auth/AuthContext";
import {ThemeToggle} from "@/components/ui/theme-toggle";
import {NavbarUserMenu} from "./navbar/index";
import NotificationBell from "./notifications/NotificationBell";
import GlobalSearch from "./search/GlobalSearch";

/**
 * Simplified Navbar - utilities only
 * Main navigation moved to AppSidebar for unified experience
 */
const Navbar = memo(() => {
	const {logout} = useAuth();

	const handleLogout = useCallback(async () => {
		try {
			await logout();
		} catch (error) {
			console.error("Error logging out:", error);
		}
	}, [logout]);

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
		<nav className="bg-background border-b border-border sticky top-0 z-50 w-full">
			<div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
				<div className="flex justify-between items-center h-14 w-full gap-2">
					{/* Left side - Logo only */}
					<div className="flex items-center gap-2">
						<div className="flex-shrink-0 flex items-center">
							{logoElement}
						</div>
					</div>

					{/* Right side - Search, Notifications, Theme toggle and User menu */}
					<div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
						{/* Global Search */}
						<GlobalSearch />

						{/* Notifications */}
						<NotificationBell />

						<div className="flex items-center h-9">
							<ThemeToggle />
						</div>

						<NavbarUserMenu onLogout={handleLogout} />
					</div>
				</div>
			</div>
		</nav>
	);
});

Navbar.displayName = "Navbar";

export default Navbar;
