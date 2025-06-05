import {useState, useEffect} from "react";
import {Patient, AddressDetails} from "@/types";
import {useAddressState} from "./useAddressState";

interface FormState {
	name: string;
	sex: string;
	objective: string;
	profile: string;
	email: string;
	phone: string;
	secondaryPhone: string;
	cpf: string;
	status: "active" | "archived";
}

export const usePatientFormState = (editPatient?: Patient, initialData?: any) => {
	const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
	const [activeTab, setActiveTab] = useState("basic-info");
	const [notes, setNotes] = useState("");

	// Form state
	const [formData, setFormData] = useState<FormState>({
		name: "",
		sex: "",
		objective: "",
		profile: "",
		email: "",
		phone: "",
		secondaryPhone: "",
		cpf: "",
		status: "active",
	});

	const {address, setAddress, handleAddressChange} = useAddressState();

	// If we're editing a patient or have initial data, populate the form
	useEffect(() => {
		if (editPatient) {
			console.log("usePatientFormState: Goals type:", typeof editPatient.goals);
			console.log(
				"usePatientFormState: Goals keys:",
				editPatient.goals ? Object.keys(editPatient.goals) : "no goals"
			);
			console.log("usePatientFormState: Goals objective:", editPatient.goals?.objective);
			console.log("usePatientFormState: Goals profile:", editPatient.goals?.profile);
			console.log("usePatientFormState: Patient gender:", editPatient.gender);

			// Deep log the goals structure
			if (editPatient.goals) {
				console.log(
					"usePatientFormState: Goals JSON:",
					JSON.stringify(editPatient.goals, null, 2)
				);
			}

			// Map gender from database format to form format
			let sexValue = "";
			if (editPatient.gender === "male") sexValue = "M";
			else if (editPatient.gender === "female") sexValue = "F";
			else if (editPatient.gender === "other") sexValue = "O";

			// Extract goals data properly, ensuring we handle all possible data structures
			let objectiveValue = "";
			let profileValue = "";

			if (editPatient.goals) {
				if (typeof editPatient.goals === "object") {
					objectiveValue = editPatient.goals.objective || "";
					profileValue = editPatient.goals.profile || "";
				} else if (typeof editPatient.goals === "string") {
					try {
						const parsedGoals = JSON.parse(editPatient.goals);
						objectiveValue = parsedGoals.objective || "";
						profileValue = parsedGoals.profile || "";
					} catch (e) {
						console.error("Failed to parse goals JSON string:", e);
					}
				}
			}

			setFormData({
				name: editPatient.name || "",
				sex: sexValue,
				objective: objectiveValue,
				profile: profileValue,
				email: editPatient.email || "",
				phone: editPatient.phone || "",
				secondaryPhone: editPatient.secondaryPhone || "",
				cpf: editPatient.cpf || "",
				status: editPatient.status || "active",
			});
		} else if (initialData) {
			// Use data passed from calculator
			setFormData({
				name: initialData.name || "",
				sex: initialData.gender || "",
				objective: initialData.objective || "",
				profile: initialData.profile || "",
				email: initialData.email || "",
				phone: initialData.phone || "",
				secondaryPhone: initialData.secondaryPhone || "",
				cpf: initialData.cpf || "",
				status: "active",
			});

			if (initialData.age) {
				// Set an approximate birth date based on age
				const today = new Date();
				const birthYear = today.getFullYear() - parseInt(initialData.age);
				setBirthDate(new Date(birthYear, 0, 1));
			}
		}
	}, [editPatient, initialData, setAddress]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value} = e.target;
		setFormData((prev) => ({...prev, [name]: value}));
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({...prev, [name]: value}));
	};

	const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setNotes(e.target.value);
	};

	return {
		birthDate,
		setBirthDate,
		activeTab,
		setActiveTab,
		formData,
		setFormData,
		notes,
		setNotes,
		handleChange,
		handleSelectChange,
		handleNotesChange,
		address,
		handleAddressChange,
	};
};
