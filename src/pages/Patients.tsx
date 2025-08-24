import React, {useState, useEffect, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "@/contexts/auth/AuthContext";
import {PatientService} from "@/services/patientService";
import {Patient, PatientFilters} from "@/types/patient";
import PatientLoadingState from "@/components/patients/PatientLoadingState";
import PatientErrorState from "@/components/patients/PatientErrorState";
import {useToast} from "@/hooks/use-toast";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
	Search,
	MoreVertical,
	Edit,
	Trash2,
	Eye,
	UserPlus,
	Phone,
	Mail,
	Calendar,
	Calculator,
	X,
} from "lucide-react";

const Patients = () => {
	const {user} = useAuth();
	const navigate = useNavigate();
	const {toast} = useToast();
	const [patients, setPatients] = useState<Patient[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [totalPatients, setTotalPatients] = useState(0);
	const [filters, setFilters] = useState<PatientFilters>({
		search: "",
		status: "all",
		page: 1,
		limit: 10,
		sortBy: "created_at",
		sortOrder: "desc",
	});

	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | "active" | "archived">("all");

	// Filter patients based on search term and status
	const filteredPatients = patients.filter((patient) => {
		// Text-based filtering
		const matchesSearch =
			patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			patient.phone?.includes(searchTerm) ||
			patient.cpf?.includes(searchTerm);

		// Status-based filtering
		const matchesStatus = statusFilter === "all" || patient.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	const transformPatientData = (rawPatient: any): Patient => {
		return {
			id: rawPatient.id,
			name: rawPatient.name,
			email: rawPatient.email || "",
			phone: rawPatient.phone || "",
			secondaryPhone: rawPatient.secondaryphone || "",
			cpf: rawPatient.cpf || "",
			birth_date: rawPatient.birth_date || "",
			gender: (rawPatient.gender as "male" | "female" | "other") || "other",
			address: rawPatient.address || "",
			notes: rawPatient.notes || "",
			status:
				rawPatient.status === "inactive"
					? "archived"
					: (rawPatient.status as "active" | "archived") || "active",
			goals: rawPatient.goals || {},
			created_at: rawPatient.created_at,
			updated_at: rawPatient.updated_at,
			user_id: rawPatient.user_id,
			age: rawPatient.birth_date ? calculateAge(rawPatient.birth_date) : undefined,
		};
	};

	const loadPatients = async () => {
		if (!user?.id) return;

		setIsLoading(true);
		try {
			const result = await PatientService.getPatients(user.id, {status: filters.status});

			if (result.success && result.data) {
				const patientsArray = Array.isArray(result.data) ? result.data : [result.data];
				const transformedPatients = patientsArray.map(transformPatientData);
				setPatients(transformedPatients);
				setTotalPatients(transformedPatients.length);
			} else {
				toast({
					title: "Erro",
					description: result.error || "Falha ao carregar pacientes",
					variant: "destructive",
				});
			}
		} catch (error: any) {
			toast({
				title: "Erro",
				description: error.message || "Erro inesperado",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreatePatient = async (patientData: Partial<Patient>) => {
		if (!user?.id) return;

		try {
			const createData = {
				...patientData,
				user_id: user.id,
				name: patientData.name || "",
				gender: patientData.gender || "other",
				status: patientData.status || "active",
			} as Omit<Patient, "id" | "created_at" | "updated_at">;

			const result = await PatientService.createPatient(createData);

			if (result.success) {
				await loadPatients();
				toast({
					title: "Sucesso",
					description: "Paciente criado com sucesso!",
				});
			} else {
				toast({
					title: "Erro",
					description: result.error || "Falha ao criar paciente",
					variant: "destructive",
				});
			}
		} catch (error: any) {
			toast({
				title: "Erro",
				description: error.message || "Erro inesperado",
				variant: "destructive",
			});
		}
	};

	const handleUpdatePatient = async (patientId: string, patientData: Partial<Patient>) => {
		try {
			const result = await PatientService.updatePatient(patientId, patientData);

			if (result.success) {
				await loadPatients();
				toast({
					title: "Sucesso",
					description: "Paciente atualizado com sucesso!",
				});
			} else {
				toast({
					title: "Erro",
					description: result.error || "Falha ao atualizar paciente",
					variant: "destructive",
				});
			}
		} catch (error: any) {
			toast({
				title: "Erro",
				description: error.message || "Erro inesperado",
				variant: "destructive",
			});
		}
	};

	const handleDeletePatient = async (patientId: string) => {
		try {
			const result = await PatientService.deletePatient(patientId);

			if (result.success) {
				await loadPatients();
				toast({
					title: "Sucesso",
					description: "Paciente removido com sucesso!",
				});
			} else {
				toast({
					title: "Erro",
					description: result.error || "Falha ao remover paciente",
					variant: "destructive",
				});
			}
		} catch (error: any) {
			toast({
				title: "Erro",
				description: error.message || "Erro inesperado",
				variant: "destructive",
			});
		}
	};

	const handleFilterChange = (newFilters: Partial<PatientFilters>) => {
		setFilters((prevFilters) => ({...prevFilters, ...newFilters}));
	};

	const handleRetry = () => {
		loadPatients();
	};

	useEffect(() => {
		loadPatients();
	}, [user?.id, filters]);

	const calculateAge = (birthDate: string): number => {
		const today = new Date();
		const birth = new Date(birthDate);
		let age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();

		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
			age--;
		}

		return age;
	};

	const getLastAppointmentText = (lastAppointment?: string) => {
		if (!lastAppointment) {
			return "Sem consultas";
		}

		const lastAppointmentDate = new Date(lastAppointment);
		const daysSince = Math.floor(
			(new Date().getTime() - lastAppointmentDate.getTime()) / (1000 * 60 * 60 * 24)
		);

		if (daysSince === 0) return "Hoje";
		if (daysSince === 1) return "Ontem";
		if (daysSince < 30) return `${daysSince} dias atrás`;
		if (daysSince < 365) return `${Math.floor(daysSince / 30)} meses atrás`;
		return `${Math.floor(daysSince / 365)} anos atrás`;
	};

	const handleAddPatient = () => {
		navigate("/patients/new");
	};

	const clearFilters = () => {
		setSearchTerm("");
		setStatusFilter("all");
	};

	const hasActiveFilters = searchTerm || statusFilter !== "all";

	if (isLoading) {
		return <PatientLoadingState />;
	}

	if (error) {
		return <PatientErrorState errorMessage={error} onRetry={handleRetry} />;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<Card>
				<CardHeader>
					<div>
						<CardTitle className="text-2xl font-bold text-primary">Pacientes</CardTitle>
						<p className="text-muted-foreground">
							Gerencie seus pacientes ({filteredPatients.length} de {totalPatients}{" "}
							total)
							{hasActiveFilters && (
								<>
									<span className="text-primary"> • Filtros ativos</span>
									{statusFilter !== "all" && (
										<span className="text-xs text-muted-foreground">
											{" "}
											(
											{statusFilter === "active"
												? "Somente ativos"
												: "Somente arquivados"}
											)
										</span>
									)}
								</>
							)}
						</p>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
							<Input
								placeholder="Buscar por nome, email, telefone ou CPF..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="pl-10"
							/>
						</div>
						<div className="w-full lg:w-48">
							<Select
								value={statusFilter}
								onValueChange={(value: "all" | "active" | "archived") =>
									setStatusFilter(value)
								}>
								<SelectTrigger>
									<SelectValue placeholder="Filtrar por status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Todos os status</SelectItem>
									<SelectItem value="active">Ativo</SelectItem>
									<SelectItem value="archived">Arquivado</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex gap-2 shrink-0">
							{hasActiveFilters && (
								<Button variant="outline" size="sm" onClick={clearFilters}>
									<X className="h-4 w-4 mr-2" />
									Limpar
								</Button>
							)}
							<Button onClick={handleAddPatient}>
								<UserPlus className="h-4 w-4 mr-2" />
								Novo Paciente
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Patients Table */}
			<Card>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[250px]">Paciente</TableHead>
								<TableHead>Contato</TableHead>
								<TableHead>Idade</TableHead>
								<TableHead>Última Consulta</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="w-[120px]">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredPatients.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center py-8 text-muted-foreground">
										{hasActiveFilters
											? "Nenhum paciente encontrado com os critérios de busca."
											: "Nenhum paciente cadastrado."}
									</TableCell>
								</TableRow>
							) : (
								filteredPatients.map((patient) => (
									<TableRow
										key={patient.id}
										className="cursor-pointer hover:bg-muted/50"
										onClick={() => navigate(`/patients/${patient.id}`)}>
										<TableCell>
											<div className="flex items-center space-x-3">
												<Avatar className="h-8 w-8">
													<AvatarImage
														src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${patient.name}`}
													/>
													<AvatarFallback className="text-xs">
														{patient.name.charAt(0)}
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="font-medium text-foreground">
														{patient.name}
													</div>
													{patient.cpf && (
														<div className="text-xs text-muted-foreground">
															CPF: {patient.cpf}
														</div>
													)}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="space-y-1">
												{patient.email && (
													<div className="flex items-center text-sm text-muted-foreground">
														<Mail className="h-3 w-3 mr-1" />
														{patient.email}
													</div>
												)}
												{patient.phone && (
													<div className="flex items-center text-sm text-muted-foreground">
														<Phone className="h-3 w-3 mr-1" />
														{patient.phone}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell>
											<span className="text-sm">{patient.age || "N/A"}</span>
										</TableCell>
										<TableCell>
											<div className="flex items-center text-sm text-muted-foreground">
												<Calendar className="h-3 w-3 mr-1" />
												{getLastAppointmentText(patient.last_appointment)}
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant={
													patient.status === "active"
														? "default"
														: "secondary"
												}
												className={
													patient.status === "active"
														? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
														: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
												}>
												{patient.status === "active"
													? "Ativo"
													: "Arquivado"}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0"
													onClick={(e) => {
														e.stopPropagation();
														navigate(
															`/calculator?patientId=${patient.id}`
														);
													}}
													title="Abrir Calculadora">
													<Calculator className="h-4 w-4 text-primary" />
												</Button>
												<DropdownMenu>
													<DropdownMenuTrigger
														asChild
														onClick={(e) => e.stopPropagation()}>
														<Button
															variant="ghost"
															size="sm"
															className="h-8 w-8 p-0">
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																navigate(`/patients/${patient.id}`);
															}}>
															<Eye className="mr-2 h-4 w-4" />
															Ver Detalhes
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																navigate(`/patients/${patient.id}`);
															}}>
															<Edit className="mr-2 h-4 w-4" />
															Editar
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={(e) => {
																e.stopPropagation();
																handleDeletePatient(patient.id);
															}}
															className="text-destructive focus:text-destructive">
															<Trash2 className="mr-2 h-4 w-4" />
															Excluir
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};

export default Patients;
