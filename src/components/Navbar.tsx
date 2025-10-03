import React, {useState, memo, useMemo, useCallback} from "react";
import {Link} from "react-router-dom";
import {
	LayoutDashboard,
	Users,
	Calculator,
	Utensils,
	Stethoscope,
	Activity,
	Calendar,
	Settings,
	Menu,
	X,
} from "lucide-react";
import {useAuth} from "@/contexts/auth/AuthContext";
import {Button} from "@/components/ui/button";
import {ThemeToggle} from "@/components/ui/theme-toggle";
import {NavbarDesktopNavigation, NavbarUserMenu, NavbarMobileMenu} from "./navbar/index";

/**
 * NAVIGATION ITEMS - UNIFIED ARCHITECTURE
 * 
 * ⚠️  DEPRECATED ROUTES REMOVED:
 * - "Consulta" link removed (unified with "Clínico" workflow)
 * 
 * The clinical workflow is now unified under "/app/clinical" route.
 * Old consultation routes redirect to the new unified flow.
 * 
 * @see src/contexts/ClinicalWorkflowContext.tsx - Unified workflow
 * @see src/pages/Consultation.tsx - Redirect stub (legacy compatibility)
 */
const navigationItems = [
	{name: "Dashboard", href: "/app", icon: LayoutDashboard},
	{name: "Pacientes", href: "/app/patients", icon: Users},
	{name: "Agendamentos", href: "/app/appointments", icon: Calendar},
	{name: "Calculadora", href: "/app/calculator", icon: Calculator},
	{name: "Plano Alimentar", href: "/app/meal-plans", icon: Utensils},
	{name: "Clínico", href: "/app/clinical", icon: Activity},
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
		<Link to="/app" className="flex items-center">
			<span className="text-nutri-green font-bold text-xl sm:text-2xl">Nutri</span>
			<span className="text-nutri-blue font-bold text-xl sm:text-2xl">Flow</span>
			<span className="text-nutri-blue font-bold text-xl sm:text-2xl ml-1">Pro</span>
		</Link>
		),
		[]
	);

	return (
		<nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 w-full">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16 w-full">
					{/* Left side - Logo and Desktop Navigation */}
					<div className="flex items-center flex-1 min-w-0">
						<div className="flex-shrink-0 flex items-center mr-2 lg:mr-4">
							{logoElement}
						</div>

						<NavbarDesktopNavigation navigationItems={navigationItems} />
					</div>

					{/* Right side - Theme toggle and User menu */}
					<div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
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
