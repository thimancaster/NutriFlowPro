
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth/AuthContext';

import BasicInfoFields from './patient/BasicInfoFields';
import GoalsFields from './patient/GoalsFields';
import AddressFields from './patient/AddressFields';
import NotesFields from './patient/NotesFields';
import FormActions from './patient/FormActions';
import { usePatientForm } from '@/hooks/usePatientForm';

interface PatientFormProps {
  onSuccess?: () => void;
  editPatient?: any;
  onCancel?: () => void;
  initialData?: any;
}

const PatientForm = ({ onSuccess, editPatient, onCancel, initialData }: PatientFormProps) => {
  const { user } = useAuth();
  const userId = user?.id || '';
  
  const {
    isLoading,
    birthDate,
    setBirthDate,
    activeTab,
    setActiveTab,
    errors,
    formData,
    address,
    notes,
    handleChange,
    handleSelectChange,
    handleAddressChange,
    handleNotesChange,
    handleValidateField,
    handleSubmit,
  } = usePatientForm({
    editPatient,
    initialData,
    onSuccess,
    userId
  });

  return (
    <Card className="nutri-card w-full">
      <CardHeader>
        <CardTitle>{editPatient ? "Editar Paciente" : "Cadastro de Paciente"}</CardTitle>
        <CardDescription>
          Preencha os dados para {editPatient ? "atualizar" : "cadastrar"} um {editPatient ? "" : "novo"} paciente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="basic-info">Informações Básicas</TabsTrigger>
              <TabsTrigger value="address">Endereço</TabsTrigger>
              <TabsTrigger value="goals-notes">Objetivos e Observações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic-info" className="space-y-4">
              <BasicInfoFields 
                formData={formData}
                birthDate={birthDate}
                setBirthDate={setBirthDate}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                errors={errors}
                validateField={handleValidateField}
              />
            </TabsContent>
            
            <TabsContent value="address" className="space-y-4">
              <AddressFields 
                address={address}
                onChange={handleAddressChange}
                errors={errors}
                validateField={handleValidateField}
              />
            </TabsContent>
            
            <TabsContent value="goals-notes" className="space-y-4">
              <GoalsFields 
                formData={{ objective: formData.objective, profile: formData.profile }}
                handleSelectChange={handleSelectChange}
                errors={errors}
                validateField={handleValidateField}
              />
              
              <NotesFields 
                notes={notes}
                onChange={handleNotesChange}
                errors={errors}
                validateField={handleValidateField}
              />
            </TabsContent>
          </Tabs>
          
          <CardFooter className="px-0 pt-2 pb-0">
            <FormActions 
              isLoading={isLoading}
              onCancel={onCancel}
              isEditMode={!!editPatient}
            />
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientForm;
