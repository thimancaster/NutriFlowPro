
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import UnifiedRegistrationForm from '@/components/auth/UnifiedRegistrationForm';

const UnifiedSignup = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSuccess = () => {
    navigate('/login', { 
      state: { 
        message: 'Conta criada! Verifique seu email antes de fazer login.' 
      }
    });
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <AuthLayout>
      <AuthHeader 
        title="NutriFlow Pro" 
        subtitle="Sistema completo para nutricionistas" 
      />

      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8 max-w-md w-full mx-auto">
        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          Criar Conta
        </h2>
        
        <UnifiedRegistrationForm 
          onSuccess={handleSuccess}
          onBackToLogin={handleBackToLogin}
        />

        <div className="mt-6 text-center">
          <p className="text-blue-100">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-white hover:underline font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default UnifiedSignup;
