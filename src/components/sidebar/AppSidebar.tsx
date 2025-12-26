import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
	Calculator,
	CalendarCheck,
	UserPlus,
	FileText,
	Users,
	BarChart3,
	LayoutDashboard,
	Activity,
	Trophy,
	Settings,
	HelpCircle,
	Calendar,
	Stethoscope,
	ChevronRight,
} from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarFooter,
	SidebarSeparator,
	useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePatient } from "@/contexts/patient/PatientContext";
import { Button } from "@/components/ui/button";

// Animation variants with proper types
const itemVariants: Variants = {
	hidden: { opacity: 0, x: -10 },
	visible: (i: number) => ({
		opacity: 1,
		x: 0,
		transition: {
			delay: i * 0.05,
			duration: 0.2,
			ease: [0.4, 0, 0.2, 1],
		},
	}),
};

const iconVariants: Variants = {
	rest: { scale: 1 },
	hover: { 
		scale: 1.15,
		transition: { type: "spring" as const, stiffness: 400, damping: 10 }
	},
};

const activeIndicatorVariants: Variants = {
	initial: { width: 0, opacity: 0 },
	animate: { 
		width: 3, 
		opacity: 1,
		transition: { duration: 0.2 }
	},
	exit: { width: 0, opacity: 0 },
};

// Main navigation items
const mainNavigation = [
	{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ title: "Pacientes", href: "/patients", icon: Users },
	{ title: "Agendamentos", href: "/appointments", icon: Calendar },
	{ title: "Atendimento Clínico", href: "/clinical", icon: Activity },
	{ title: "Relatórios", href: "/reports", icon: BarChart3 },
	{ title: "Conquistas", href: "/gamification", icon: Trophy },
];

// Quick actions
const quickActions = [
	{
		title: "Nova Consulta",
		icon: FileText,
		link: "/clinical",
		color: "text-emerald-600 dark:text-emerald-400",
		bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
		hoverBg: "group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40",
	},
	{
		title: "Agendar",
		icon: CalendarCheck,
		link: "/appointments",
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
		hoverBg: "group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40",
	},
	{
		title: "Novo Paciente",
		icon: UserPlus,
		link: "/patients/new",
		color: "text-purple-600 dark:text-purple-400",
		bgColor: "bg-purple-100 dark:bg-purple-900/30",
		hoverBg: "group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40",
	},
	{
		title: "Calculadora",
		icon: Calculator,
		link: "/calculator",
		color: "text-amber-600 dark:text-amber-400",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
		hoverBg: "group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40",
	},
];

// Footer links
const footerLinks = [
	{ title: "Configurações", href: "/settings", icon: Settings },
	{ title: "Ajuda", href: "/recursos", icon: HelpCircle },
];

// Animated Menu Item Component
const AnimatedMenuItem = ({ 
	item, 
	isActive, 
	index, 
	isCollapsed 
}: { 
	item: typeof mainNavigation[0]; 
	isActive: boolean; 
	index: number;
	isCollapsed: boolean;
}) => {
	return (
		<SidebarMenuItem>
			<motion.div
				custom={index}
				initial="hidden"
				animate="visible"
				variants={itemVariants}
				className="relative"
			>
				<AnimatePresence>
					{isActive && (
						<motion.div
							className="absolute left-0 top-1/2 -translate-y-1/2 h-6 bg-primary rounded-r-full"
							variants={activeIndicatorVariants}
							initial="initial"
							animate="animate"
							exit="exit"
						/>
					)}
				</AnimatePresence>
				<SidebarMenuButton
					asChild
					isActive={isActive}
					tooltip={item.title}
					className="group relative overflow-hidden"
				>
					<Link to={item.href} className="flex items-center gap-3">
						<motion.div
							variants={iconVariants}
							initial="rest"
							whileHover="hover"
							className={cn(
								"flex items-center justify-center",
								isActive && "text-primary"
							)}
						>
							<item.icon className="h-4 w-4" />
						</motion.div>
						{!isCollapsed && (
							<motion.span
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.1 }}
								className={cn(
									"truncate",
									isActive && "font-medium"
								)}
							>
								{item.title}
							</motion.span>
						)}
						{isActive && !isCollapsed && (
							<motion.div
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								className="ml-auto"
							>
								<ChevronRight className="h-4 w-4 text-primary" />
							</motion.div>
						)}
					</Link>
				</SidebarMenuButton>
			</motion.div>
		</SidebarMenuItem>
	);
};

// Animated Quick Action Component
const AnimatedQuickAction = ({ 
	action, 
	isActive, 
	index,
	isCollapsed 
}: { 
	action: typeof quickActions[0]; 
	isActive: boolean; 
	index: number;
	isCollapsed: boolean;
}) => {
	return (
		<SidebarMenuItem>
			<motion.div
				custom={index + mainNavigation.length}
				initial="hidden"
				animate="visible"
				variants={itemVariants}
			>
				<SidebarMenuButton
					asChild
					isActive={isActive}
					tooltip={action.title}
					className="group"
				>
					<Link to={action.link}>
						<motion.div
							whileHover={{ scale: 1.1, rotate: 5 }}
							whileTap={{ scale: 0.95 }}
							transition={{ type: "spring", stiffness: 400, damping: 17 }}
							className={cn(
								"flex h-6 w-6 items-center justify-center rounded-md transition-colors",
								action.bgColor,
								action.hoverBg
							)}
						>
							<action.icon className={cn("h-4 w-4", action.color)} />
						</motion.div>
						{!isCollapsed && (
							<span className="truncate">{action.title}</span>
						)}
					</Link>
				</SidebarMenuButton>
			</motion.div>
		</SidebarMenuItem>
	);
};

