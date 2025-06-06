import {Patient} from "@/types";
import {usePatientFormState} from "./usePatientFormState";
import {usePatientFormValidation} from "./usePatientFormValidation";
import {usePatientFormSubmit} from "./usePatientFormSubmit";

interface UsePatientFormProps {
	editPatient?: Patient;
	initialData?: any;
	onSuccess?: () => void;
	userId: string;
}

export const usePatientForm = ({
	editPatient,
	initialData,
	onSuccess,
	userId,
}: UsePatientFormProps) => {
	const {
		birthDate,
		setBirthDate,
		activeTab,
		setActiveTab,
		formData,
		notes,
		handleChange,
		handleSelectChange,
		handleNotesChange,
		address,
		handleAddressChange,
	} = usePatientFormState(editPatient, initialData);

	const {errors, setErrors, handleValidateField, validateAndSanitizeForm} =
		usePatientFormValidation();

	const {isLoading, handleSubmit} = usePatientFormSubmit({
		editPatient,
		onSuccess,
		userId,
		validateAndSanitizeForm,
		setErrors,
		formData,
		birthDate,
		address,
		notes,
		setActiveTab,
	});

	return {
		isLoading,
		birthDate,
		setBirthDate,
		activeTab,
		setActiveTab,
		errors,
		formData,
		address,
		notes,
		handleChange,
		handleSelectChange,
		handleAddressChange,
		handleNotesChange,
		handleValidateField,
		handleSubmit,
	};
};
