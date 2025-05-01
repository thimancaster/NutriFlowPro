
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettings from '@/components/Settings/ProfileSettings';
import SubscriptionSettings from '@/components/Settings/SubscriptionSettings';
import UserInfoHeader from '@/components/UserInfoHeader';
import { Card } from '@/components/ui/card';
import { User, CreditCard, Shield } from 'lucide-react';
import { useAuthState } from '@/hooks/useAuthState';

const Settings = () => {
  const { isPremium } = useAuthState();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <UserInfoHeader />
      
      <div className="max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configurações</h1>
        <p className="text-gray-500 mb-6">Gerencie seu perfil e assinatura</p>
        
        <Card className={`p-6 ${isPremium ? 'border-t-4 border-amber-400' : ''}`}>
          {isPremium && (
            <div className="mb-6 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-md flex items-center">
              <Shield className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-amber-800 font-medium">Você tem acesso premium ativo</span>
            </div>
          )}
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Assinatura</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <ProfileSettings />
            </TabsContent>
            
            <TabsContent value="subscription">
              <SubscriptionSettings />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
