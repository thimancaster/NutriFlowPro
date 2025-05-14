
import { useState, useEffect } from 'react';
import { Patient, AddressDetails } from '@/types';
import { useAddressState } from './useAddressState';

interface FormState {
  name: string;
  sex: string;
  objective: string;
  profile: string;
  email: string;
  phone: string;
  secondaryPhone: string;
  cpf: string;
  status: 'active' | 'archived';
}

export const usePatientFormState = (editPatient?: Patient, initialData?: any) => {
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("basic-info");
  const [notes, setNotes] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<FormState>({
    name: '',
    sex: '',
    objective: '',
    profile: '',
    email: '',
    phone: '',
    secondaryPhone: '',
    cpf: '',
    status: 'active',
  });

  const { address, setAddress, handleAddressChange } = useAddressState();

  // If we're editing a patient or have initial data, populate the form
  useEffect(() => {
    if (editPatient) {
      setFormData({
        name: editPatient.name || '',
        sex: editPatient.gender || '',
        objective: editPatient.goals?.objective || '',
        profile: editPatient.goals?.profile || '',
        email: editPatient.email || '',
        phone: editPatient.phone || '',
        secondaryPhone: editPatient.secondaryPhone || '',
        cpf: editPatient.cpf || '',
        status: editPatient.status || 'active',
      });

      if (editPatient.address && typeof editPatient.address === 'object') {
        const addressObj = editPatient.address as AddressDetails;
        setAddress({
          cep: addressObj.cep || '',
          street: addressObj.street || '',
          number: addressObj.number || '',
          complement: addressObj.complement || '',
          neighborhood: addressObj.neighborhood || '',
          city: addressObj.city || '',
          state: addressObj.state || '',
        });
      }

      setNotes(editPatient.notes || '');

      if (editPatient.birth_date) {
        setBirthDate(new Date(editPatient.birth_date));
      }
    } else if (initialData) {
      // Use data passed from calculator
      setFormData({
        name: initialData.name || '',
        sex: initialData.gender || '',
        objective: initialData.objective || '',
        profile: initialData.profile || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        secondaryPhone: initialData.secondaryPhone || '',
        cpf: initialData.cpf || '',
        status: 'active',
      });
      
      if (initialData.age) {
        // Set an approximate birth date based on age
        const today = new Date();
        const birthYear = today.getFullYear() - parseInt(initialData.age);
        setBirthDate(new Date(birthYear, 0, 1));
      }
    }
  }, [editPatient, initialData, setAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  return {
    birthDate,
    setBirthDate,
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    notes,
    setNotes,
    handleChange,
    handleSelectChange,
    handleNotesChange,
    address,
    handleAddressChange,
  };
};
