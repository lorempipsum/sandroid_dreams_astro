import React from 'react';
import styles from './ExampleVideos.module.scss';

const ExampleVideos: React.FC = () => {
  return (
    <div className={styles.section}>
      <div className={styles.examplesGrid}>
        <div className={styles.exampleItem}>
          <div className={styles.exampleVideoContainer}>
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className={styles.exampleVideo}
              poster="/example-landscape-poster.jpg"
            >
              <source src="/example-landscape.mp4" type="video/mp4" />
              <source src="/example_flipbook_medium.webm" type="video/webm" />
            </video>
          </div>
        </div>

        <div className={styles.exampleItem}>
          <div className={styles.exampleVideoContainer}>
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className={styles.exampleVideo}
              poster="/example-artistic-poster.jpg"
            >
              <source src="/example-artistic.mp4" type="video/mp4" />
              <source src="/example_flipbook__slow.webm" type="video/webm" />
              <div className={styles.videoPlaceholder}>
              </div>
            </video>
          </div>
        </div>

        <div className={styles.exampleItem}>
          <div className={styles.exampleVideoContainer}>
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className={styles.exampleVideo}
              poster="/example-street-poster.jpg"
            >
              <source src="/example-street.mp4" type="video/mp4" />
              <source src="/example_flipbook_travel.webm" type="video/webm" />
              <div className={styles.videoPlaceholder}>
              </div>
            </video>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleVideos;
