
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettings from '@/components/Settings/ProfileSettings';
import SubscriptionSettings from '@/components/Settings/SubscriptionSettings';
import UserInfoHeader from '@/components/UserInfoHeader';

const Settings = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <UserInfoHeader />
      
      <div className="max-w-4xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Configurações</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="subscription">Assinatura</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>
          
          <TabsContent value="subscription">
            <SubscriptionSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
