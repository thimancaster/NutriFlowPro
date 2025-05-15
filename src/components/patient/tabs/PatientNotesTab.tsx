
import React from 'react';
import PatientNotes from '../PatientNotes';

interface PatientNotesTabProps {
  patientId: string;
  content: string;
  onSave: (notes: string) => Promise<void>;
}

const PatientNotesTab: React.FC<PatientNotesTabProps> = ({ patientId, content, onSave }) => {
  return <PatientNotes patientId={patientId} content={content} onSave={onSave} />;
};

export default PatientNotesTab;
