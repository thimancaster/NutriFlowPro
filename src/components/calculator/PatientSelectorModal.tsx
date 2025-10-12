import React, {useState, useEffect} from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Search, User, Check} from "lucide-react";
import {Patient} from "@/types/patient";
import {usePatient} from "@/contexts/patient/PatientContext";

interface PatientSelectorModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onPatientSelected?: (patient: Patient) => void;
}

export const PatientSelectorModal: React.FC<PatientSelectorModalProps> = ({
	open,
	onOpenChange,
	onPatientSelected,
}) => {
	const {patients, loadPatients, startPatientSession, activePatient} = usePatient();
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (open && patients.length === 0) {
			setLoading(true);
			loadPatients().finally(() => setLoading(false));
		}
	}, [open, patients.length, loadPatients]);

	const filteredPatients = patients.filter((patient) => {
		const searchLower = searchTerm.toLowerCase();
		return (
			patient.name?.toLowerCase().includes(searchLower) ||
			patient.email?.toLowerCase().includes(searchLower) ||
			patient.cpf?.includes(searchTerm) ||
			patient.phone?.includes(searchTerm)
		);
	});

	const handleSelectPatient = async (patient: Patient) => {
		console.log("[PATIENT SELECTOR] Selecting patient:", patient);
		await startPatientSession(patient);
		onPatientSelected?.(patient);
		onOpenChange(false);
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Selecionar Paciente</DialogTitle>
					<DialogDescription>
						Busque e selecione um paciente para preencher a calculadora
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Search Bar */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Buscar por nome, email, CPF ou telefone..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
						/>
					</div>

					{/* Patient List */}
					<ScrollArea className="h-[400px] rounded-md border">
						{loading ? (
							<div className="flex items-center justify-center h-40">
								<p className="text-muted-foreground">Carregando pacientes...</p>
							</div>
						) : filteredPatients.length === 0 ? (
							<div className="flex items-center justify-center h-40">
								<p className="text-muted-foreground">
									{searchTerm
										? "Nenhum paciente encontrado"
										: "Nenhum paciente cadastrado"}
								</p>
							</div>
						) : (
							<div className="space-y-1 p-2">
								{filteredPatients.map((patient) => (
									<button
										key={patient.id}
										onClick={() => handleSelectPatient(patient)}
										className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors ${
											activePatient?.id === patient.id ? "bg-accent" : ""
										}`}>
										<Avatar className="h-10 w-10">
											<AvatarImage
												src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`}
											/>
											<AvatarFallback>
												{getInitials(patient.name)}
											</AvatarFallback>
										</Avatar>

										<div className="flex-1 text-left">
											<p className="font-medium">{patient.name}</p>
											<div className="flex gap-2 text-sm text-muted-foreground">
												{patient.email && <span>{patient.email}</span>}
												{patient.cpf && <span>• {patient.cpf}</span>}
											</div>
										</div>

										{activePatient?.id === patient.id && (
											<Check className="h-5 w-5 text-green-600" />
										)}
									</button>
								))}
							</div>
						)}
					</ScrollArea>

					{/* Footer Info */}
					<div className="text-sm text-muted-foreground">
						{filteredPatients.length > 0 && (
							<p>{filteredPatients.length} paciente(s) encontrado(s)</p>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
