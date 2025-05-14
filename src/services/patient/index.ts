
// Import operations before using them
import { getPatient } from './operations/getPatient';
import { getPatients, getSortedPatients } from './operations/getPatients';
import { savePatient, updatePatientStatus, updatePatient } from './operations/savePatient';

// Re-export the imported functions
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
