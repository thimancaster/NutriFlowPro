
import React from 'react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  return (
    <div className="text-center animate-fade-in">
      <h1 className="text-5xl font-bold text-white mb-3 animate-slide-in-from-top">
        {title}
      </h1>
      <p className="text-blue-100 text-xl font-medium animate-slide-in-from-bottom" style={{ animationDelay: '0.2s' }}>
        {subtitle}
      </p>
    </div>
  );
};

export default AuthHeader;
