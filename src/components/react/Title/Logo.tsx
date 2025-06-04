import React, { useState, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import styles from './Logo.module.scss';
import SanderArrow from './SanderArrow';

const Logo = () => {
  const [hovered, setHovered] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  // Initialize spring with default values
  const [props, api] = useSpring(() => ({
    transform: 'scale(1) perspective(20px) rotateX(5deg) rotateY(0deg)',
    filter: 'drop-shadow(0 0 2px rgba(51, 102, 205, 0.3))',
    config: {
      tension: 400,
      friction: 15,
      mass: 1,
    },
  }));

  // Handle mouse movement to update the transform
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!logoRef.current) return;

    // Get the bounding rectangle of the element
    const rect = logoRef.current.getBoundingClientRect();

    // Calculate mouse position relative to the element center (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Apply the rotation based on mouse position
    // Invert y for natural tilt feel
    api.start({
      transform: `scale(1.2) perspective(20px) rotateX(${-y * 30}deg) rotateY(${
        x * 30
      }deg)`,
      filter: `drop-shadow(${x * 10}px ${
        y * 10
      }px 8px rgba(51, 102, 205, 0.3))`,
      immediate: false,
    });
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    // Reset to default position when the mouse leaves
    api.start({
      transform: 'scale(1) perspective(20px) rotateX(5deg) rotateY(0deg)',
      filter: 'drop-shadow(0 0 2px rgba(51, 102, 205, 0.1))',
      immediate: false,
    });
  };

  return (
    <div className={styles.logoContainer}>
      <animated.div
        ref={logoRef}
        className={styles.logoBox}
        style={props}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.logoImage}>
          <SanderArrow />
        </div>
      </animated.div>
    </div>
  );
};

export default Logo;
