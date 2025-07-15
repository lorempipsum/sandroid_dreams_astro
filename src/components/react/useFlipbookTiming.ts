import { useCallback } from 'react';
import type { ImageData, FlipbookSettings } from './types';

export const useFlipbookTiming = (images: ImageData[], settings: FlipbookSettings) => {
  const calculateDuration = useCallback((index: number): number => {
    const image = images[index];
    if (!image) return settings.baseDuration;

    if (image.isFeatured) {
      return settings.featuredDuration;
    }

    // Calculate easing influence from all featured images
    let totalEasingInfluence = 0;
    const maxEasingDistance = 6; // Ease within 6 images of any featured image
    
    for (let i = 0; i < images.length; i++) {
      if (images[i]?.isFeatured) {
        const distance = Math.abs(i - index);
        
        if (distance <= maxEasingDistance && distance > 0) {
          // Use a smooth cubic easing curve for very gradual transitions
          const normalizedDistance = distance / maxEasingDistance; // 0 to 1
          // Cubic ease-in-out curve: more gradual at the edges
          const t = normalizedDistance;
          const influence = t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
          
          // Invert so closer = more influence
          const easingInfluence = 1 - influence;
          totalEasingInfluence = Math.max(totalEasingInfluence, easingInfluence);
        }
      }
    }

    // Apply easing with smooth interpolation
    if (totalEasingInfluence > 0) {
      const maxSlowdown = 2.8; // Maximum slowdown multiplier  
      const easingMultiplier = 1 + (totalEasingInfluence * (maxSlowdown - 1));
      const finalDuration = Math.round(settings.baseDuration * easingMultiplier);
      
      // Debug logging to see actual values
      console.log(`Image ${index}: influence=${totalEasingInfluence.toFixed(2)}, multiplier=${easingMultiplier.toFixed(2)}, duration=${finalDuration}ms`);
      
      return finalDuration;
    }

    console.log(`Image ${index}: base duration=${settings.baseDuration}ms`);
    return settings.baseDuration;
  }, [images, settings]);

  const calculateTransitionDuration = useCallback((index: number): number => {
    const image = images[index];
    if (!image) return settings.transitionDuration;

    if (image.isFeatured) {
      return settings.transitionDuration; // Keep normal transition for featured images
    }

    // Calculate easing influence from all featured images (same logic as duration)
    let totalEasingInfluence = 0;
    const maxEasingDistance = 6; // Ease within 6 images of any featured image
    
    for (let i = 0; i < images.length; i++) {
      if (images[i]?.isFeatured) {
        const distance = Math.abs(i - index);
        
        if (distance <= maxEasingDistance && distance > 0) {
          // Use a smooth cubic easing curve for very gradual transitions
          const normalizedDistance = distance / maxEasingDistance; // 0 to 1
          // Cubic ease-in-out curve: more gradual at the edges
          const t = normalizedDistance;
          const influence = t < 0.5 
            ? 4 * t * t * t 
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
          
          // Invert so closer = more influence
          const easingInfluence = 1 - influence;
          totalEasingInfluence = Math.max(totalEasingInfluence, easingInfluence);
        }
      }
    }

    // Apply easing with smooth interpolation (same multiplier as duration)
    if (totalEasingInfluence > 0) {
      const maxSlowdown = 2.8; // Same as duration multiplier
      const easingMultiplier = 1 + (totalEasingInfluence * (maxSlowdown - 1));
      const finalTransitionDuration = Math.round(settings.transitionDuration * easingMultiplier);
      
      console.log(`Image ${index}: transition duration scaled to ${finalTransitionDuration}ms (${easingMultiplier.toFixed(2)}x)`);
      
      return finalTransitionDuration;
    }

    return settings.transitionDuration;
  }, [images, settings]);

  return {
    calculateDuration,
    calculateTransitionDuration
  };
};
