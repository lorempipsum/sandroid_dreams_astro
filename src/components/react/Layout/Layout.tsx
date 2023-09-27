
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
  return (
    <>
      <div className={styles.main}>
        <div className={styles.header}>
          <Title
            title={'sandroid.dev'}
          />
        </div>

        <div className={styles.content}>
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
          <div className="fadeIn">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
