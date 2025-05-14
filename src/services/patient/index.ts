
// Re-export from the patient directory
export { getPatient } from './operations/getPatient';
export { getPatients, getSortedPatients } from './operations/getPatients';
export { savePatient, updatePatientStatus, updatePatient } from './operations/savePatient';

// Create a PatientService object to maintain backward compatibility
export const PatientService = {
  getPatient,
  getPatients,
  getSortedPatients,
  savePatient,
  updatePatientStatus,
  updatePatient
};
