
import React from "react";
import {BreadcrumbNav} from "@/components/ui/breadcrumb-nav";
import {ThemeProvider} from "@/hooks/theme/use-theme-provider";
import {TourGuide} from "@/components/tour-guide/TourGuide";
import {HeaderSection} from "./layout/HeaderSection";
import {MobileMenu} from "./layout/MobileMenu";
import {Footer} from "./layout/Footer";

const Layout: React.FC<{children: React.ReactNode}> = ({children}) => {
	const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	return (
		<ThemeProvider>
			<div className="flex flex-col min-h-screen bg-background text-foreground">
				<TourGuide />

				<HeaderSection 
					mobileMenuOpen={mobileMenuOpen}
					toggleMobileMenu={toggleMobileMenu}
				/>

				<MobileMenu 
					isOpen={mobileMenuOpen}
					onClose={() => setMobileMenuOpen(false)}
				/>

				{/* Main content */}
				<main className="flex-1 bg-background">
					<div className="container mx-auto px-4 py-6">
						<BreadcrumbNav />
						{children}
					</div>
				</main>

				<Footer />
			</div>
		</ThemeProvider>
	);
};

export default Layout;
