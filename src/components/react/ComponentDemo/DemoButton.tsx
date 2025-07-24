import React from 'react';
import { useSpring, animated } from '@react-spring/web';
import styles from '../Button/Button.module.scss';

interface DemoButtonProps {
  id?: string;
  label: string;
  disabled?: boolean;
}

const DemoButton = (props: DemoButtonProps) => {
  const [springs, api] = useSpring(() => ({
    scale: 1,
    config: {
      tension: 200,
      friction: 5,
    },
  }));

  const handleClick = () => {
    // Demo click handler - just shows it's clickable
    console.log('Demo button clicked:', props.label);
  };

  const handleMouseEnter = () => !props.disabled && api.start({ scale: 1.05 });
  const handleMouseLeave = () => api.start({ scale: 1 });

  return (
    <animated.button
      className={styles.flexButton}
      onClick={handleClick}
      id={props.id}
      disabled={props.disabled}
      style={{
        ...springs,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '12px 24px',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.6 : 1,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {props.label}
    </animated.button>
  );
};

export default DemoButton;