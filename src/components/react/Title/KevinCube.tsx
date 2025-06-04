import React from 'react';

interface KevinCubeProps {
  className?: string;
}

const KevinCube: React.FC<KevinCubeProps> = ({ className }) => {
  return (
    <svg
      className={className}
      width="40"
      height="40"
      viewBox="0 0 210 297"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Kevin Cube Logo"
    >
      <path
        d="m 25.729873,110.29071 v 85.84853 L 109.7899,246.21756 V 148.74369 L 29.306896,98.665385 109.7899,49.481325 192.95567,95.088358 122.30948,139.80113 v 0"
        fill="none"
        stroke="#ff9900" // Using the direct hex color here
        strokeWidth="6"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default KevinCube;
