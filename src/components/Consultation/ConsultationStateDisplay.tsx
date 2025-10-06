
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface ConsultationErrorProps {
  error: Error;
}

export const ConsultationError: React.FC<ConsultationErrorProps> = ({ error }) => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardContent className="p-8">
          <h2 className="text-xl font-bold text-red-600 mb-4">Erro ao carregar consulta</h2>
          <p>{error.message || "Ocorreu um erro ao carregar os dados da consulta"}</p>
          <button 
            className="mt-4 px-4 py-2 bg-nutri-blue text-white rounded hover:bg-blue-700"
            onClick={() => navigate('/app')}
          >
            Voltar para o Dashboard
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export const ConsultationLoading: React.FC = () => (
  <div className="container mx-auto py-8 px-4">
    <Card>
      <CardContent className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutri-green"></div>
        <span className="ml-3">Carregando consulta...</span>
      </CardContent>
    </Card>
  </div>
);

export const ConsultationNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardContent className="p-8">
          <h2 className="text-xl font-bold mb-4">Consulta não encontrada</h2>
          <p>A consulta solicitada não foi encontrada ou você não tem permissão para acessá-la.</p>
          <button 
            className="mt-4 px-4 py-2 bg-nutri-blue text-white rounded hover:bg-blue-700"
            onClick={() => navigate('/app')}
          >
            Voltar para o Dashboard
          </button>
        </CardContent>
      </Card>
    </div>
  );
};
