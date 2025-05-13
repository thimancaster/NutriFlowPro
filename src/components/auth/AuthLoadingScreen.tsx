
import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthLoadingScreenProps {
  message?: string;
}

const AuthLoadingScreen = ({ message = "Verificando autenticação..." }: AuthLoadingScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nutri-blue via-nutri-blue-dark to-blue-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white opacity-5 rounded-full mix-blend-overlay transform -translate-y-1/2 -translate-x-1/2 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-nutri-green opacity-10 rounded-full mix-blend-overlay transform translate-y-1/2 translate-x-1/2 animate-pulse" style={{ animationDelay: '300ms' }}></div>
      </div>
      
      <div className="relative z-10 backdrop-blur-md bg-white/10 p-10 rounded-xl border border-white/20 shadow-2xl flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-white/10 animate-ping"></div>
          <Loader2 size={54} className="text-white animate-spin" />
        </div>
        <p className="mt-6 text-white text-lg font-medium">{message}</p>
        <p className="mt-2 text-blue-200 text-sm max-w-xs text-center">
          Estamos preparando tudo para você. Isso pode levar alguns instantes...
        </p>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
