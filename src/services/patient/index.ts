
// Import operations before using them
import { getPatient } from './operations/getPatient';
import { getPatients } from './operations/getPatients';
import { savePatient, updatePatientStatus, updatePatient } from './operations/savePatient';

// Re-export the imported functions
export { getPatient } from './operations/getPatient';
export { getPatients } from './operations/getPatients';
export { savePatient, updatePatientStatus, updatePatient } from './operations/savePatient';

// Create a PatientService object to maintain backward compatibility
export const PatientService = {
  getPatient,
  getPatients,
  savePatient,
  updatePatientStatus,
  updatePatient
};
