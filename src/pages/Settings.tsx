
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettings from '@/components/Settings/ProfileSettings';
import SubscriptionSettings from '@/components/Settings/SubscriptionSettings';
import UserInfoHeader from '@/components/UserInfoHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, CreditCard, Shield } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';
import { useAuth } from '@/contexts/auth/AuthContext';
import SystemHealthMonitor from '@/components/system/SystemHealthMonitor';

const Settings = () => {
  const { user } = useAuth();
  // TODO: Implement premium status check via user context or separate hook
  const isPremium = false; // Placeholder until premium logic is implemented
  
  // Check if user is admin
  const isAdmin = user?.email && ['thimancaster@hotmail.com', 'thiago@nutriflowpro.com'].includes(user.email);

  // Add console logs to help with debugging
  console.log("Settings page rendering, isPremium:", isPremium);

  useEffect(() => {
    console.log("Settings page mounted");
    return () => {
      console.log("Settings page unmounted");
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center mb-6 space-x-4">
          <BackButton to="/dashboard" label="Voltar para o Dashboard" />
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        </div>
        
        <UserInfoHeader />
        
        <div className="max-w-4xl mx-auto mt-8">
          <p className="text-muted-foreground mb-6">Gerencie seu perfil e assinatura</p>
          
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
        
        {/* Security Dashboard - Admin Only */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Dashboard de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Dashboard de segurança disponível em breve
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* System Health Monitor - Only visible in Settings page */}
      <SystemHealthMonitor />
    </div>
  );
};

export default Settings;
