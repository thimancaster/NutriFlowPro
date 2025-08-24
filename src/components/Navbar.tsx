import React, {useState} from "react";
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

const navigationItems = [
	{name: "Dashboard", href: "/dashboard", icon: LayoutDashboard},
	{name: "Pacientes", href: "/patients", icon: Users},
	{name: "Agendamentos", href: "/appointments", icon: Calendar},
	{name: "Calculadora", href: "/calculator", icon: Calculator},
	{name: "Plano Alimentar", href: "/meal-plan-generator", icon: Utensils},
	{name: "Consulta", href: "/consultation", icon: Stethoscope},
	{name: "Clínico", href: "/clinical", icon: Activity},
	{name: "Configurações", href: "/settings", icon: Settings},
];

const Navbar = () => {
	const {logout} = useAuth();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error("Error logging out:", error);
		}
	};

	return (
		<nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					{/* Logo and Desktop Navigation */}
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<Link to="/dashboard" className="flex items-center">
								<span className="text-nutri-green font-bold text-2xl">Nutri</span>
								<span className="text-nutri-blue font-bold text-2xl">Flow</span>
								<span className="text-nutri-blue font-bold text-2xl ml-1">Pro</span>
							</Link>
						</div>

						<NavbarDesktopNavigation navigationItems={navigationItems} />
					</div>

					{/* Right side - Theme toggle and User menu with improved alignment */}
					<div className="flex items-center gap-4">
						<div className="flex items-center h-9">
							<ThemeToggle />
						</div>

						<NavbarUserMenu onLogout={handleLogout} />

						{/* Mobile menu button with consistent sizing */}
						<div className="md:hidden">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
				onClose={() => setIsMobileMenuOpen(false)}
			/>
		</nav>
	);
};

export default Navbar;
