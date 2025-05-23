
import React, { useState } from 'react';
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const ImageWithFallback = React.forwardRef<HTMLImageElement, ImageWithFallbackProps>(
  ({ src, alt, className, fallbackSrc = "/placeholder.svg", ...props }, ref) => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    return (
      <div className={cn("relative", className)}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded animate-pulse">
            <span className="sr-only">Carregando...</span>
          </div>
        )}
        <img
          ref={ref}
          src={error || !src ? fallbackSrc : src}
          alt={alt}
          onError={() => setError(true)}
          onLoad={() => setLoading(false)}
          loading="lazy"
          className={cn("object-cover", loading ? "opacity-0" : "opacity-100", className)}
          {...props}
        />
      </div>
    );
  }
);

ImageWithFallback.displayName = "ImageWithFallback";
