import React from "react";
import {Link} from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {Users, CalendarDays, ClipboardList, ArrowRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";

export interface SummaryData {
	totalPatients: number;
	appointmentsToday: number;
	activePlans: number;
	isLoading: boolean;
}

const DashboardSummaryCards: React.FC<SummaryData> = ({
	totalPatients,
	appointmentsToday,
	activePlans,
	isLoading,
}) => {
	const summaryCards = [
		{
			title: "Pacientes",
			value: totalPatients,
			icon: <Users className="h-5 w-5" />,
			description: "Total de pacientes cadastrados",
			linkTo: "/patients",
			linkText: "Ver pacientes",
			colorScheme: {
				iconBg: "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-300",
				accent: "border-blue-200/50 dark:border-blue-700/50",
			},
		},
		{
			title: "Agendamentos Hoje",
			value: appointmentsToday,
			icon: <CalendarDays className="h-5 w-5" />,
			description: "Consultas agendadas para hoje",
			linkTo: "/appointments",
			linkText: "Ver agenda",
			colorScheme: {
				iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 dark:from-emerald-900/30 dark:to-emerald-800/30 dark:text-emerald-300",
				accent: "border-emerald-200/50 dark:border-emerald-700/50",
			},
		},
		{
			title: "Planos Alimentares",
			value: activePlans,
			icon: <ClipboardList className="h-5 w-5" />,
			description: "Planos alimentares ativos",
			linkTo: "/meal-plans",
			linkText: "Ver planos",
			colorScheme: {
				iconBg: "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800 dark:from-purple-900/30 dark:to-purple-800/30 dark:text-purple-300",
				accent: "border-purple-200/50 dark:border-purple-700/50",
			},
		},
	];

	return (
		<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{summaryCards.map((card, index) => (
				<Card
					key={index}
					className={`
            glass-card group
            border ${card.colorScheme.accent}
            transition-all duration-300 
            hover:shadow-sm
          `}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
						<div
							className={`
              rounded-full p-2.5 transition-all duration-300 group-hover:scale-105
              ${card.colorScheme.iconBg}
            `}>
							{card.icon}
						</div>
						<CardTitle className="text-sm font-medium text-muted-foreground text-glow-hover">
							{card.title}
						</CardTitle>
					</CardHeader>

					<CardContent className="pb-3">
						{isLoading ? (
							<Skeleton className="h-8 w-16 mb-2" />
						) : (
							<div className="text-2xl font-bold text-foreground mb-1 transition-all duration-300 group-hover:text-glow-hover">
								{card.value.toLocaleString()}
							</div>
						)}
						<CardDescription className="text-xs">{card.description}</CardDescription>
					</CardContent>

					<CardFooter className="pt-0">
						<Button
							asChild
							variant="ghost"
							size="sm"
							className="
                w-full justify-between h-8 text-xs
                text-muted-foreground hover:text-foreground
                transition-all duration-300
                group-hover:text-nutri-green dark:group-hover:text-dark-accent-green
              ">
							<Link to={card.linkTo}>
								{card.linkText}
								<ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
							</Link>
						</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	);
};

export default DashboardSummaryCards;
