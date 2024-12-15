import React, { useState, useEffect, Children} from 'react';

import styles from './galleryImageGridWithBigImages.module.scss';
import { LightBox } from './LightBox';

interface GalleryImageGridProps {
  children: any;
}

// TODO: Make this accept 'children', which will be all the images? Made by Astro's Image component?
export const GalleryImageGrid = ({ children }: GalleryImageGridProps) => {

    const images = Children.toArray(children);

  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState(0);

  // TODO: make the thumbsArray be smaller thumbnails 
  const thumbsArray = children;

  const fullArray = children;

  const openLightbox = (index: React.SetStateAction<number>) => {
    setIsOpen(true);
    setImage(index);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setImage(0);
  };

  const handleLeftArrow = () => {
    const lastImage = fullArray.length - 1;
    const firstImage = 0;
    if (image === firstImage) {
      setImage(lastImage);
      return 0;
    }
    setImage(image - 1);

    return 0;
  };

  const handleRightArrow = () => {
    const lastImage = fullArray.length - 1;
    const firstImage = 0;
    if (image === lastImage) {
      setImage(firstImage);
      return 0;
    }
    const newImage = image + 1;
    setImage(newImage);
    return 0;
  };

  const handleKeyPress = (event: { key: string | number; }) => {


    if (event.key === 'ArrowLeft') {
      handleLeftArrow();
    }
    if (event.key === 'ArrowRight') {
      handleRightArrow();
    }
    if (event.key === 'Escape' || event.key === 27) {

      setIsOpen(false);
    }
    return 0;
  };

  return (
    <>
      {isOpen && (
        <LightBox
          handleKeyPress={handleKeyPress}
          imageToDisplay={children}
          closeLightbox={closeLightbox}
          image={image}
          setImage={setImage}
        ></LightBox>
      )}
      <div className={styles.imageGrid}>
        {(thumbsArray).map((thumbnail: any, index: number) => {
          return (
            <div
              onClick={() => openLightbox(index)}
              className={styles.thumbnail}
            >
              {thumbnail}
            </div>
          );
        })}
      </div>
      <div className={styles.footer}></div>
    </>
  );
};

export default GalleryImageGrid;
