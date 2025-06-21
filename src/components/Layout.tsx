import React from "react";
import {Link, useLocation} from "react-router-dom";
import {useAuth} from "@/contexts/auth/AuthContext";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {LogOut, Menu, User, X} from "lucide-react";
import {cn} from "@/lib/utils";

// Import our components
import {BreadcrumbNav} from "@/components/ui/breadcrumb-nav";
import {ThemeToggle} from "@/components/ui/theme-toggle";
import {ThemeProvider} from "@/hooks/theme/use-theme-provider";
import {TourGuide} from "@/components/tour-guide/TourGuide";

const Layout: React.FC<{children: React.ReactNode}> = ({children}) => {
	const {user, logout} = useAuth();
	const location = useLocation();
	const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

	const navigation = [
		{name: "Dashboard", href: "/dashboard", className: "dashboard-section", exact: true},
		{name: "Pacientes", href: "/patients", className: "patients-link"},
		{name: "Calculadora", href: "/calculator", className: "calculator-link", exact: true},
		{name: "Planos Alimentares", href: "/meal-plans", className: "meal-plans-link"},
		{name: "Agendamentos", href: "/appointments", className: "appointments-link", exact: true},
	];

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

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const handleSignOut = async () => {
		await logout();
	};

	return (
		<ThemeProvider>
			<div className="flex flex-col min-h-screen bg-background text-foreground">
				<TourGuide />

				{/* Header com backdrop blur */}
				<header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
					<div className="container mx-auto px-4 flex justify-between items-center h-16">
						<div className="flex items-center">
							<Link to="/dashboard" className="flex items-center group">
								<span className="text-nutri-green dark:text-nutri-green transition-colors duration-200 group-hover:text-nutri-green/80 font-bold text-xl">
									Nutri
								</span>
								<span className="text-nutri-blue dark:text-nutri-blue transition-colors duration-200 group-hover:text-nutri-blue/80 font-bold text-xl">
									Flow
								</span>
								<span className="text-muted-foreground ml-1 text-sm">
									Pro
								</span>
							</Link>
						</div>

						<div className="flex items-center gap-4">
							{/* Navigation */}
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

							{/* User Menu */}
							{user && (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											className="relative h-8 w-8 rounded-full transition-transform duration-200 hover:scale-110">
											<Avatar className="h-8 w-8">
												<AvatarImage
													src={user.user_metadata?.avatar_url || ""}
													alt={user.email || ""}
												/>
												<AvatarFallback className="bg-primary/20 text-primary">
													{user.email?.charAt(0).toUpperCase()}
												</AvatarFallback>
											</Avatar>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										className="w-56 bg-popover text-popover-foreground border border-border shadow-lg z-50"
										align="end"
										forceMount>
										<DropdownMenuLabel className="font-normal">
											<div className="flex flex-col space-y-1">
												<p className="text-sm font-medium leading-none text-foreground">
													{user.user_metadata?.name || user.email}
												</p>
												<p className="text-xs leading-none text-muted-foreground">
													{user.email}
												</p>
											</div>
										</DropdownMenuLabel>
										<DropdownMenuSeparator className="border-border" />
										<DropdownMenuItem asChild>
											<Link
												to="/profile"
												className="cursor-pointer text-foreground hover:bg-accent transition-colors duration-200">
												<User className="mr-2 h-4 w-4" />
												<span>Perfil</span>
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator className="border-border" />
										<DropdownMenuItem
											onClick={handleSignOut}
											className="cursor-pointer text-foreground hover:bg-accent transition-colors duration-200">
											<LogOut className="mr-2 h-4 w-4" />
											<span>Sair</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}

							{/* Mobile menu button */}
							<Button
								variant="ghost"
								size="icon"
								className="md:hidden text-foreground hover:bg-accent transition-all duration-200 hover:scale-105"
								onClick={toggleMobileMenu}>
								{mobileMenuOpen ? (
									<X className="h-6 w-6" />
								) : (
									<Menu className="h-6 w-6" />
								)}
							</Button>

							{/* Theme toggle */}
							<ThemeToggle />
						</div>
					</div>

					{/* Mobile Navigation */}
					{mobileMenuOpen && (
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
										onClick={() => setMobileMenuOpen(false)}>
										{item.name}
									</Link>
								))}
							</nav>
						</div>
					)}
				</header>

				{/* Main content */}
				<main className="flex-1 bg-background">
					<div className="container mx-auto px-4 py-6">
						<BreadcrumbNav />
						{children}
					</div>
				</main>

				{/* Footer */}
				<footer className="border-t border-border py-6 text-center text-sm text-muted-foreground bg-background/80 backdrop-blur-md">
					<div className="container mx-auto px-4">
						<p className="text-muted-foreground">
							© {new Date().getFullYear()} NutriFlow Pro. Todos os direitos
							reservados.
						</p>
					</div>
				</footer>
			</div>
		</ThemeProvider>
	);
};

export default Layout;
