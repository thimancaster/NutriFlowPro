import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
	Calculator,
	CalendarCheck,
	UserPlus,
	FileText,
	User,
	BarChart3,
	LayoutDashboard,
	Activity,
	Trophy,
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
	useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const quickActions = [
	{
		title: "Nova Consulta",
		description: "Iniciar atendimento",
		icon: FileText,
		link: "/clinical",
		color: "text-green-600 dark:text-emerald-400",
		bgColor: "bg-green-100 dark:bg-emerald-900/30",
	},
	{
		title: "Agendar",
		description: "Compromissos",
		icon: CalendarCheck,
		link: "/appointments",
		color: "text-blue-600 dark:text-blue-400",
		bgColor: "bg-blue-100 dark:bg-blue-900/30",
	},
	{
		title: "Novo Paciente",
		description: "Cadastrar paciente",
		icon: UserPlus,
		link: "/patients/new",
		color: "text-purple-600 dark:text-purple-400",
		bgColor: "bg-purple-100 dark:bg-purple-900/30",
	},
	{
		title: "Calculadora",
		description: "Avaliação nutricional",
		icon: Calculator,
		link: "/calculator",
		color: "text-amber-600 dark:text-amber-400",
		bgColor: "bg-amber-100 dark:bg-amber-900/30",
	},
	{
		title: "Relatórios",
		description: "Evolução",
		icon: BarChart3,
		link: "/reports",
		color: "text-cyan-600 dark:text-cyan-400",
		bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
	},
	{
		title: "Pacientes",
		description: "Gerenciar",
		icon: User,
		link: "/patients",
		color: "text-rose-600 dark:text-rose-400",
		bgColor: "bg-rose-100 dark:bg-rose-900/30",
	},
];

const navigationItems = [
	{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ title: "Atendimento", href: "/clinical", icon: Activity },
	{ title: "Conquistas", href: "/gamification", icon: Trophy },
];

export function AppSidebar() {
	const location = useLocation();
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	const isActive = (path: string) => location.pathname === path;

	return (
		<Sidebar collapsible="icon" className="border-r border-border">
			<SidebarHeader className="border-b border-border">
				<Link to="/dashboard" className="flex items-center gap-2 px-2 py-1">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-nutri-green to-nutri-blue">
						<span className="text-white font-bold text-sm">NF</span>
					</div>
					{!isCollapsed && (
						<span className="font-semibold text-foreground">NutriFlow</span>
					)}
				</Link>
			</SidebarHeader>

			<SidebarContent>
				{/* Ações Rápidas */}
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

				{/* Navegação */}
				<SidebarGroup>
					<SidebarGroupLabel>Navegação</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navigationItems.map((item) => (
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
			</SidebarContent>

			<SidebarRail />
		</Sidebar>
	);
}
