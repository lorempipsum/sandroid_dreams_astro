
// styles
import styles from './PageLink.module.scss';

interface PageLinkProps {
    to: string;
    text: string;
    isHidden?: boolean;
}
// formerly known as ArticleLink
const PageLink = ({ to, text, isHidden = false }: PageLinkProps) => {
  return (
    <>
      {!isHidden && (
        <div className={styles.link}>
          <a className={styles.linkTextStyle} href={to}>
            {text}
          </a>
        </div>
      )}
    </>
  );
};
export default PageLink;
