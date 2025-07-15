import React from 'react';
import ImageItem from './ImageItem';
import type { ImageData } from './types';
import styles from './ImageGrid.module.scss';

interface ImageGridProps {
  images: ImageData[];
  currentImageIndex: number;
  onToggleFeatured: (id: string) => void;
  onRemoveImage: (id: string) => void;
  onImageClick: (index: number) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  currentImageIndex,
  onToggleFeatured,
  onRemoveImage,
  onImageClick
}) => {
  return (
    <div className={styles.imagesSection}>
      <h3>Images ({images.length})</h3>
      <div className={styles.imagesGrid}>
        {images.map((image, index) => (
          <ImageItem
            key={image.id}
            image={image}
            index={index}
            isCurrentImage={index === currentImageIndex}
            onToggleFeatured={onToggleFeatured}
            onRemove={onRemoveImage}
            onClick={onImageClick}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;
