
import React, { useState } from 'react';
import { TextField } from './FormFields';
import { fetchAddressByCep } from '@/services/cepService';
import { formatCep } from '@/utils/patientValidation';
import { Loader2 } from 'lucide-react';

interface Address {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface AddressFieldsProps {
  address: Address;
  onChange: (address: Address) => void;
  errors: Record<string, string>;
  validateField: (field: string, value: any) => void;
}

const AddressFields = ({ address, onChange, errors, validateField }: AddressFieldsProps) => {
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = name.split('.')[1]; // address.field format
    
    onChange({
      ...address,
      [field]: value
    });
  };

  const handleCepBlur = async () => {
    if (address.cep && address.cep.replace(/\D/g, '').length === 8) {
      setIsLoadingCep(true);
      
      try {
        const addressData = await fetchAddressByCep(address.cep);
        
        if (addressData && !addressData.erro) {
          onChange({
            ...address,
            street: addressData.logradouro || '',
            neighborhood: addressData.bairro || '',
            city: addressData.localidade || '',
            state: addressData.uf || '',
          });
        }
      } catch (error) {
        console.error('Error fetching address by CEP:', error);
      } finally {
        setIsLoadingCep(false);
      }
    }
    
    validateField('address.cep', address.cep);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Endereço</h3>
      
      <div className="flex gap-4 items-center">
        <div className="w-1/3">
          <TextField
            id="address.cep"
            name="address.cep"
            label="CEP"
            value={address.cep}
            onChange={handleChange}
            mask={formatCep}
            placeholder="00000-000"
            onBlur={handleCepBlur}
            error={errors['address.cep']}
          />
        </div>
        {isLoadingCep && (
          <div className="flex items-center mt-6">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-gray-500">Buscando endereço...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <TextField
            id="address.street"
            name="address.street"
            label="Logradouro"
            value={address.street}
            onChange={handleChange}
            error={errors['address.street']}
          />
        </div>
        <div>
          <TextField
            id="address.number"
            name="address.number"
            label="Número"
            value={address.number}
            onChange={handleChange}
            error={errors['address.number']}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          id="address.complement"
          name="address.complement"
          label="Complemento"
          value={address.complement}
          onChange={handleChange}
          error={errors['address.complement']}
        />
        <TextField
          id="address.neighborhood"
          name="address.neighborhood"
          label="Bairro"
          value={address.neighborhood}
          onChange={handleChange}
          error={errors['address.neighborhood']}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <TextField
            id="address.city"
            name="address.city"
            label="Cidade"
            value={address.city}
            onChange={handleChange}
            error={errors['address.city']}
          />
        </div>
        <div>
          <TextField
            id="address.state"
            name="address.state"
            label="Estado"
            value={address.state}
            onChange={handleChange}
            error={errors['address.state']}
          />
        </div>
      </div>
    </div>
  );
};

export default AddressFields;
