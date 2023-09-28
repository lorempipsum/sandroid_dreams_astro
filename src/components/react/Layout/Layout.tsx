
import { useState } from 'react';
import Title from '../Title/Title';
import styles from './Layout.module.css';

interface LayoutProps {
    children: any;
    title: string;
}

const Layout = ({
  children,
  title,
}: LayoutProps) => {
  const [isDebugInfoShown, setIsDebugInfoShown] = useState<boolean>(false);
  const debugBoxStyles = isDebugInfoShown ? styles.debugBox : "";
  return (
    <>
    <button onClick={() => {setIsDebugInfoShown(!isDebugInfoShown)}} >debug</button>
    {isDebugInfoShown && <div className={styles.verticalSymmetryLine} />}
      <div className={`${styles.main} ${debugBoxStyles}`}>
        <div className={styles.header}>
          <Title
            title={'sandroid.dev'}
          />
        </div>

        <div className={`${styles.content} ${debugBoxStyles}`}>
          <div
            className={
              styles.dividerUpper
            }
          />
          {title && (
            <>
              <h1 className={styles.title}>{title}</h1>{' '}
              <div
                className={
                  styles.divider
                }
              />
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
