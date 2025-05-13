
import React from 'react';
import { Button } from '@/components/ui/button';

interface PatientPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const PatientPagination: React.FC<PatientPaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  if (totalPages <= 1) return null;
  
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    
    return currentPage - 2 + i;
  });
  
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-500">
        Mostrando {Math.min(pageSize * (currentPage - 1) + 1, totalItems)} a {Math.min(pageSize * currentPage, totalItems)} de {totalItems} pacientes
      </div>
      
      <div className="flex space-x-1">
        <Button 
          variant="outline" 
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Anterior
        </Button>
        
        {currentPage > 3 && totalPages > 5 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
            >
              1
            </Button>
            {currentPage > 4 && (
              <Button variant="outline" size="sm" disabled>
                ...
              </Button>
            )}
          </>
        )}
        
        {pages.map(page => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        
        {currentPage < totalPages - 2 && totalPages > 5 && (
          <>
            {currentPage < totalPages - 3 && (
              <Button variant="outline" size="sm" disabled>
                ...
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </Button>
          </>
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
};

export default PatientPagination;
