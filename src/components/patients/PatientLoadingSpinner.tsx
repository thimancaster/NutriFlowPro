
import React from 'react';

const PatientLoadingSpinner = () => {
  return (
    <div className="flex justify-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nutri-blue"></div>
    </div>
  );
};

export default PatientLoadingSpinner;
