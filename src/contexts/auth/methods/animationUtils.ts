
import { cn } from "@/lib/utils";

// Button animation styles
export const getButtonAnimationClass = (type?: string) => {
  const baseAnimation = "transform transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]";
  
  switch (type) {
    case 'shimmer':
      return cn(baseAnimation, "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent");
    case 'pulse':
      return cn(baseAnimation, "animate-pulse");
    case 'bounce':
      return cn(baseAnimation, "hover:animate-bounce");
    default:
      return baseAnimation;
  }
};

// Component animation styles for fade-in and scale effects
export const getComponentAnimationClass = (type?: string) => {
  switch (type) {
    case 'fade-in':
      return "animate-fade-in";
    case 'scale-in':
      return "animate-scale-in";
    case 'slide-in-from-left':
      return "animate-slide-in-from-left";
    case 'slide-in-from-right':
      return "animate-slide-in-from-right";
    case 'slide-in-from-top':
      return "animate-slide-in-from-top";
    case 'slide-in-from-bottom':
      return "animate-slide-in-from-bottom";
    default:
      return "";
  }
};

// Avatar and profile element animations
export const getAvatarAnimationClass = () => {
  return "transition-all duration-300 hover:shadow-md hover:scale-105 hover:ring-2 hover:ring-nutri-green hover:ring-opacity-50";
};
