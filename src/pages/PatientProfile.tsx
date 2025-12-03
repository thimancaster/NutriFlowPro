import React from "react";
import {useParams, useNavigate} from "react-router-dom";
import {usePatientDetail} from "@/hooks/patient/usePatientDetail";
import {useActivePatient} from "@/hooks/patient/useActivePatient";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
	ArrowLeft,
	Edit,
	Calculator,
	Utensils,
	User,
	Phone,
	Mail,
	Calendar,
	MapPin,
} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";

const PatientProfile = () => {
	const {id} = useParams<{id: string}>();
	const navigate = useNavigate();
	const {toast} = useToast();
	const {selectPatient} = useActivePatient();

	const {patient, isLoading, error, isError} = usePatientDetail(id);

	const handleEditPatient = () => {
		if (patient) {
			navigate(`/patients/edit/${patient.id}`);
		}
	};

	const handleGoBack = () => {
		navigate(-1);
	};

	const handleCalculator = async () => {
		if (patient) {
			// Select patient as active first
			await selectPatient(patient);
			toast({
				title: "Paciente Selecionado",
				description: `${patient.name} está agora ativo`,
			});
			// Then navigate to calculator
			navigate(`/calculator`);
		}
	};

	const handleMealPlan = async () => {
		if (patient) {
			// Select patient as active first
			await selectPatient(patient);
			toast({
				title: "Paciente Selecionado",
				description: `${patient.name} está agora ativo`,
			});
			// Then navigate to meal plans
			navigate(`/meal-plans`);
		}
	};

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nutri-blue"></div>
				</div>
			</div>
		);
	}

	if (isError || !patient) {
		return (
			<div className="container mx-auto px-4 py-8">
				<Card>
					<CardContent className="py-12 text-center">
						<p className="text-gray-500 mb-4">
							{error?.message || "Paciente não encontrado"}
						</p>
						<Button onClick={handleGoBack} variant="outline">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Voltar
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const formatDate = (dateString?: string) => {
		if (!dateString) return "Não informado";
		try {
			return format(new Date(dateString), "dd/MM/yyyy", {locale: ptBR});
		} catch {
			return "Data inválida";
		}
	};

	const calculateAge = (birthDate?: string) => {
		if (!birthDate) return null;
		try {
			const today = new Date();
			const birth = new Date(birthDate);
			let age = today.getFullYear() - birth.getFullYear();
			const monthDiff = today.getMonth() - birth.getMonth();
			if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
				age--;
			}
			return age;
		} catch {
			return null;
		}
	};

	const age = calculateAge(patient.birth_date);

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="sm" onClick={handleGoBack}>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Voltar
					</Button>
					<div>
						<h1 className="text-3xl font-bold text-nutri-blue">{patient.name}</h1>
						<div className="flex items-center gap-2 mt-1">
							<Badge variant={patient.status === "active" ? "success" : "secondary"}>
								{patient.status === "active" ? "Ativo" : "Arquivado"}
							</Badge>
							{age && <span className="text-gray-500">{age} anos</span>}
						</div>
					</div>
				</div>

				<div className="flex gap-2">
					<Button variant="outline" onClick={handleCalculator}>
						<Calculator className="h-4 w-4 mr-2" />
						Calculadora
					</Button>
					<Button variant="outline" onClick={handleMealPlan}>
						<Utensils className="h-4 w-4 mr-2" />
						Plano Alimentar
					</Button>
					<Button onClick={handleEditPatient}>
						<Edit className="h-4 w-4 mr-2" />
						Editar Paciente
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Informações Básicas */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="h-5 w-5" />
							Informações Básicas
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<label className="text-sm font-medium text-gray-500">Nome</label>
							<p className="text-sm">{patient.name}</p>
						</div>

						{patient.email && (
							<div>
								<label className="text-sm font-medium text-gray-500">Email</label>
								<div className="flex items-center gap-2">
									<Mail className="h-4 w-4 text-gray-400" />
									<p className="text-sm">{patient.email}</p>
								</div>
							</div>
						)}

						{patient.phone && (
							<div>
								<label className="text-sm font-medium text-gray-500">
									Telefone
								</label>
								<div className="flex items-center gap-2">
									<Phone className="h-4 w-4 text-gray-400" />
									<p className="text-sm">{patient.phone}</p>
								</div>
							</div>
						)}

						{patient.birth_date && (
							<div>
								<label className="text-sm font-medium text-gray-500">
									Data de Nascimento
								</label>
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-gray-400" />
									<p className="text-sm">{formatDate(patient.birth_date)}</p>
								</div>
							</div>
						)}

					{patient.gender && (
						<div>
							<label className="text-sm font-medium text-gray-500">Gênero</label>
							<p className="text-sm">
								{patient.gender === 'male' && 'Masculino'}
								{patient.gender === 'female' && 'Feminino'}
								{patient.gender === 'other' && 'Outro'}
							</p>
						</div>
					)}

						{patient.cpf && (
							<div>
								<label className="text-sm font-medium text-gray-500">CPF</label>
								<p className="text-sm">{patient.cpf}</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Objetivos */}
				<Card>
					<CardHeader>
						<CardTitle>Objetivos</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{patient.goals &&
						typeof patient.goals === "object" &&
						Object.keys(patient.goals).length > 0 ? (
							<>
								{patient.goals.objective && (
									<div>
										<p className="text-sm font-medium text-gray-500">
											Objetivo
										</p>
										<p className="text-sm capitalize">
											{patient.goals.objective === "emagrecimento" &&
												"Emagrecimento"}
											{patient.goals.objective === "manutencao" &&
												"Manutenção"}
											{patient.goals.objective === "hipertrofia" &&
												"Hipertrofia"}
											{![
												"emagrecimento",
												"manutencao",
												"hipertrofia",
											].includes(patient.goals.objective) &&
												patient.goals.objective}
										</p>
									</div>
								)}

								{patient.goals.profile && (
									<div>
										<p className="text-sm font-medium text-gray-500">Perfil</p>
										<p className="text-sm capitalize">
											{patient.goals.profile === "eutrofico" && "Eutrófico"}
											{patient.goals.profile === "obeso_sobrepeso" &&
												"Sobrepeso/Obesidade"}
											{patient.goals.profile === "atleta" && "Atleta"}
											{!["eutrofico", "obeso_sobrepeso", "atleta"].includes(
												patient.goals.profile
											) && patient.goals.profile}
										</p>
									</div>
								)}

								{patient.goals.activityLevel && (
									<div>
										<p className="text-sm font-medium text-gray-500">
											Nível de Atividade
										</p>
										<p className="text-sm capitalize">
											{patient.goals.activityLevel === "sedentario" &&
												"Sedentário"}
											{patient.goals.activityLevel === "leve" && "Leve"}
											{patient.goals.activityLevel === "moderado" &&
												"Moderado"}
											{patient.goals.activityLevel === "muito_ativo" &&
												"Muito Ativo"}
											{patient.goals.activityLevel === "extremamente_ativo" &&
												"Extremamente Ativo"}
											{![
												"sedentario",
												"leve",
												"moderado",
												"muito_ativo",
												"extremamente_ativo",
											].includes(patient.goals.activityLevel) &&
												patient.goals.activityLevel}
										</p>
									</div>
								)}
							</>
						) : (
							<p className="text-sm text-gray-500">Nenhum objetivo definido</p>
						)}
					</CardContent>
				</Card>

				{/* Anotações */}
				<Card>
					<CardHeader>
						<CardTitle>Anotações</CardTitle>
					</CardHeader>
					<CardContent>
						{patient.notes ? (
							<p className="text-sm whitespace-pre-wrap">{patient.notes}</p>
						) : (
							<p className="text-sm text-gray-500">Nenhuma anotação registrada</p>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Endereço */}
			{patient.address && (
				<Card className="mt-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<MapPin className="h-5 w-5" />
							Endereço
						</CardTitle>
					</CardHeader>
					<CardContent>
						{typeof patient.address === "string" ? (
							<p className="text-sm">{patient.address}</p>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{patient.address.street && (
									<div>
										<label className="text-sm font-medium text-gray-500">
											Rua
										</label>
										<p className="text-sm">{patient.address.street}</p>
									</div>
								)}
								{patient.address.number && (
									<div>
										<label className="text-sm font-medium text-gray-500">
											Número
										</label>
										<p className="text-sm">{patient.address.number}</p>
									</div>
								)}
								{patient.address.neighborhood && (
									<div>
										<label className="text-sm font-medium text-gray-500">
											Bairro
										</label>
										<p className="text-sm">{patient.address.neighborhood}</p>
									</div>
								)}
								{patient.address.city && (
									<div>
										<label className="text-sm font-medium text-gray-500">
											Cidade
										</label>
										<p className="text-sm">{patient.address.city}</p>
									</div>
								)}
								{patient.address.state && (
									<div>
										<label className="text-sm font-medium text-gray-500">
											Estado
										</label>
										<p className="text-sm">{patient.address.state}</p>
									</div>
								)}
								{patient.address.cep && (
									<div>
										<label className="text-sm font-medium text-gray-500">
											CEP
										</label>
										<p className="text-sm">{patient.address.cep}</p>
									</div>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default PatientProfile;
