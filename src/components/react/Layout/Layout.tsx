import { useState } from 'react';
import Title from '../Title/Title';
import styles from './Layout.module.scss';

// Update this import path to the correct scss file
import '../../../styles/global.scss';

interface LayoutProps {
  children: any;
  title: string;
}

const Layout = ({ children, title }: LayoutProps) => {
  const [isDebugInfoShown, setIsDebugInfoShown] = useState<boolean>(false);
  const isDebugButtonShown = false;
  const debugBoxStyles = isDebugInfoShown ? styles.debugBox : '';

  const isTitleShown = false; // Temporary const to hide the titles since at this point in time on 29/09/2023 I don't like the look of them
  return (
    <>
      {isDebugButtonShown && (
        <button
          onClick={() => {
            setIsDebugInfoShown(!isDebugInfoShown);
          }}
        >
          debug
        </button>
      )}
      {isDebugInfoShown && <div className={styles.verticalSymmetryLine} />}
      <div className={`${styles.main} ${debugBoxStyles}`}>
        <div className={styles.header}>
          <Title title={'sandroid.dev'} />
        </div>

        <div className={`${styles.content} ${debugBoxStyles}`}>
          {isTitleShown && title && (
            <>
              <h1 className={styles.title}>{title}</h1>{' '}
              <div className={styles.divider} />
            </>
          )}
        </div>
        <div className={`${styles.innerContent} ${debugBoxStyles}`}>
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;