export function AppSidebar() {
	const location = useLocation();
	const { state } = useSidebar();
	const { activePatient, sessionData } = usePatient();
	const isCollapsed = state === "collapsed";

	const isActive = (path: string) => {
		if (path === "/dashboard") return location.pathname === path;
		return location.pathname.startsWith(path);
	};

	return (
		<Sidebar 
			collapsible="icon" 
			className={cn(
				"border-r border-border/40",
				"bg-background/80 backdrop-blur-xl",
				"supports-[backdrop-filter]:bg-background/60",
				"shadow-xl shadow-black/5"
			)}
		>
			<SidebarHeader className={cn(
				"border-b border-border/30",
				"bg-gradient-to-b from-background/95 to-transparent",
				"backdrop-blur-sm"
			)}>
				<Link to="/dashboard" className="flex items-center gap-2 px-2 py-1">
					<motion.div 
						whileHover={{ scale: 1.05, rotate: -5 }}
						whileTap={{ scale: 0.95 }}
						transition={{ type: "spring", stiffness: 400, damping: 17 }}
						className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-nutri-green to-nutri-blue shadow-lg shadow-nutri-green/20"
					>
						<span className="text-white font-bold text-sm">NF</span>
					</motion.div>
					<AnimatePresence>
						{!isCollapsed && (
							<motion.span 
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -10 }}
								transition={{ duration: 0.2 }}
								className="font-semibold text-foreground"
							>
								NutriFlow Pro
							</motion.span>
						)}
					</AnimatePresence>
				</Link>
			</SidebarHeader>

			<SidebarContent>
				{/* Main Navigation */}
				<SidebarGroup>
					<SidebarGroupLabel>Navegação</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainNavigation.map((item, index) => (
								<AnimatedMenuItem
									key={item.title}
									item={item}
									isActive={isActive(item.href)}
									index={index}
									isCollapsed={isCollapsed}
								/>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarSeparator />

				{/* Quick Actions */}
				<SidebarGroup>
					<SidebarGroupLabel>Ações Rápidas</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{quickActions.map((action, index) => (
								<AnimatedQuickAction
									key={action.title}
									action={action}
									isActive={isActive(action.link)}
									index={index}
									isCollapsed={isCollapsed}
								/>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Active Patient Context */}
				<AnimatePresence>
					{activePatient && sessionData.consultationActive && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3, ease: "easeInOut" }}
						>
							<SidebarSeparator />
							<SidebarGroup>
								<SidebarGroupLabel>Paciente Ativo</SidebarGroupLabel>
								<SidebarGroupContent>
									<motion.div 
										initial={{ scale: 0.95, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ delay: 0.1 }}
										className={cn(
											"mx-2 p-3 rounded-xl",
											"bg-emerald-50/80 dark:bg-emerald-950/50",
											"border border-emerald-200/60 dark:border-emerald-700/50",
											"backdrop-blur-md shadow-lg shadow-emerald-500/10",
											isCollapsed && "p-2"
										)}
									>
										{!isCollapsed ? (
											<>
												<div className="flex items-center gap-2 mb-2">
													<motion.div
														animate={{ 
															scale: [1, 1.1, 1],
														}}
														transition={{ 
															duration: 2,
															repeat: Infinity,
															ease: "easeInOut"
														}}
													>
														<Stethoscope className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
													</motion.div>
													<span className="font-medium text-sm text-emerald-800 dark:text-emerald-200 truncate">
														{activePatient.name}
													</span>
												</div>
												<p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2">
													Etapa: {sessionData.currentStep}
												</p>
												<Button 
													asChild 
													size="sm" 
													className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
												>
													<Link to="/clinical">
														<motion.span
															className="flex items-center gap-1"
															whileHover={{ x: 3 }}
														>
															Continuar
															<ChevronRight className="h-3 w-3" />
														</motion.span>
													</Link>
												</Button>
											</>
										) : (
											<Link to="/clinical" className="flex justify-center">
												<motion.div
													animate={{ 
														scale: [1, 1.1, 1],
													}}
													transition={{ 
														duration: 2,
														repeat: Infinity,
														ease: "easeInOut"
													}}
												>
													<Stethoscope className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
												</motion.div>
											</Link>
										)}
									</motion.div>
								</SidebarGroupContent>
							</SidebarGroup>
						</motion.div>
					)}
				</AnimatePresence>
			</SidebarContent>

			{/* Footer */}
			<SidebarFooter className={cn(
				"border-t border-border/30",
				"bg-gradient-to-t from-background/95 to-transparent",
				"backdrop-blur-sm"
			)}>
				<SidebarMenu>
					{footerLinks.map((item, index) => (
						<SidebarMenuItem key={item.title}>
							<motion.div
								custom={index}
								initial="hidden"
								animate="visible"
								variants={itemVariants}
							>
								<SidebarMenuButton
									asChild
									isActive={isActive(item.href)}
									tooltip={item.title}
									className="group"
								>
									<Link to={item.href}>
										<motion.div
											variants={iconVariants}
											initial="rest"
											whileHover="hover"
										>
											<item.icon className="h-4 w-4" />
										</motion.div>
										{!isCollapsed && <span>{item.title}</span>}
									</Link>
								</SidebarMenuButton>
							</motion.div>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
