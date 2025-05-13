
// Export all patient-related services from a central location
import { savePatient } from './operations/savePatient';
import { getPatient } from './operations/getPatient';
import { getPatients } from './operations/getPatients';
import { updatePatientStatus } from './operations/updatePatientStatus';
import { convertDbToPatient, preparePatientForDb } from './utils/patientDataUtils';

// Create a cohesive service object for better discoverability
export const PatientService = {
  savePatient,
  getPatient,
  getPatients,
  updatePatientStatus
};

// Also export individual functions for direct imports
export {
  savePatient,
  getPatient,
  getPatients,
  updatePatientStatus,
  convertDbToPatient,
  preparePatientForDb
};
