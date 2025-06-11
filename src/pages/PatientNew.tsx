import React, {useEffect} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useToast} from "@/hooks/use-toast";
import PatientForm from "@/components/PatientForm";
import {useQuery} from "@tanstack/react-query";
import {PatientService} from "@/services/patient";
import {useAuth} from "@/contexts/auth/AuthContext";

const PatientNew = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const {id} = useParams();
	const {toast} = useToast();
	const {user} = useAuth();

	// Check for new patient data passed from Calculator
	const newPatientData = location.state?.newPatient;

	// Fetch patient data if in edit mode
	const {
		data: patientResponse,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["patient", id],
		queryFn: async () => {
			if (!id) return null;

			console.log("Fetching patient with ID:", id);
			const result = await PatientService.getPatient(id);
			console.log("Patient fetch result:", result);

			if (!result.success) {
				throw new Error(result.error ?? "Failed to fetch patient");
			}

			return result;
		},
		enabled: !!id && !!user,
		retry: 1,
	});

	// Extract patient data from response
	const patientData = patientResponse?.success ? patientResponse.data : null;

	// Effect to show a message if we have patient data
	useEffect(() => {
		if (newPatientData) {
			toast({
				title: "Dados importados",
				description: "Complete o cadastro para salvar o novo paciente.",
			});
		}
	}, [newPatientData, toast]);

	useEffect(() => {
		if (id && patientData && user && patientData.user_id !== user.id) {
			toast({
				title: "Acesso negado",
				description: "Você não tem permissão para editar este paciente.",
				variant: "destructive",
			});
			navigate("/patients");
		}
	}, [id, patientData, user, navigate, toast]);

	const handleSuccess = () => {
		toast({
			title: id ? "Paciente atualizado" : "Paciente salvo",
			description: id
				? "O paciente foi atualizado com sucesso."
				: "O paciente foi cadastrado com sucesso.",
		});
		navigate("/patients");
	};

	const handleCancel = () => {
		navigate("/patients");
	};

	// Handle any rendering errors
	if (error) {
		console.error("Patient fetch error:", error);
	}

	try {
		return (
			<div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-dark-bg-primary dark:to-dark-bg-secondary">
				<div className="container mx-auto px-4 py-8">
					<h1 className="text-3xl font-bold text-nutri-blue dark:text-nutri-blue-light mb-2">
						{id ? "Editar Paciente" : "Novo Paciente"}
					</h1>
					<p className="text-gray-600 dark:text-dark-text-muted mb-6">
						{id
							? "Atualize os dados do paciente conforme necessário"
							: "Preencha os dados para cadastrar um novo paciente"}
					</p>

					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nutri-blue"></div>
						</div>
					) : error ? (
						<div className="flex items-center justify-center py-12">
							<div className="text-center">
								<h3 className="text-lg font-semibold text-red-600 mb-2">
									Erro ao carregar paciente
								</h3>
								<p className="text-gray-600 dark:text-dark-text-muted mb-4">
									{error.message}
								</p>
								<button
									onClick={() => navigate("/patients")}
									className="px-4 py-2 bg-nutri-blue text-white rounded hover:bg-blue-600">
									Voltar para lista de pacientes
								</button>
							</div>
						</div>
					) : (
						<PatientForm
							onSuccess={handleSuccess}
							onCancel={handleCancel}
							initialData={newPatientData}
							editPatient={patientData}
						/>
					)}
				</div>
			</div>
		);
	} catch (renderError) {
		console.error("PatientNew render error:", renderError);
		return (
			<div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-dark-bg-primary dark:to-dark-bg-secondary">
				<div className="container mx-auto px-4 py-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold text-red-600 mb-4">
							Erro de Renderização
						</h1>
						<p className="text-gray-600 dark:text-dark-text-muted mb-4">
							Ocorreu um erro ao carregar esta página.
						</p>
						<button
							onClick={() => navigate("/patients")}
							className="px-4 py-2 bg-nutri-blue text-white rounded hover:bg-blue-600">
							Voltar para lista de pacientes
						</button>
					</div>
				</div>
			</div>
		);
	}
};

export default PatientNew;
