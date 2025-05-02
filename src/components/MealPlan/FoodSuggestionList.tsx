
import React from 'react';

interface FoodSuggestionListProps {
  suggestions: string[];
}

const FoodSuggestionList = ({ suggestions }: FoodSuggestionListProps) => {
  if (!suggestions || suggestions.length === 0) {
    return <li className="text-gray-500">Nenhuma sugestão disponível</li>;
  }

  return (
    <>
      {suggestions.map((suggestion, idx) => (
        <li key={idx} className="text-gray-600">• {suggestion}</li>
      ))}
    </>
  );
};

export default FoodSuggestionList;
