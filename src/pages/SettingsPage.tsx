
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Bell, Building2, CreditCard } from 'lucide-react';
import ProfileSettings from '@/components/Settings/ProfileSettings';
import NotificationSettings from '@/components/Settings/NotificationSettings';
import BusinessSettings from '@/components/Settings/BusinessSettings';
import SubscriptionSettings from '@/components/Settings/SubscriptionSettings';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';

const SettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <BreadcrumbNav />
      
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Clínica
          </TabsTrigger>
          
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Assinatura
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <BusinessSettings />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
