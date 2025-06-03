
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthHeader from '@/components/auth/AuthHeader';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import ForgotPasswordSuccess from '@/components/auth/ForgotPasswordSuccess';

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout>
      <AuthHeader
        title="NutriFlow Pro"
        subtitle="Sistema completo para nutricionistas"
      />

      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-6 sm:p-8 max-w-md w-full mx-auto">
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
