
import React from 'react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
      <p className="text-blue-100 text-lg">{subtitle}</p>
    </div>
  );
};

export default AuthHeader;
