
import React, { useState } from 'react';
import TextField from './fields/TextField';
import { SelectField } from './fields';
import { formatCep } from '@/utils/patientValidation';
import { fetchAddressByCep } from '@/services/cepService';
import { useToast } from '@/hooks/use-toast';

interface AddressFieldsProps {
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  onChange: (address: any) => void;
  errors: Record<string, string>;
  validateField: (field: string, value: any) => void;
}

const AddressFields = ({ address, onChange, errors, validateField }: AddressFieldsProps) => {
  const { toast } = useToast();
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...address, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    onChange({ ...address, [name]: value });
  };

  const handleCepBlur = async () => {
    // Only proceed if we have a valid CEP format
    if (address.cep && address.cep.length === 9) { // CEP format: 00000-000
      try {
        setIsLoadingCep(true);
        
        // Fetch address data from CEP API
        const cepData = await fetchAddressByCep(address.cep);
        
        if (cepData) {
          // Update form with retrieved address data
          onChange({
            ...address,
            street: cepData.logradouro || address.street,
            neighborhood: cepData.bairro || address.neighborhood,
            city: cepData.localidade || address.city,
            state: cepData.uf || address.state,
          });
          
          toast({
            title: "CEP encontrado",
            description: "Endereço preenchido automaticamente",
          });
        } else {
          toast({
            title: "CEP não encontrado",
            description: "Verifique o CEP informado",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        toast({
          title: "Erro ao consultar CEP",
          description: "Não foi possível obter os dados do endereço",
          variant: "destructive"
        });
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  return (
    <>
      <TextField
        id="cep"
        name="cep"
        label="CEP"
        value={address.cep || ''}
        onChange={handleAddressChange}
        mask={formatCep}
        placeholder="00000-000"
        error={errors['address.cep']}
        onBlur={() => {
          validateField('address.cep', address.cep);
          handleCepBlur();
        }}
        isLoading={isLoadingCep}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          id="street"
          name="street"
          label="Rua"
          value={address.street || ''}
          onChange={handleAddressChange}
          error={errors['address.street']}
          onBlur={() => validateField('address.street', address.street)}
        />
        <TextField
          id="number"
          name="number"
          label="Número"
          value={address.number || ''}
          onChange={handleAddressChange}
          error={errors['address.number']}
          onBlur={() => validateField('address.number', address.number)}
        />
      </div>
      
      <TextField
        id="complement"
        name="complement"
        label="Complemento"
        value={address.complement || ''}
        onChange={handleAddressChange}
        error={errors['address.complement']}
      />
      
      <TextField
        id="neighborhood"
        name="neighborhood"
        label="Bairro"
        value={address.neighborhood || ''}
        onChange={handleAddressChange}
        error={errors['address.neighborhood']}
        onBlur={() => validateField('address.neighborhood', address.neighborhood)}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          id="city"
          name="city"
          label="Cidade"
          value={address.city || ''}
          onChange={handleAddressChange}
          error={errors['address.city']}
          onBlur={() => validateField('address.city', address.city)}
        />
        <SelectField
          id="state"
          label="Estado"
          value={address.state || ''}
          onChange={handleSelectChange.bind(null, 'state')}
          options={[
            { value: 'AC', label: 'Acre' },
            { value: 'AL', label: 'Alagoas' },
            { value: 'AP', label: 'Amapá' },
            { value: 'AM', label: 'Amazonas' },
            { value: 'BA', label: 'Bahia' },
            { value: 'CE', label: 'Ceará' },
            { value: 'DF', label: 'Distrito Federal' },
            { value: 'ES', label: 'Espírito Santo' },
            { value: 'GO', label: 'Goiás' },
            { value: 'MA', label: 'Maranhão' },
            { value: 'MT', label: 'Mato Grosso' },
            { value: 'MS', label: 'Mato Grosso do Sul' },
            { value: 'MG', label: 'Minas Gerais' },
            { value: 'PA', label: 'Pará' },
            { value: 'PB', label: 'Paraíba' },
            { value: 'PR', label: 'Paraná' },
            { value: 'PE', label: 'Pernambuco' },
            { value: 'PI', label: 'Piauí' },
            { value: 'RJ', label: 'Rio de Janeiro' },
            { value: 'RN', label: 'Rio Grande do Norte' },
            { value: 'RS', label: 'Rio Grande do Sul' },
            { value: 'RO', label: 'Rondônia' },
            { value: 'RR', label: 'Roraima' },
            { value: 'SC', label: 'Santa Catarina' },
            { value: 'SP', label: 'São Paulo' },
            { value: 'SE', label: 'Sergipe' },
            { value: 'TO', label: 'Tocantins' },
          ]}
          error={errors['address.state']}
          onBlur={() => validateField('address.state', address.state)}
        />
      </div>
    </>
  );
};

export default AddressFields;
