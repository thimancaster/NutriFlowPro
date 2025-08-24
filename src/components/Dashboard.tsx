import React, {Suspense} from "react";
import DashboardHero from "./DashboardHero";
import DashboardSummaryCards from "./DashboardSummaryCards";
import DashboardRecentPatients from "./DashboardRecentPatients";
import DashboardQuickActions from "./DashboardQuickActions";
import DashboardTestimonials from "./DashboardTestimonials";
import ConsultationHeader from "./ConsultationHeader";
import {motion} from "framer-motion";
import {Skeleton} from "@/components/ui/skeleton";
import {useConsultationData} from "@/contexts/ConsultationDataContext";
import {useDashboardData} from "@/hooks/useDashboardData";
import {useAuth} from "@/contexts/auth/AuthContext";

// Loading fallback com design refinado
const LoadingFallback = () => (
	<div className="w-full p-6 bg-card rounded-xl border shadow-sm backdrop-blur-sm dark:bg-dark-bg-card dark:border-dark-border-primary dark:shadow-dark-md">
		<Skeleton className="h-6 w-1/3 mb-4 bg-gray-200 dark:bg-dark-bg-surface" />
		<Skeleton className="h-32 w-full bg-gray-200 dark:bg-dark-bg-surface" />
	</div>
);

// Animações de entrada refinadas
const containerVariants = {
	hidden: {opacity: 0},
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: {
		opacity: 0,
		y: 20,
		scale: 0.95,
	},
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: {
			duration: 0.3,
		},
	},
};

const Dashboard = () => {
	// Use try-catch to handle contexts that might not be available
	let isConsultationActive = false;
	try {
		const context = useConsultationData();
		isConsultationActive = context.isConsultationActive;
	} catch {
		// Context not available, use default values
		isConsultationActive = false;
	}

	const {user} = useAuth();

	// Use the dashboard data hook with user ID
	const {isLoading, error, dashboardData} = useDashboardData(user?.id);

	// Compute derived values to match the expected props for DashboardSummaryCards
	const totalPatients = dashboardData?.patientCount || 0;
	const appointmentsToday = dashboardData?.todayAppointments?.length || 0;
	const activePlans = dashboardData?.activePlans || 0;

	return (
		<div className="min-h-screen bg-background">
			<motion.div
				className="space-y-8"
				variants={containerVariants}
				initial="hidden"
				animate="visible">
				{/* Cabeçalho de consulta com animação suave */}
				{isConsultationActive && (
					<motion.div variants={itemVariants}>
						<ConsultationHeader currentStep="dashboard" />
					</motion.div>
				)}

				{/* Hero section com efeito de brilho */}
				<motion.div variants={itemVariants} className="glow-on-hover">
					<DashboardHero />
				</motion.div>

				{/* Cards de resumo com loading aprimorado */}
				<motion.div
					variants={itemVariants}
					className="[&:hover]:transform-none [&:hover]:shadow-none">
					<Suspense fallback={<LoadingFallback />}>
						<DashboardSummaryCards
							totalPatients={totalPatients}
							appointmentsToday={appointmentsToday}
							activePlans={activePlans}
							isLoading={isLoading}
						/>
					</Suspense>
				</motion.div>

				{/* Pacientes recentes com animação de entrada */}
				<motion.div variants={itemVariants} className="hover-lift">
					<Suspense fallback={<LoadingFallback />}>
						<DashboardRecentPatients />
					</Suspense>
				</motion.div>

				{/* Ações rápidas com efeito hover */}
				<motion.div variants={itemVariants} className="hover-scale">
					<DashboardQuickActions />
				</motion.div>

				{/* Depoimentos com design refinado */}
				<motion.div variants={itemVariants} className="hover-lift">
					<DashboardTestimonials />
				</motion.div>
			</motion.div>

			{/* Efeito de gradiente sutil no fundo - só no modo escuro */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden dark:block hidden">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-dark-accent-green/5 rounded-full blur-3xl animate-pulse-soft" />
				<div
					className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-nutri-blue/5 rounded-full blur-3xl animate-pulse-soft"
					style={{animationDelay: "1s"}}
				/>
			</div>
		</div>
	);
};

export default Dashboard;
