import React from 'react';
import AnimatedBobUp from '../../animations/AnimatedBobUp';
import styles from './CompassArrow.module.scss';

interface CompassArrowProps {
  rotation: number;
}

const CompassArrow = ({ rotation }: CompassArrowProps) => (
  <AnimatedBobUp>
    <svg
      className={styles.arrow}
      style={{ transform: `rotate(${rotation}deg)` }}
      viewBox="0 0 210 297"
      width="100"
      height="100"
      fill="none"
      strokeWidth="6"
    >
      <path d="m 106.15699,104.81898 0.81766,137.66811 102.24487,52.63857 L 106.09742,1.2562312 1.2008898,295.02942 96.460978,247.10502" />
    </svg>
  </AnimatedBobUp>
);

export default CompassArrow;
