import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldX, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Layout component for admin-only routes
 * Checks user_roles table for admin role before rendering
 */
const AdminProtectedLayout: React.FC = () => {
  const { isAdmin, isLoading, error } = useUserRole();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-destructive/10 rounded-full w-fit">
              <ShieldX className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Acesso Restrito</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Esta área é exclusiva para administradores do sistema.
              {error && <span className="block text-destructive text-sm mt-2">{error}</span>}
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminProtectedLayout;
