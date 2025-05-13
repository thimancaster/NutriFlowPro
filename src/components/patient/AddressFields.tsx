import React from 'react';
import { TextField, SelectField } from './fields';
import { formatCep } from '@/utils/patientValidation';

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
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ ...address, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    onChange({ ...address, [name]: value });
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
        onBlur={() => validateField('address.cep', address.cep)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          id="street"
          name="street"
          label="Rua"
          value={address.street || ''}
          onChange={handleAddressChange}
        />
        <TextField
          id="number"
          name="number"
          label="Número"
          value={address.number || ''}
          onChange={handleAddressChange}
        />
      </div>
      <TextField
        id="complement"
        name="complement"
        label="Complemento"
        value={address.complement || ''}
        onChange={handleAddressChange}
      />
      <TextField
        id="neighborhood"
        name="neighborhood"
        label="Bairro"
        value={address.neighborhood || ''}
        onChange={handleAddressChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          id="city"
          name="city"
          label="Cidade"
          value={address.city || ''}
          onChange={handleAddressChange}
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
        />
      </div>
    </>
  );
};

export default AddressFields;
