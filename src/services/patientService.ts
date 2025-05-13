
import { 
  savePatient, 
  getPatient, 
  updatePatientStatus, 
  getPatients 
} from './patient';

/**
 * Service class for patient-related operations
 */
export class PatientService {
  static savePatient = savePatient;
  static getPatient = getPatient;
  static updatePatientStatus = updatePatientStatus;
  static getPatients = getPatients;
}
