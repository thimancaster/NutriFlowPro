
import React from "react";
import {Link} from "react-router-dom";
import {NavigationMenu} from "./NavigationMenu";
import {UserMenu} from "./UserMenu";
import {MobileMenuButton} from "./MobileMenuButton";
import {ThemeToggle} from "@/components/ui/theme-toggle";

interface HeaderSectionProps {
	mobileMenuOpen: boolean;
	toggleMobileMenu: () => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
	mobileMenuOpen,
	toggleMobileMenu,
}) => {
	return (
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
					<NavigationMenu />
					<UserMenu />
					<MobileMenuButton 
						isOpen={mobileMenuOpen}
						onClick={toggleMobileMenu}
					/>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
};
