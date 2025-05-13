
import { useState } from 'react';

export interface AddressState {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export const useAddressState = (initialAddress?: Partial<AddressState>) => {
  const [address, setAddress] = useState<AddressState>({
    cep: initialAddress?.cep || '',
    street: initialAddress?.street || '',
    number: initialAddress?.number || '',
    complement: initialAddress?.complement || '',
    neighborhood: initialAddress?.neighborhood || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
  });

  const handleAddressChange = (newAddress: Partial<AddressState>) => {
    setAddress(prev => ({ ...prev, ...newAddress }));
  };

  return {
    address,
    setAddress,
    handleAddressChange
  };
};
