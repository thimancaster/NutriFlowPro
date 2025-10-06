import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from './ui/sonner';

/**
 * Componente principal de Layout para a área logada da aplicação.
 * Inclui a barra de navegação e renderiza o conteúdo da rota ativa através do <Outlet />.
 */
export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children || <Outlet />}
      </main>
      <Toaster />
    </div>
  );
}
