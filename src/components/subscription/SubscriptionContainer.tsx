
import React, { memo } from 'react';

interface SubscriptionContainerProps {
  children: React.ReactNode;
}

/**
 * Container component for the subscription page
 */
const SubscriptionContainer: React.FC<SubscriptionContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {children}
      </div>
    </div>
  );
};

export default memo(SubscriptionContainer);
