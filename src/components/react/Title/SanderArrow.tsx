import React from 'react';

interface SanderArrowProps {
  className?: string;
}

const SanderArrow: React.FC<SanderArrowProps> = ({ className }) => {
  return (
    <svg
      className={className}
      width="30"
      height="30"
      viewBox="0 0 210 297"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Sander Arrow Logo"
    >
      <path
        d="m 106.15699,104.81898 0.81766,137.66811 102.24487,52.63857 L 106.09742,1.2562312 1.2008898,295.02942 96.460978,247.10502"
        fill="none"
        stroke="#3366cd"
        strokeWidth="10"
      />
    </svg>
  );
};

export default SanderArrow;
