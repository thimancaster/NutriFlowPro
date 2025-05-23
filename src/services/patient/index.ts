
// Import operations before using them
import { getPatient, PatientResponse } from './operations/getPatient';
import { getPatients } from './operations/getPatients';
import { savePatient, updatePatientStatus } from './operations/savePatient';
import { updatePatient } from './operations/updatePatient';
import { deletePatient } from './operations/deletePatient';

// Re-export the imported functions
export { getPatient, PatientResponse } from './operations/getPatient';
export { getPatients } from './operations/getPatients';
export { savePatient, updatePatientStatus } from './operations/savePatient';
export { updatePatient } from './operations/updatePatient';
export { deletePatient } from './operations/deletePatient';

// Create a PatientService object to maintain backward compatibility
export const PatientService = {
  getPatient,
  getPatients,
  savePatient,
  updatePatientStatus,
  updatePatient,
  deletePatient
};
