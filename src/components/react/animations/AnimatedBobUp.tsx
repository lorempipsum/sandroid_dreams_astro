import { useSpring, animated } from '@react-spring/web';

import type { ReactNode } from 'react';

interface AnimatedBobUpProps {
  children: ReactNode;
}

const AnimatedBobUp = ({ children }: AnimatedBobUpProps) => {
  const springs = useSpring({
    from: { y: 10, opacity: 0 },
    to: { y: 0, opacity: 1 },
    config: {
      mass: 5,
      tension: 150,
      friction: 15,
    },
  });
  return <animated.div style={{ ...springs }}>{children}</animated.div>;
};

export default AnimatedBobUp;
