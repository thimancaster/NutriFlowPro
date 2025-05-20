
import React, { useEffect, useRef } from 'react';

/**
 * Component to load Hotmart checkout script and styles
 */
const HotmartScriptLoader: React.FC = () => {
  const scriptLoaded = useRef(false);
  const linkLoaded = useRef(false);
  
  useEffect(() => {
    // Evite carregar o script várias vezes
    if (document.querySelector('script[src="https://static.hotmart.com/checkout/widget.min.js"]')) {
      scriptLoaded.current = true;
    }
    
    // Evite carregar o CSS várias vezes
    if (document.querySelector('link[href="https://static.hotmart.com/css/hotmart-fb.min.css"]')) {
      linkLoaded.current = true;
    }
    
    if (!scriptLoaded.current) {
      const script = document.createElement('script');
      script.src = 'https://static.hotmart.com/checkout/widget.min.js';
      script.async = true;
      document.head.appendChild(script);
      scriptLoaded.current = true;
    }
    
    if (!linkLoaded.current) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://static.hotmart.com/css/hotmart-fb.min.css';
      document.head.appendChild(link);
      linkLoaded.current = true;
    }
    
    return () => {
      // Não remova os scripts/estilos ao desmontar o componente
      // para evitar carregamentos repetidos
    };
  }, []);

  return null;
};

export default HotmartScriptLoader;
