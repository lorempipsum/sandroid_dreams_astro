
import { useEffect, useState } from 'react';
import styles from './ImageContainer.module.css';

interface ImageContainerProps {
    children: any; // astro Image component output
    isExpanded?: boolean;
}

const ImageWrapper = ({children, isExpanded = false}: ImageContainerProps) => {
   
    const [isZoomedView, setIsZoomedView] = useState(isExpanded);
    const [imgStyles, setImgStyles] = useState("defaultStyles");

  

    useEffect(() => {

        if (isZoomedView === true ) {
            
            setImgStyles("expandedStyles")

        }

        else {
            setImgStyles("defaultStyles")}
        }, [isZoomedView]);

    

return (
    <div className={`${styles.imageContainer} ${styles[imgStyles]}`} onClick={() => {setIsZoomedView(!isZoomedView)}}>
{children}
</div>)
}

export default ImageWrapper;
