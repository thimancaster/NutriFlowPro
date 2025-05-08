
import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthLoadingScreenProps {
  message?: string;
}

const AuthLoadingScreen = ({ message = "Verificando autenticação..." }: AuthLoadingScreenProps) => {
  return (
    <div className="min-h-screen bg-nutri-blue flex flex-col items-center justify-center">
      <Loader2 size={48} className="text-white animate-spin" />
      <p className="mt-4 text-white">{message}</p>
    </div>
  );
};

export default AuthLoadingScreen;
