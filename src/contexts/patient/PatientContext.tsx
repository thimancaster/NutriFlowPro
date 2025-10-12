import React, {createContext, useState, useContext, useCallback, useEffect} from "react";
import {v4 as uuidv4} from "uuid";
import {supabase} from "@/integrations/supabase/client";
import {PatientService} from "@/services/patient/PatientService";
import {useAuth} from "../auth/AuthContext";
import {Patient, PatientGoals, PatientFilters} from "@/types/patient";

interface PatientContextType {
	patients: Patient[];
	activePatient: Patient | null;
	loading: boolean;
	isLoading: boolean;
	error: string | null;
	totalPatients: number;
	isPatientActive: boolean;
	filters: {
		search: string;
		status: string;
	};
	currentFilters: PatientFilters;
	sessionData: {
		consultationActive: boolean;
		currentStep: string;
		lastActivity: Date | null;
	};
	patientHistoryData: any[];
	patientHistory: any[];
	setFilters: (filters: {search: string; status: string}) => void;
	updateFilters: (newFilters: Partial<PatientFilters>) => Promise<void>;
	loadPatients: () => Promise<void>;
	loadPatientById: (patientId: string) => Promise<void>;
	loadPatientHistory: (patientId: string) => Promise<void>;
	setActivePatient: (patient: Patient | null) => void;
	startPatientSession: (patient: Patient) => Promise<void>;
	endPatientSession: () => void;
	savePatient: (
		patientData: Partial<Patient>
	) => Promise<{success: boolean; data?: Patient; error?: string}>;
	deletePatient: (id: string) => Promise<void>;
	createPatient: (
		patientData: Omit<Patient, "id" | "user_id" | "created_at" | "updated_at">
	) => Promise<Patient | null>;
	updatePatient: (id: string, updates: Partial<Patient>) => Promise<Patient | null>;
	clearActivePatient: () => void;
	refreshPatients: () => Promise<void>;
	addRecentPatient: (patient: Patient) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export const usePatient = (): PatientContextType => {
	const context = useContext(PatientContext);
	if (!context) {
		throw new Error("usePatient must be used within a PatientProvider");
	}
	return context;
};

interface PatientProviderProps {
	children: React.ReactNode;
}

type Json = string | number | boolean | null | {[key: string]: Json | undefined} | Json[];

export const PatientProvider: React.FC<PatientProviderProps> = ({children}) => {
	const [patients, setPatients] = useState<Patient[]>([]);
	const [activePatient, setActivePatient] = useState<Patient | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [patientHistory, setPatientHistory] = useState<any[]>([]);
	const [patientHistoryData, setPatientHistoryData] = useState<any[]>([]);
	const [totalPatients, setTotalPatients] = useState(0);
	const [filtersState, setFiltersState] = useState({search: "", status: ""});
	const [currentFilters, setCurrentFilters] = useState<PatientFilters>({
		search: "",
		status: "active",
		page: 1,
		limit: 10,
	});
	const [sessionData, setSessionData] = useState({
		consultationActive: false,
		currentStep: "",
		lastActivity: null as Date | null,
	});
	const {user} = useAuth();

	const isPatientActive = Boolean(activePatient && sessionData.consultationActive);

	const setFilters = useCallback((newFilters: {search: string; status: string}) => {
		setFiltersState(newFilters);
	}, []);

	const updateFilters = useCallback(async (newFilters: Partial<PatientFilters>) => {
		setCurrentFilters((prev) => ({...prev, ...newFilters}));
		await loadPatients();
	}, []);

	const loadPatientHistory = useCallback(async (patientId: string) => {
		try {
			// Mock implementation - replace with actual history loading
			const history = [];
			setPatientHistory(history);
			setPatientHistoryData(history);
		} catch (error) {
			console.error("Error loading patient history:", error);
		}
	}, []);

	const loadPatients = useCallback(async () => {
		if (!user?.id) return;

		setLoading(true);
		setError(null);

		try {
			const query = supabase
				.from("patients")
				.select("*", {count: "exact"})
				.eq("user_id", user.id);

			if (
				filtersState.status &&
				filtersState.status !== "" &&
				filtersState.status !== "all"
			) {
				query.eq("status", filtersState.status);
			}

			if (filtersState.search) {
				query.or(
					`name.ilike.%${filtersState.search}%,email.ilike.%${filtersState.search}%`
				);
			}

			const {data, error, count} = await query.order("created_at", {ascending: false});

			if (error) throw error;

			// Transform the data to match our Patient type
			const transformedData: Patient[] = (data || []).map((patient) => {
				// Calculate age if birth_date exists
				let age = undefined;
				if (patient.birth_date) {
					const birthDate = new Date(patient.birth_date);
					const today = new Date();
					age = today.getFullYear() - birthDate.getFullYear();
					const monthDiff = today.getMonth() - birthDate.getMonth();
					if (
						monthDiff < 0 ||
						(monthDiff === 0 && today.getDate() < birthDate.getDate())
					) {
						age--;
					}
				}

				// Parse goals from JSON
				let goals: PatientGoals = {};
				if (patient.goals) {
					try {
						goals =
							typeof patient.goals === "string"
								? JSON.parse(patient.goals)
								: (patient.goals as PatientGoals);
					} catch (e) {
						console.warn("Failed to parse patient goals:", e);
						goals = {};
					}
				}

				return {
					...patient,
					email: patient.email || "",
					gender: patient.gender as "male" | "female" | "other",
					status:
						patient.status === "active" || patient.status === "archived"
							? (patient.status as "active" | "archived")
							: "active",
					goals,
					address: patient.address || "",
					secondaryPhone: patient.secondaryphone || "",
					age,
					last_appointment: undefined,
				};
			});

			setPatients(transformedData);
			setTotalPatients(count || 0);
		} catch (err: any) {
			console.error("Error loading patients:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	}, [user?.id, filtersState]);

	const loadPatientById = useCallback(
		async (patientId: string) => {
			if (!user?.id) return;

			try {
				const {data, error} = await supabase
					.from("patients")
					.select("*")
					.eq("id", patientId)
					.eq("user_id", user.id)
					.single();

				if (error) throw error;

				if (data) {
					// Transform single patient data
					let goals: PatientGoals = {};
					if (data.goals) {
						try {
							goals =
								typeof data.goals === "string"
									? JSON.parse(data.goals)
									: (data.goals as PatientGoals);
						} catch (e) {
							console.warn("Failed to parse patient goals:", e);
							goals = {};
						}
					}

					const transformedPatient: Patient = {
						...data,
						email: data.email || "",
						gender: data.gender as "male" | "female" | "other",
						status:
							data.status === "active" || data.status === "archived"
								? (data.status as "active" | "archived")
								: "active",
						goals,
						address: data.address || "",
						secondaryPhone: data.secondaryphone || "",
						age: data.birth_date ? calculateAge(data.birth_date) : undefined,
						last_appointment: undefined,
					};

					setActivePatient(transformedPatient);
				}
			} catch (err: any) {
				console.error("Error loading patient by ID:", err);
				setError(err.message);
			}
		},
		[user?.id]
	);

	const refreshPatients = useCallback(async () => {
		await loadPatients();
	}, [loadPatients]);

	const addRecentPatient = useCallback((patient: Patient) => {
		console.log("Adding recent patient:", patient.name);
	}, []);

	const startPatientSession = useCallback(async (patient: Patient) => {
		console.log("[PATIENT CONTEXT] Starting patient session:", {
			id: patient.id,
			name: patient.name,
			weight: patient.weight,
			height: patient.height,
			gender: patient.gender,
			goals: patient.goals,
		});

		// Parse goals if it's a string
		let parsedGoals = patient.goals;
		if (typeof patient.goals === "string") {
			try {
				parsedGoals = JSON.parse(patient.goals);
				console.log("[PATIENT CONTEXT] Parsed goals:", parsedGoals);
			} catch (e) {
				console.warn("[PATIENT CONTEXT] Failed to parse goals:", e);
				parsedGoals = {};
			}
		}

		// Load anthropometry data if weight/height are missing
		let enrichedPatient = {...patient, goals: parsedGoals};
		if (!patient.weight || !patient.height) {
			try {
				const {data: anthropometryData} = await supabase
					.from("anthropometry")
					.select("weight, height, date")
					.eq("patient_id", patient.id)
					.order("date", {ascending: false})
					.limit(1)
					.single();

				if (anthropometryData) {
					console.log("[PATIENT CONTEXT] Loaded anthropometry data:", anthropometryData);
					enrichedPatient = {
						...enrichedPatient,
						weight: anthropometryData.weight || patient.weight,
						height: anthropometryData.height || patient.height,
					};
					console.log("[PATIENT CONTEXT] Enriched patient:", {
						name: enrichedPatient.name,
						weight: enrichedPatient.weight,
						height: enrichedPatient.height,
						goals: enrichedPatient.goals,
					});
				}
			} catch (error) {
				console.warn("[PATIENT CONTEXT] No anthropometry data found:", error);
			}
		}

		setActivePatient(enrichedPatient);
		setSessionData({
			consultationActive: true,
			currentStep: "patient_data",
			lastActivity: new Date(),
		});
	}, []);

	const endPatientSession = useCallback(() => {
		setActivePatient(null);
		setSessionData({
			consultationActive: false,
			currentStep: "",
			lastActivity: null,
		});
	}, []);

	const savePatient = useCallback(
		async (
			patientData: Partial<Patient>
		): Promise<{success: boolean; data?: Patient; error?: string}> => {
			console.log("🟢 [PatientContext] savePatient called with:", patientData);

			if (!user?.id) {
				console.error("❌ [PatientContext] User not authenticated");
				return {success: false, error: "User not authenticated"};
			}

			try {
				// Convert Patient data to match database schema
				const dbPatient: any = {
					...patientData,
					address:
						typeof patientData.address === "object"
							? JSON.stringify(patientData.address)
							: patientData.address || "",
					goals: patientData.goals ? JSON.stringify(patientData.goals) : null,
					secondaryphone: patientData.secondaryPhone,
					user_id: user.id,
				};

				// Remove fields that don't exist in database or are computed
				const {secondaryPhone, last_appointment, age, weight, height, ...cleanDbPatient} =
					dbPatient;

				console.log("🟢 [PatientContext] cleanDbPatient:", cleanDbPatient);

				if (patientData.id) {
					console.log("🟢 [PatientContext] Updating patient:", patientData.id);
					const result = await PatientService.updatePatient(
						patientData.id,
						cleanDbPatient
					);
					if (!result.success) {
						console.error("❌ [PatientContext] Update failed:", result.error);
						return {success: false, error: result.error || "Failed to update patient"};
					}
					console.log("✅ [PatientContext] Update successful");
					return {success: true, data: result.data};
				} else {
					console.log("🟢 [PatientContext] Creating new patient");
					const result = await PatientService.createPatient(cleanDbPatient);
					if (!result.success) {
						console.error("❌ [PatientContext] Create failed:", result.error);
						return {success: false, error: result.error || "Failed to create patient"};
					}
					console.log("✅ [PatientContext] Create successful");
					return {success: true, data: result.data};
				}
			} catch (error: any) {
				console.error("❌ [PatientContext] Exception in savePatient:", error);
				return {success: false, error: error.message};
			}
		},
		[user?.id]
	);

	const deletePatient = useCallback(
		async (id: string) => {
			setLoading(true);
			setError(null);
			try {
				await PatientService.deletePatient(id);
				setPatients(patients.filter((patient) => patient.id !== id));
				if (activePatient?.id === id) {
					setActivePatient(null);
				}
			} catch (err: any) {
				console.error("Error deleting patient:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		},
		[patients, activePatient]
	);

	const createPatient = useCallback(
		async (
			patientData: Omit<Patient, "id" | "user_id" | "created_at" | "updated_at">
		): Promise<Patient | null> => {
			setLoading(true);
			setError(null);
			try {
				const goals = patientData.goals
					? (JSON.stringify(patientData.goals) as Json)
					: null;

				const newPatient = {
					...patientData,
					user_id: user?.id,
					goals: goals,
					address:
						typeof patientData.address === "object"
							? JSON.stringify(patientData.address)
							: patientData.address || "",
					secondaryphone: patientData.secondaryPhone || "",
				};

				const {secondaryPhone, last_appointment, age, weight, height, ...cleanDbPatient} =
					newPatient;

				const {data, error} = await supabase
					.from("patients")
					.insert([cleanDbPatient])
					.select()
					.single();

				if (error) {
					throw error;
				}

				let parsedGoals: PatientGoals = {};
				if (data.goals) {
					try {
						parsedGoals =
							typeof data.goals === "string"
								? JSON.parse(data.goals)
								: (data.goals as PatientGoals);
					} catch (e) {
						console.warn("Failed to parse patient goals:", e);
						parsedGoals = {};
					}
				}

				const transformedData: Patient = {
					...data,
					email: data.email || "",
					gender: data.gender as "male" | "female" | "other",
					status:
						data.status === "active" || data.status === "archived"
							? (data.status as "active" | "archived")
							: "active",
					goals: parsedGoals,
					address: data.address || "",
					secondaryPhone: data.secondaryphone || "",
					age: data.birth_date ? calculateAge(data.birth_date) : undefined,
					last_appointment: undefined,
				};

				setPatients([...patients, transformedData]);
				return transformedData;
			} catch (err: any) {
				console.error("Error creating patient:", err);
				setError(err.message);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[user?.id, patients]
	);

	const updatePatient = useCallback(
		async (id: string, updates: Partial<Patient>): Promise<Patient | null> => {
			setLoading(true);
			setError(null);
			try {
				const goals = updates.goals ? (JSON.stringify(updates.goals) as Json) : undefined;

				const dbUpdates = {
					...updates,
					goals,
					address:
						typeof updates.address === "object"
							? JSON.stringify(updates.address)
							: updates.address || "",
					secondaryphone: updates.secondaryPhone,
				};

				const {secondaryPhone, last_appointment, age, weight, height, ...cleanDbUpdates} =
					dbUpdates;

				const {data, error} = await supabase
					.from("patients")
					.update(cleanDbUpdates)
					.eq("id", id)
					.select()
					.single();

				if (error) {
					throw error;
				}

				let parsedGoals: PatientGoals = {};
				if (data.goals) {
					try {
						parsedGoals =
							typeof data.goals === "string"
								? JSON.parse(data.goals)
								: (data.goals as PatientGoals);
					} catch (e) {
						console.warn("Failed to parse patient goals:", e);
						parsedGoals = {};
					}
				}

				const transformedData: Patient = {
					...data,
					email: data.email || "",
					gender: data.gender as "male" | "female" | "other",
					status:
						data.status === "active" || data.status === "archived"
							? (data.status as "active" | "archived")
							: "active",
					goals: parsedGoals,
					address: data.address || "",
					secondaryPhone: data.secondaryphone || "",
					age: data.birth_date ? calculateAge(data.birth_date) : undefined,
					last_appointment: undefined,
				};

				setPatients(
					patients.map((patient) => (patient.id === id ? transformedData : patient))
				);

				if (activePatient?.id === id) {
					setActivePatient(transformedData);
				}

				return transformedData;
			} catch (err: any) {
				console.error("Error updating patient:", err);
				setError(err.message);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[patients, activePatient]
	);

	const clearActivePatient = useCallback(() => {
		setActivePatient(null);
	}, []);

	useEffect(() => {
		loadPatients();
	}, [loadPatients]);

	const value: PatientContextType = {
		patients,
		activePatient,
		loading,
		isLoading: loading,
		error,
		totalPatients,
		isPatientActive,
		filters: filtersState,
		currentFilters,
		sessionData,
		patientHistoryData,
		patientHistory,
		setFilters,
		updateFilters,
		loadPatients,
		loadPatientById,
		loadPatientHistory,
		setActivePatient,
		startPatientSession,
		endPatientSession,
		savePatient,
		deletePatient,
		createPatient,
		updatePatient,
		clearActivePatient,
		refreshPatients,
		addRecentPatient,
	};

	return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
};

// Helper function to calculate age
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

// Export the Patient interface from this context for backward compatibility
export type {Patient, PatientGoals};
