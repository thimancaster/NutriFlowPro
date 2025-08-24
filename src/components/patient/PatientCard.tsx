import React from "react";
import {Patient} from "@/types";
import {Card, CardHeader, CardContent, CardFooter} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {MoreVertical, Edit, Trash2, Eye} from "lucide-react";
import {Link} from "react-router-dom";

interface PatientCardProps {
	patient: Patient;
	onClick?: () => void;
	onEdit?: () => void;
	onDelete?: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({patient, onClick, onEdit, onDelete}) => {
	const getLastAppointmentText = () => {
		if (!patient.last_appointment) {
			return "Sem consultas";
		}

		const lastAppointment = new Date(patient.last_appointment);
		const daysSince = Math.floor(
			(new Date().getTime() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24)
		);

		if (daysSince === 0) return "Hoje";
		if (daysSince === 1) return "Ontem";
		if (daysSince < 30) return `${daysSince} dias atrás`;
		if (daysSince < 365) return `${Math.floor(daysSince / 30)} meses atrás`;
		return `${Math.floor(daysSince / 365)} anos atrás`;
	};

	return (
		<Card
			className="shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
			onClick={onClick}>
			<CardHeader className="flex flex-row items-center space-y-0 space-x-4 p-4">
				<Avatar>
					<AvatarImage
						src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${patient.name}`}
					/>
					<AvatarFallback>{patient.name.charAt(0)}</AvatarFallback>
				</Avatar>
				<div className="flex-1 space-y-1">
					<h4 className="text-sm font-semibold text-foreground">{patient.name}</h4>
					<p className="text-xs text-muted-foreground">{patient.email || "Sem email"}</p>
				</div>
				{(onEdit || onDelete) && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
							<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem asChild>
								<Link to={`/patients/${patient.id}`} className="flex items-center">
									<Eye className="mr-2 h-4 w-4" />
									Ver Detalhes
								</Link>
							</DropdownMenuItem>
							{onEdit && (
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										onEdit();
									}}>
									<Edit className="mr-2 h-4 w-4" />
									Editar
								</DropdownMenuItem>
							)}
							{onDelete && (
								<DropdownMenuItem
									onClick={(e) => {
										e.stopPropagation();
										onDelete();
									}}
									className="text-destructive focus:text-destructive">
									<Trash2 className="mr-2 h-4 w-4" />
									Excluir
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</CardHeader>
			<CardContent className="p-4 pt-0 text-sm">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-muted-foreground">
					<div>
						<span className="font-semibold text-foreground">Idade:</span>{" "}
						{patient.age || "N/A"}
					</div>
					<div>
						<span className="font-semibold text-foreground">Telefone:</span>{" "}
						{patient.phone || "N/A"}
					</div>
					<div className="md:col-span-2">
						<span className="font-semibold text-foreground">Última consulta:</span>{" "}
						{getLastAppointmentText()}
					</div>
					<div className="md:col-span-2">
						<span className="font-semibold text-foreground">Status:</span>
						<span
							className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
								patient.status === "active"
									? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
									: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
							}`}>
							{patient.status === "active" ? "Ativo" : "Arquivado"}
						</span>
					</div>
				</div>
			</CardContent>
			{!(onEdit || onDelete) && (
				<CardFooter className="p-4 pt-0 flex justify-end">
					<Link to={`/patients/${patient.id}`}>
						<Button size="sm" variant="outline">
							Ver Detalhes
						</Button>
					</Link>
				</CardFooter>
			)}
		</Card>
	);
};

export default PatientCard;
