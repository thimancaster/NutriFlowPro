
import { useState } from 'react';
import { logger } from '@/utils/logger';

export const usePatientTabs = () => {
  const [activeTab, setActiveTab] = useState('info');
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    logger.info(`Changed to tab: ${value}`);
  };
  
  return {
    activeTab,
    handleTabChange
  };
};
