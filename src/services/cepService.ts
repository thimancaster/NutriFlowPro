
interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

/**
 * Fetches address information from the ViaCEP API
 * @param cep The CEP to search for (formatted or unformatted)
 * @returns Address data or null if not found
 */
export const fetchAddressByCep = async (cep: string): Promise<CepResponse | null> => {
  try {
    // Clean CEP format for API request (remove non-numeric characters)
    const cleanCep = cep.replace(/\D/g, '');
    
    // Validate CEP length
    if (cleanCep.length !== 8) {
      console.log('Invalid CEP length:', cleanCep);
      return null;
    }
    
    // Make API request to ViaCEP service
    console.log(`Fetching address for CEP: ${cleanCep}`);
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    // Check response status
    if (!response.ok) {
      console.error('ViaCEP API error:', response.status);
      return null;
    }
    
    const data: CepResponse = await response.json();
    
    // Check if API returned an error flag
    if (data.erro) {
      console.log('CEP not found');
      return null;
    }
    
    console.log('CEP data received:', data);
    return data;
  } catch (error) {
    console.error("Error fetching CEP data:", error);
    return null;
  }
};
