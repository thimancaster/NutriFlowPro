import React from 'react';
interface AuthHeaderProps {
  title: string;
  subtitle: string;
}
const AuthHeader = ({
  title,
  subtitle
}: AuthHeaderProps) => {
  return <div className="text-center animate-fade-in text-primary-foreground">
      <h1 className="text-5xl font-bold mb-3 animate-slide-in-from-top text-primary-foreground">
        {title}
      </h1>
      <p style={{
      animationDelay: '0.2s'
    }} className="text-xl font-medium animate-slide-in-from-bottom bg-transparent text-destructive-foreground">
        {subtitle}
      </p>
    </div>;
};
export default AuthHeader;