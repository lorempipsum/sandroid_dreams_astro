

import styles from './Logo.module.css'

const Logo = ({}) => {
  return (
    <div>
      <div
        className={styles.logoBox}
      >
        <img
          src="src/components/react/Title/logo.svg"
          className={styles.logoImage}
        />
      </div>
    </div>
  );
};


export default Logo;