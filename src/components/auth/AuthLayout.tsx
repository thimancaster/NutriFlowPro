
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nutri-blue via-nutri-blue-dark to-blue-900 flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      {/* Decorative elements com animações */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-white opacity-5 rounded-full mix-blend-overlay transform -translate-y-1/2 -translate-x-1/2 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-nutri-green opacity-10 rounded-full mix-blend-overlay transform translate-y-1/2 translate-x-1/2 animate-pulse-soft"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-400 opacity-5 rounded-full mix-blend-overlay transform -translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="backdrop-blur-md bg-white/10 rounded-xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
