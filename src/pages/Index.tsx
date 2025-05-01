
import React, { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import { ImageWithFallback } from '@/components/ui/image-with-fallback';
import { motion } from 'framer-motion';
import { useAuthState } from '@/hooks/useAuthState';
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  name: string | null;
  specialty: string | null;
  clinic_name: string | null;
}

const Index = () => {
  const { user } = useAuthState();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, specialty, clinic_name')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        if (data) setUserProfile(data);
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      }
    };
    
    fetchUserProfile();
  }, [user?.id]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-between mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-nutri-blue">
              <span className="text-nutri-green">Nutri</span>Flow Pro
            </h1>
            <p className="text-gray-600">Sistema completo de gestão nutricional</p>
            {userProfile?.name ? (
              <div className="text-sm text-gray-500 mt-2 space-y-1">
                <p>
                  Bem-vindo(a), <span className="font-medium">{userProfile.name}</span>
                </p>
                {userProfile.specialty && (
                  <p>Especialidade: <span className="font-medium">{userProfile.specialty}</span></p>
                )}
                {userProfile.clinic_name && (
                  <p>Clínica: <span className="font-medium">{userProfile.clinic_name}</span></p>
                )}
              </div>
            ) : user?.email ? (
              <p className="text-sm text-gray-500 mt-1">
                Bem-vindo(a), {user.email}
              </p>
            ) : null}
          </div>
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1035&q=80" 
            alt="Nutrição saudável" 
            className="w-full md:w-1/3 rounded-xl shadow-lg mt-4 md:mt-0"
            fallbackSrc="/placeholder.svg"
          />
        </motion.div>
        <Dashboard />
      </div>
    </div>
  );
};

export default Index;
