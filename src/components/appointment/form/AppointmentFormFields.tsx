
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PatientSelect from './PatientSelect';
import AppointmentTypeSelect from './AppointmentTypeSelect';
import StatusSelect from './StatusSelect';
import { Appointment } from '@/types';

interface AppointmentFormFieldsProps {
  formData: Partial<Appointment>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  isEditing: boolean;
}

const AppointmentFormFields: React.FC<AppointmentFormFieldsProps> = ({
  formData,
  handleChange,
  handleSelectChange,
  isEditing
}) => {
  return (
    <div className="grid gap-4 py-4">
      <PatientSelect 
        value={formData.patient_id || ''} 
        onChange={(value) => handleSelectChange('patient_id', value)} 
      />
      
      <AppointmentTypeSelect 
        value={formData.appointment_type_id || formData.type || ''} 
        onChange={(value) => handleSelectChange('appointment_type_id', value)} 
      />

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">
          Título
        </Label>
        <Input
          id="title"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          className="col-span-3"
          placeholder="Título da consulta"
          required
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="start_time" className="text-right">
          Data e Hora
        </Label>
        <Input
          id="start_time"
          name="start_time"
          type="datetime-local"
          value={typeof formData.start_time === 'string' ? formData.start_time : ''}
          onChange={handleChange}
          className="col-span-3"
          required
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="notes" className="text-right">
          Observações
        </Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          className="col-span-3"
          rows={3}
          placeholder="Observações sobre a consulta"
        />
      </div>

      {isEditing && (
        <StatusSelect 
          value={formData.status || 'scheduled'} 
          onChange={(value) => handleSelectChange('status', value)} 
        />
      )}
    </div>
  );
};

export default AppointmentFormFields;
