import Logo from './Logo';

import styles from './Title.module.css';


// styles

export const Title = ({ title }: {title: string}) => {
  // hrefDO reinstate the friends, about and instagram pages at some point?
  const isLinkSectionShown = true;

  return (
    <div>
      <title>{title}</title>
      <a
        className={styles.headingStyles}
        href="/"
      >
        <Logo />
        {title}
      </a>
      {isLinkSectionShown && (
        <div className={styles.as}>
          <a
            href="/blog"
            className={
              styles.subtitleText
            }
          >
            Blog
          </a>
          <a
            href="/about"
            className={
              styles.subtitleText
            }
          >
            About
          </a>
          <a
            href="/commutechecker"
            className={
              styles.subtitleText
            }
          >
            CommuteChecker
          </a>
          <a
            href="/404"
            className={
              styles.subtitleText
            }
          >
            404
          </a>
          <a
            href="https://instagram.com/sandroid_dreams"
            className={
              styles.subtitleText
            }
          >
            Instagram
          </a>
        </div>
      )}
    </div>
  );
};

export default Title;
