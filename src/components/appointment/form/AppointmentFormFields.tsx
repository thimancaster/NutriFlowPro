
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PatientSelect from './PatientSelect';
import AppointmentTypeSelect from './AppointmentTypeSelect';
import StatusSelect from './StatusSelect';
import AppointmentConflictChecker from '../AppointmentConflictChecker';
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
  const [hasConflict, setHasConflict] = useState(false);

  const extractDateAndTime = (dateTimeString?: string) => {
    if (!dateTimeString) return { date: '', time: '' };
    
    try {
      const [date, time] = dateTimeString.split('T');
      return { date: date || '', time: time?.substring(0, 5) || '' };
    } catch {
      return { date: '', time: '' };
    }
  };

  const { date, time } = extractDateAndTime(formData.start_time);

  return (
    <div className="space-y-6 py-4">
      {/* Patient Selection */}
      <div className="space-y-2">
        <Label htmlFor="patient" className="text-base font-semibold text-gray-900 dark:text-dark-text-primary">
          Paciente *
        </Label>
        <PatientSelect 
          value={formData.patient_id || ''} 
          onChange={(value) => handleSelectChange('patient_id', value)} 
        />
      </div>
      
      {/* Appointment Type Selection */}
      <div className="space-y-2">
        <Label htmlFor="type" className="text-base font-semibold text-gray-900 dark:text-dark-text-primary">
          Tipo de Consulta *
        </Label>
        <AppointmentTypeSelect 
          value={formData.appointment_type_id || formData.type || ''} 
          onChange={(value) => handleSelectChange('appointment_type_id', value)} 
        />
      </div>

      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-semibold text-gray-900 dark:text-dark-text-primary">
          Título da Consulta
        </Label>
        <Input
          id="title"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          placeholder="Título será preenchido automaticamente baseado no tipo"
          className="h-12 text-base bg-white dark:bg-dark-bg-elevated border-gray-300 dark:border-dark-border-secondary text-gray-900 dark:text-dark-text-primary placeholder:text-gray-500 dark:placeholder:text-dark-text-placeholder focus:border-nutri-green focus:ring-nutri-green/20 dark:focus:border-dark-accent-green"
        />
      </div>

      {/* Date and Time Field */}
      <div className="space-y-2">
        <Label htmlFor="start_time" className="text-base font-semibold text-gray-900 dark:text-dark-text-primary">
          Data e Hora *
        </Label>
        <Input
          id="start_time"
          name="start_time"
          type="datetime-local"
          value={typeof formData.start_time === 'string' ? formData.start_time : ''}
          onChange={handleChange}
          required
          className={`h-12 text-base bg-white dark:bg-dark-bg-elevated border-gray-300 dark:border-dark-border-secondary text-gray-900 dark:text-dark-text-primary focus:border-nutri-green focus:ring-nutri-green/20 dark:focus:border-dark-accent-green ${
            hasConflict ? 'border-red-500 focus:border-red-500' : ''
          }`}
        />
        
        {/* Conflict Checker */}
        {date && time && (
          <AppointmentConflictChecker
            selectedDate={date}
            selectedTime={time}
            excludeId={isEditing ? formData.id : undefined}
            onConflictChange={setHasConflict}
          />
        )}
      </div>

      {/* Notes Field */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-base font-semibold text-gray-900 dark:text-dark-text-primary">
          Observações
        </Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          rows={4}
          placeholder="Observações importantes sobre a consulta..."
          className="text-base bg-white dark:bg-dark-bg-elevated border-gray-300 dark:border-dark-border-secondary text-gray-900 dark:text-dark-text-primary placeholder:text-gray-500 dark:placeholder:text-dark-text-placeholder focus:border-nutri-green focus:ring-nutri-green/20 dark:focus:border-dark-accent-green resize-none"
        />
      </div>

      {/* Recommendations Field (for editing) */}
      {isEditing && (
        <div className="space-y-2">
          <Label htmlFor="recommendations" className="text-base font-semibold text-gray-900 dark:text-dark-text-primary">
            Recomendações
          </Label>
          <Textarea
            id="recommendations"
            name="recommendations"
            value={formData.recommendations || ''}
            onChange={handleChange}
            rows={3}
            placeholder="Recomendações da consulta..."
            className="text-base bg-white dark:bg-dark-bg-elevated border-gray-300 dark:border-dark-border-secondary text-gray-900 dark:text-dark-text-primary placeholder:text-gray-500 dark:placeholder:text-dark-text-placeholder focus:border-nutri-green focus:ring-nutri-green/20 dark:focus:border-dark-accent-green resize-none"
          />
        </div>
      )}

      {/* Status Field (only for editing) */}
      {isEditing && (
        <div className="space-y-2">
          <Label htmlFor="status" className="text-base font-semibold text-gray-900 dark:text-dark-text-primary">
            Status da Consulta
          </Label>
          <StatusSelect 
            value={formData.status || 'scheduled'} 
            onChange={(value) => handleSelectChange('status', value)} 
          />
        </div>
      )}
    </div>
  );
};

export default AppointmentFormFields;
