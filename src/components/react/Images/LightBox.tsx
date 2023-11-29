import { useEffect } from "react";

import styles from './galleryImageGridWithBigImages.module.scss';


const RightArrow = () => {
    return (
      <div className={styles.arrow}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 25 25"
        >
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </div>
    );
  };
  
  const LeftArrow = () => {
    return (
      <div className={styles.arrow}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 25 25"
        >
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>{' '}
      </div>
    );
  };

interface LightBoxProps {
    imageToDisplay: any;
    handleKeyPress: any;
    closeLightbox: any;
    image: any;
    setImage: any;
}

export const LightBox = ({
    imageToDisplay,
    handleKeyPress,
    closeLightbox,
    image,
    setImage,
  }: LightBoxProps) => {
    useEffect(() => {
      window.removeEventListener('keyup', handleKeyPress);
  
      window.addEventListener('keyup', handleKeyPress);
  
      // cleanup this component
      return () => {
        window.removeEventListener('keyup', handleKeyPress);
      };
    }, [image]);
  
    const LeftButton = () => {
      return (
        <button
          className={styles.previousButton}
          onClick={() => handleKeyPress({ key: 'ArrowLeft' })}
        >
          <LeftArrow />
        </button>
      );
    };
  
    const RightButton = () => {
      return (
        <button
          className={styles.nextButton}
          onClick={() => handleKeyPress({ key: 'ArrowRight' })}
        >
          {' '}
          <RightArrow />
        </button>
      );
    };
  
    return (
      <>
        <LeftButton />
        <RightButton />
        <div
          tabIndex={0}
          onClick={() => closeLightbox()}
          className={styles.lightbox}
        >
          <img
            className={styles.lightboxImage}
            style={{
              objectFit: 'contain',
            }}
            src={imageToDisplay.src}
          />
        </div>
      </>
    );
  };