
import React, { useEffect } from 'react';

interface HotmartButtonProps {
  url: string;
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'gradient';
}

const HotmartButton: React.FC<HotmartButtonProps> = ({ 
  url, 
  className = "", 
  children,
  variant = 'default'
}) => {
  useEffect(() => {
    // Add Hotmart checkout script
    const script = document.createElement('script');
    script.src = 'https://static.hotmart.com/checkout/widget.min.js';
    script.async = true;
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://static.hotmart.com/css/hotmart-fb.min.css';
    
    document.head.appendChild(script);
    document.head.appendChild(link);
    
    return () => {
      // Cleanup on unmount
      if (document.head.contains(script)) document.head.removeChild(script);
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);
  
  const baseStyles = "hotmart-fb hotmart__button-checkout w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium py-3 px-6 transition-all duration-300 hover:shadow-md active:scale-[0.98] relative overflow-hidden";
  
  const variantStyles = {
    default: "bg-nutri-blue text-white hover:bg-white hover:text-nutri-blue border border-nutri-blue after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer after:bg-[length:200%_100%] after:opacity-0 hover:after:opacity-100",
    primary: "bg-nutri-blue text-white hover:bg-white hover:text-nutri-blue border border-nutri-blue after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer after:bg-[length:200%_100%] after:opacity-0 hover:after:opacity-100",
    gradient: "bg-gradient-to-r from-nutri-green-light to-nutri-green-dark text-white border border-green-400 hover:shadow-lg hover:translate-y-[-2px] active:translate-y-0 active:shadow-md after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer after:bg-[length:200%_100%] after:opacity-0 hover:after:opacity-100"
  };

  const styles = `${baseStyles} ${variantStyles[variant]} ${className}`;

  return (
    <a 
      href={url}
      className={styles}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

export default HotmartButton;
