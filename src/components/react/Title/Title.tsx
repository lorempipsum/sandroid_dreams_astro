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
          {false && 
          <a
            href="/about"
            className={
              styles.subtitleText
            }
          >
            About
          </a>}
          {false && 
          <a
            href="/friends"
            className={
              styles.subtitleText
            }
          >
            Friends
          </a>}
          <a
            href="/plotting"
            className={
              styles.subtitleText
            }
          >
            Plotter Art
          </a>
          <a
            href="/photography/everything"
            className={
              styles.subtitleText
            }
          >
            Photography
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
