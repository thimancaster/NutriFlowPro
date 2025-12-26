import React from "react";
import { Link, useLocation } from "react-router-dom";
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

// Main navigation items (previously in Navbar)
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
	},
	{
		title: "Agendar",
		icon: CalendarCheck,
		link: "/appointments",
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	{
		title: "Novo Paciente",
		icon: UserPlus,
		link: "/patients/new",
		color: "text-purple-600 dark:text-purple-400",
		bgColor: "bg-purple-100 dark:bg-purple-900/30",
	},
	{
		title: "Calculadora",
		icon: Calculator,
		link: "/calculator",
		color: "text-amber-600 dark:text-amber-400",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
	},
];

// Footer links
const footerLinks = [
	{ title: "Configurações", href: "/settings", icon: Settings },
	{ title: "Ajuda", href: "/recursos", icon: HelpCircle },
];

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
		<Sidebar collapsible="icon" className="border-r border-border">
			<SidebarHeader className="border-b border-border">
				<Link to="/dashboard" className="flex items-center gap-2 px-2 py-1">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-nutri-green to-nutri-blue">
						<span className="text-white font-bold text-sm">NF</span>
					</div>
					{!isCollapsed && (
						<span className="font-semibold text-foreground">NutriFlow Pro</span>
					)}
				</Link>
			</SidebarHeader>

			<SidebarContent>
				{/* Main Navigation */}
				<SidebarGroup>
					<SidebarGroupLabel>Navegação</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainNavigation.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										isActive={isActive(item.href)}
										tooltip={item.title}
									>
										<Link to={item.href}>
											<item.icon className="h-4 w-4" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
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
							{quickActions.map((action) => (
								<SidebarMenuItem key={action.title}>
									<SidebarMenuButton
										asChild
										isActive={isActive(action.link)}
										tooltip={action.title}
									>
										<Link to={action.link} className="group">
											<div
												className={cn(
													"flex h-6 w-6 items-center justify-center rounded-md transition-colors",
													action.bgColor
												)}
											>
												<action.icon className={cn("h-4 w-4", action.color)} />
											</div>
											<span className="truncate">{action.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* Active Patient Context */}
				{activePatient && sessionData.consultationActive && (
					<>
						<SidebarSeparator />
						<SidebarGroup>
							<SidebarGroupLabel>Paciente Ativo</SidebarGroupLabel>
							<SidebarGroupContent>
								<div className={cn(
									"mx-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800",
									isCollapsed && "p-2"
								)}>
									{!isCollapsed ? (
										<>
											<div className="flex items-center gap-2 mb-2">
												<Stethoscope className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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
												className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
											>
												<Link to="/clinical">
													Continuar →
												</Link>
											</Button>
										</>
									) : (
										<Link to="/clinical" className="flex justify-center">
											<Stethoscope className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
										</Link>
									)}
								</div>
							</SidebarGroupContent>
						</SidebarGroup>
					</>
				)}
			</SidebarContent>

			{/* Footer */}
			<SidebarFooter className="border-t border-border">
				<SidebarMenu>
					{footerLinks.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								asChild
								isActive={isActive(item.href)}
								tooltip={item.title}
							>
								<Link to={item.href}>
									<item.icon className="h-4 w-4" />
									<span>{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}
