import {supabase} from "@/integrations/supabase/client";
import {Patient, AddressDetails, PatientResponse} from "@/types";
import {logger} from "@/utils/logger";

export const getPatient = async (patientId: string): Promise<PatientResponse> => {
	try {
		const {data, error} = await supabase
			.from("patients")
			.select("*")
			.eq("id", patientId)
			.single();

		if (error) {
			logger.error("Error fetching patient:", error);
			return {success: false, error: error.message};
		}

		if (!data) {
			return {success: false, error: "Patient not found"};
		}

		const patient = processPatientData(data);
		return {success: true, data: patient};
	} catch (error: any) {
		logger.error("Error in getPatient:", error);
		return {success: false, error: error.message};
	}
};

export const getPatientsByUserId = async (
	userId: string
): Promise<{success: boolean; data?: Patient[]; error?: string}> => {
	try {
		const {data, error} = await supabase.from("patients").select("*").eq("user_id", userId);

		if (error) {
			logger.error("Error fetching patients:", error);
			return {success: false, error: error.message};
		}

		const patients = data.map(processPatientData);
		return {success: true, data: patients};
	} catch (error: any) {
		logger.error("Error in getPatientsByUserId:", error);
		return {success: false, error: error.message};
	}
};

// Helper function to safely parse JSON data
const parseJsonField = (data: any, fieldName: string): Record<string, any> => {
	if (!data) return {};

	if (typeof data === "string") {
		try {
			return JSON.parse(data);
		} catch (e) {
			logger.error(`Failed to parse ${fieldName} as JSON:`, e);
			return {};
		}
	}

	if (typeof data === "object") {
		return data;
	}

	return {};
};

// Helper function to process address data
const processAddressData = (address: any): string | AddressDetails | undefined => {
	if (!address) return undefined;

	if (typeof address === "string") {
		try {
			return JSON.parse(address) as AddressDetails;
		} catch (e) {
			logger.error("Failed to parse address as JSON:", e);
			return address;
		}
	}

	if (typeof address === "object") {
		return address as AddressDetails;
	}

	return undefined;
};

// Helper function to safely cast gender
const processGenderData = (gender: any): "male" | "female" | "other" | undefined => {
	if (gender === "male" || gender === "female" || gender === "other") {
		return gender;
	}
	return undefined;
};

const processPatientData = (data: any): Patient => {
	console.log("processPatientData: Raw data from database:", data);
	console.log("processPatientData: Goals field from DB:", data.goals);
	console.log("processPatientData: Goals type:", typeof data.goals);

	const addressData = processAddressData(data.address);
	const goalsData = parseJsonField(data.goals, "goals");
	const measurementsData = parseJsonField(data.measurements, "measurements");
	const genderData = processGenderData(data.gender);

	console.log("processPatientData: Parsed goals data:", goalsData);

	const patient: Patient = {
		...data,
		status: (data.status as "active" | "archived") || "active",
		gender: genderData,
		goals: goalsData,
		measurements: measurementsData,
		address: addressData,
	};

	console.log("processPatientData: Final patient object:", patient);
	return patient;
};

export type {PatientResponse};
