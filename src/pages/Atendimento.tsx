/**
 * DEPRECATED - This page has been replaced by the unified clinical workflow
 * Redirects to the new unified clinical page
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Atendimento() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/clinico', { replace: true });
  }, [navigate]);
  
  return null;
}
