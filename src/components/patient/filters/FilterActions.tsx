
import React from 'react';
import { Button } from '@/components/ui/button';

interface FilterActionsProps {
  onReset: () => void;
  onSearch: () => void;
}

const FilterActions: React.FC<FilterActionsProps> = ({ onReset, onSearch }) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button variant="outline" onClick={onReset}>Resetar</Button>
      <Button onClick={onSearch}>Buscar</Button>
    </div>
  );
};

export default FilterActions;
