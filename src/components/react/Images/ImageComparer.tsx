import React from 'react';
import styles from './imageComparer.module.scss';

interface ImageComparerProps {
  children: any;
}

const ImageComparer = (props: ImageComparerProps) => {
  const [button1Styles, setButton1Styles] = React.useState(
    styles.buttonSelected
  );
  const [button2Styles, setButton2Styles] = React.useState('');
  const [imageStyles, setImageStyles] = React.useState(styles.image1Visible);
  const [imageFitStyleName, setImageFitStyleName] =
    React.useState('scale-down');
  const [imageSizeStyleName, setImageSizeStyleName] = React.useState('normal');

  const makeImageVisible = (imageNumber: number) => {
    if (imageNumber === 1) {
      setImageStyles(styles.image1Visible);
      setButton1Styles(styles.buttonSelected);
      setButton2Styles('');
    } else if (imageNumber === 2) {
      setImageStyles(styles.image2Visible);
      setButton2Styles(styles.buttonSelected);
      setButton1Styles('');
    }
  };

  const toggleImageFit = () => {
    const IMAGE_FIT_STYLES = ['cover', 'contain', 'fill', 'none', 'scale-down'];

    const currentImageFitStyleName = imageFitStyleName;
    const currentImageFitStyleIndex = IMAGE_FIT_STYLES.indexOf(
      currentImageFitStyleName
    );
    const nextImageFitStyleIndex =
      (currentImageFitStyleIndex + 1) % IMAGE_FIT_STYLES.length;
    const nextImageFitStyleName = IMAGE_FIT_STYLES[nextImageFitStyleIndex];
    setImageFitStyleName(nextImageFitStyleName);
  };

  const toggleSize = () => {
    setImageSizeStyleName(
      imageSizeStyleName === 'fullScreen' ? 'normal' : 'fullScreen'
    );
    setImageFitStyleName('scale-down');
  };

  return (
    <div className={`${styles.imageContainer} ${styles[imageSizeStyleName]}`}>
      <div className={styles.imageOverlay}>
        {imageSizeStyleName === 'fullScreen' && (
          <button
            className={`${styles.closeButton}`}
            onClick={() => toggleSize()}
          >
            X
          </button>
        )}
        <div className={styles.buttons}>
          <button
            className={`${styles.button} ${button1Styles}`}
            onClick={() => makeImageVisible(1)}
          >
            1
          </button>
          <button
            className={`${styles.button} ${button2Styles}`}
            onClick={() => makeImageVisible(2)}
          >
            2
          </button>
          <button
            className={`${styles.button}`}
            onClick={() => toggleImageFit()}
          >
            Image Fit: {imageFitStyleName}
          </button>
          <button className={`${styles.button}`} onClick={() => toggleSize()}>
            Size: {imageSizeStyleName}
          </button>
        </div>
        <div
          className={`${styles.imageWrapper} ${imageStyles} ${styles[imageFitStyleName]}`}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default ImageComparer;
