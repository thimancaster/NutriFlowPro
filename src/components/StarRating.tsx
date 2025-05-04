
import React from 'react';
import { Star, StarHalf, StarOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  className?: string;
  showEmpty?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  maxRating = 5, 
  size = 18, 
  className,
  showEmpty = true
}) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star 
        key={`star-${i}`} 
        size={size}
        className="text-yellow-400 fill-yellow-400"
      />
    );
  }
  
  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <StarHalf 
        key="half-star" 
        size={size}
        className="text-yellow-400 fill-yellow-400"
      />
    );
  }
  
  // Add empty stars to fill up to maxRating
  if (showEmpty) {
    const emptyStars = maxRating - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarOff 
          key={`empty-${i}`} 
          size={size}
          className="text-gray-300"
        />
      );
    }
  }
  
  return (
    <div className={cn("flex items-center", className)}>
      {stars}
    </div>
  );
};

export default StarRating;
