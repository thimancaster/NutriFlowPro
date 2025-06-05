// Test script to verify form validation is working
import {validateSecureForm} from "./src/utils/securityValidation.js";

// Test with missing required fields
const testFormData = {
	name: "", // Required - empty
	sex: "", // Required - empty
	objective: "", // Required - empty
	profile: "", // Required - empty
	email: "",
	phone: "",
	cpf: "",
	status: "active",
};

console.log("Testing form validation with missing required fields...");
const result = validateSecureForm.patient(testFormData);

console.log("Validation result:", {
	isValid: result.isValid,
	errors: result.errors,
	errorCount: Object.keys(result.errors).length,
});

console.log("\nExpected errors for fields: name, sex, objective, profile, birthDate");
console.log("Actual error fields:", Object.keys(result.errors));

if (!result.isValid && Object.keys(result.errors).length > 0) {
	console.log("\n✅ VALIDATION IS WORKING - Errors are being returned for missing fields");
} else {
	console.log("\n❌ VALIDATION ISSUE - No errors returned when there should be errors");
}
