import React from "react";
import {useAuth} from "@/contexts/auth/AuthContext";
import {usePatient} from "@/contexts/patient/PatientContext";
import Navbar from "@/components/Navbar";

// Import our components
import {BreadcrumbNav} from "@/components/ui/breadcrumb-nav";
import {TourGuide} from "@/components/tour-guide/TourGuide";
import {SidebarProvider, SidebarTrigger, SidebarInset} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/sidebar/AppSidebar";

const Layout: React.FC<{children: React.ReactNode}> = ({children}) => {
	const {user} = useAuth();
	const {activePatient, sessionData} = usePatient();

	return (
		<SidebarProvider defaultOpen={false}>
			<div className="flex min-h-screen w-full bg-background text-foreground">
				<AppSidebar />
				
				<SidebarInset className="flex flex-col flex-1">
					<TourGuide />

					{/* Header with Navbar and Sidebar Trigger */}
					<div className="flex items-center">
						<SidebarTrigger className="ml-2 md:ml-4" />
						<div className="flex-1">
							<Navbar />
						</div>
					</div>

					{/* Active Patient Indicator */}
					{activePatient && sessionData.consultationActive && (
						<div className="bg-nutri-green text-white px-4 py-2 text-sm">
							<div className="container mx-auto flex items-center justify-between">
								<span>
									🩺 Atendimento ativo: <strong>{activePatient.name}</strong>
								</span>
								<span className="text-xs opacity-75">Etapa: {sessionData.currentStep}</span>
							</div>
						</div>
					)}

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
								© {new Date().getFullYear()} NutriFlow Pro. Todos os direitos reservados.
							</p>
						</div>
					</footer>
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
};

export default Layout;
