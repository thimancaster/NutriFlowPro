
import React, { useState } from 'react';
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const ImageWithFallback = React.forwardRef<HTMLImageElement, ImageWithFallbackProps>(
  ({ src, alt, className, fallbackSrc = "/placeholder.svg", ...props }, ref) => {
    const [error, setError] = useState(false);

    return (
      <img
        ref={ref}
        src={error ? fallbackSrc : src}
        alt={alt}
        onError={() => setError(true)}
        className={cn("object-cover", className)}
        {...props}
      />
    );
  }
);

ImageWithFallback.displayName = "ImageWithFallback";
