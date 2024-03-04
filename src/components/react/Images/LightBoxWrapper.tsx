
import { useEffect, useState } from 'react';
import styles from './lightBoxWrapper.module.scss';

interface ImageContainerProps {
    children: any; // astro Image component output
    isExpanded?: boolean;
}

const LightBoxWrapper = ({children, isExpanded = false}: ImageContainerProps) => {
   
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

export default LightBoxWrapper;
