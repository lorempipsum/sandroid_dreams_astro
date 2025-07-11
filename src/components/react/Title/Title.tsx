import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import Logo from './Logo';
import styles from './Title.module.scss';

export const Title = ({ title }: { title: string }) => {
  // Add hover state
  const [isHovered, setIsHovered] = useState(false);

  // Create the color wave animation that activates on hover
  const props = useSpring({
    // Start from left, move to right on hover
    backgroundPosition: isHovered ? '200% 0' : '-200% 0',
    // Make animation faster on hover, immediate on mouse out
    config: { duration: isHovered ? 1500 : 0 },
    immediate: !isHovered,
  });

  const isLinkSectionShown = true;

  return (
    <div>
      <title>{title}</title>

      <Logo />
      <a className={styles.headingStyles} href="/">
        <animated.span
          className={styles.animatedText}
          style={props}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {title}
        </animated.span>
      </a>
      {isLinkSectionShown && (
        <div className={styles.navigation}>
          <a
            href="/blog/worms-3-armageddon-rick-and-morty/"
            className={styles.subtitleText}
          >
            Worms 3 Soundpack
          </a>
          <a
            href="/blog/interactive-art-idea-generator/"
            className={styles.subtitleText}
          >
            Ideagenerator
          </a>
          <a href="/experiments/strava" className={styles.subtitleText}>
            Strava
          </a>
          <a href="/experiments/binder" className={styles.subtitleText}>
            Binder
          </a>
          <a href="/experiments/navigator" className={styles.subtitleText}>
            Navigator
          </a>
          {false && (
            <a href="/about" className={styles.subtitleText}>
              About
            </a>
          )}
          {false && (
            <a href="/friends" className={styles.subtitleText}>
              Friends
            </a>
          )}
          <a href="/sketches" className={styles.subtitleText}>
            Sketches
          </a>
          <a href="/plotting/everything" className={styles.subtitleText}>
            Plotter Art
          </a>
          <a href="/photography/everything" className={styles.subtitleText}>
            Photography
          </a>
          <a
            href="/photography/inspiration-spring"
            className={styles.subtitleText}
          >
            Spring Moodboard
          </a>
          <a href="/blog/bookmarks" className={styles.subtitleText}>
            Bookmarks
          </a>
          <a
            href="https://instagram.com/sandroid_dreams"
            className={styles.subtitleText}
            target="_blank"
          >
            Instagram
          </a>
        </div>
      )}
    </div>
  );
};

export default Title;
