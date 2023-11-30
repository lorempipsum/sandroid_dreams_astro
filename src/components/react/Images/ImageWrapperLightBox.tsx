
import { useEffect, useState } from 'react';
import styles from './ImageContainer.module.css';
import { LightBox } from './LightBox';

interface ImageContainerProps {
    children: any; // astro Image component output
    isExpanded?: boolean;
}

const ImageWrapperLightBox = ({children, isExpanded = false}: ImageContainerProps) => {
   
    const [isZoomedView, setIsZoomedView] = useState(isExpanded);

     

return (
    <>
    {isZoomedView && <LightBox imageToDisplay={children} handleKeyPress={undefined} closeLightbox={() => setIsZoomedView(!isZoomedView)} image={undefined} setImage={undefined} />}

<div className={`${styles.imageContainer}`} onClick={() => {setIsZoomedView(true)}}>
        {children}
</div></>
);
}

export default ImageWrapperLightBox;
