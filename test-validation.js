// Simple test script to check validation
const {validateSecureForm} = require("./src/utils/securityValidation.ts");

// Test with empty form data (should have validation errors)
const emptyFormData = {
	name: "",
	sex: "",
	objective: "",
	profile: "",
	email: "",
	phone: "",
	secondaryPhone: "",
	cpf: "",
	status: "active",
};

console.log("Testing validation with empty form data:");
try {
	const result = validateSecureForm.patient(emptyFormData);
	console.log("Validation result:", result);
	console.log("Errors found:", Object.keys(result.errors));
} catch (error) {
	console.error("Error running validation:", error);
}
