
import { Image } from 'astro:assets';

import logoImage from './logo.svg'

import styles from './Logo.module.css'

const Logo = ({}) => {
  return (
    <div>
      <div
        className={styles.logoBox}
      >
        <img
          src={logoImage.src}
          className={styles.logoImage}
        />
      </div>
    </div>
  );
};


export default Logo;