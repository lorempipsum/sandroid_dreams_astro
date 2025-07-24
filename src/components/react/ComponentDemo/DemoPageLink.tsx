import React from 'react';
import styles from '../PageLink/PageLink.module.scss';

interface DemoPageLinkProps {
  to: string;
  text: string;
  isHidden?: boolean;
}

const DemoPageLink = ({ to, text, isHidden = false }: DemoPageLinkProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation in demo
    console.log('Demo link clicked:', to);
  };

  return (
    <>
      {!isHidden && (
        <div className={styles.link}>
          <a 
            className={styles.linkTextStyle} 
            href={to}
            onClick={handleClick}
          >
            {text}
          </a>
        </div>
      )}
    </>
  );
};

export default DemoPageLink;