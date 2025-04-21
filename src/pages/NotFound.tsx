
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileSearch } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-50">
      <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <FileSearch size={40} className="text-red-500" />
        </div>
        <h1 className="text-4xl font-bold mb-2 text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Página não encontrada</p>
        <p className="text-gray-500 mb-6">
          A página que você está procurando pode ter sido removida ou não está disponível temporariamente.
        </p>
        <a href="/">
          <Button className="bg-gradient-to-r from-nutri-blue to-nutri-blue-dark hover:opacity-90">
            Voltar para o Início
          </Button>
        </a>
      </div>
    </div>
  );
};

export default NotFound;
