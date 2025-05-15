
// Simple animation utility for auth components

export type AnimationTiming = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
export type AnimationType = 'fade' | 'scale' | 'slide' | 'rotate';

export interface AnimationOptions {
  duration?: number;
  delay?: number;
  timing?: AnimationTiming;
  type?: AnimationType;
  direction?: 'in' | 'out';
}

/**
 * Gets tailwind classes for animation based on options
 */
export const getAnimationClasses = (options: AnimationOptions = {}): string => {
  const {
    duration = 300,
    delay = 0,
    timing = 'ease-out',
    type = 'fade',
    direction = 'in'
  } = options;

  // Base animation classes
  let animationClass = 'transition-all ';
  
  // Duration
  if (duration === 300) {
    animationClass += 'duration-300 ';
  } else if (duration === 500) {
    animationClass += 'duration-500 ';
  } else if (duration === 700) {
    animationClass += 'duration-700 ';
  } else {
    animationClass += `duration-[${duration}ms] `;
  }
  
  // Delay
  if (delay > 0) {
    animationClass += `delay-[${delay}ms] `;
  }
  
  // Timing function
  switch (timing) {
    case 'ease-in':
      animationClass += 'ease-in ';
      break;
    case 'ease-out':
      animationClass += 'ease-out ';
      break;
    case 'ease-in-out':
      animationClass += 'ease-in-out ';
      break;
    case 'linear':
      animationClass += 'linear ';
      break;
    default:
      animationClass += 'ease ';
  }

  // Animation type
  if (type === 'fade' && direction === 'in') {
    animationClass += 'animate-fade-in ';
  } else if (type === 'fade' && direction === 'out') {
    animationClass += 'animate-fade-out ';
  } else if (type === 'scale' && direction === 'in') {
    animationClass += 'animate-scale-in ';
  } else if (type === 'scale' && direction === 'out') {
    animationClass += 'animate-scale-out ';
  }

  return animationClass.trim();
};

/**
 * Gets a staggered animation delay for list items
 */
export const getStaggeredDelay = (index: number, baseDelay: number = 50): number => {
  return baseDelay * index;
};

/**
 * Apply hover animation classes
 */
export const getHoverAnimationClasses = (type: 'scale' | 'lift' | 'glow' | 'underline'): string => {
  switch (type) {
    case 'scale':
      return 'hover-scale';
    case 'lift':
      return 'hover-lift';
    case 'glow':
      return 'hover:shadow-lg hover:shadow-primary/20';
    case 'underline':
      return 'text-link';
    default:
      return '';
  }
};
