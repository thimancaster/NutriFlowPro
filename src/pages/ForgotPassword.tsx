
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import ForgotPasswordSuccess from '@/components/auth/ForgotPasswordSuccess';

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout>
      <AuthHeader
        title="NutriFlow Pro"
        subtitle="Sistema completo para nutricionistas"
      />

      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8">
        <div className="flex items-center mb-6">
          <Link to="/login" className="text-sm text-blue-200 hover:text-white flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar para login
          </Link>
        </div>
        
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-white">Recuperar Senha</h2>
          <p className="mt-2 text-blue-100">
            {!isSubmitted 
              ? "Digite seu e-mail para receber um link de recuperação de senha." 
              : "E-mail enviado com sucesso!"}
          </p>
        </div>
        
        {!isSubmitted ? (
          <ForgotPasswordForm onSuccess={() => setIsSubmitted(true)} />
        ) : (
          <ForgotPasswordSuccess onTryAgain={() => setIsSubmitted(false)} />
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
