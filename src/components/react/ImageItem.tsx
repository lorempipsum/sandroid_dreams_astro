import React from 'react';
import type { ImageData } from './types';
import styles from './ImageItem.module.scss';

interface ImageItemProps {
  image: ImageData;
  index: number;
  isCurrentImage: boolean;
  onToggleFeatured: (id: string) => void;
  onRemove: (id: string) => void;
  onClick: (index: number) => void;
}

const ImageItem: React.FC<ImageItemProps> = ({
  image,
  index,
  isCurrentImage,
  onToggleFeatured,
  onRemove,
  onClick
}) => {
  const itemClasses = [
    styles.imageItem,
    isCurrentImage ? styles.current : '',
    image.isFeatured ? styles.featured : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={itemClasses}>
      <img 
        src={image.url} 
        alt={`Image ${index + 1}`} 
        onClick={() => onClick(index)}
        style={{ cursor: 'pointer' }}
      />
      <div className={styles.imageControls}>
        <button
          onClick={() => onToggleFeatured(image.id)}
          className={`${styles.featureButton} ${image.isFeatured ? styles.featured : ''}`}
        >
          ⭐
        </button>
        <button
          onClick={() => onRemove(image.id)}
          className={styles.removeButton}
        >
          ×
        </button>
      </div>
      <div className={styles.imageIndex}>{index + 1}</div>
    </div>
  );
};

export default ImageItem;
