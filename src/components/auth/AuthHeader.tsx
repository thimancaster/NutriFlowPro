
import React from 'react';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold text-white mb-3">{title}</h1>
      <p className="text-blue-100 text-xl font-medium">{subtitle}</p>
    </div>
  );
};

export default AuthHeader;
