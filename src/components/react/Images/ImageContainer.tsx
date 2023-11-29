
import { useEffect, useState } from 'react';
import styles from './ImageContainer.module.css';

interface ImageContainerProps {
    src: string;
    id: string;
    isExpanded?: boolean;
}

const ImageContainer = ({src, id, isExpanded = false}: ImageContainerProps) => {
    const defaultStyles = {
        width: "100%",
        height: "auto",
        minHeight: '20vh',
        maxHeight: '70vh',
        objectFit: 'cover',
        border: '20px solid white',
        outline: '2px solid whitesmoke',
        transition: 'all 0.6s ease-in-out',
        objectPosition: '33% 33%',
        maxWidth: '100vw',

    }
    const [isZoomedView, setIsZoomedView] = useState(isExpanded);
    const [imgStyles, setImgStyles] = useState({...defaultStyles});

  

    useEffect(() => {

        if (isZoomedView === true ) {
            
            setImgStyles({
                width: '90vw',
                height: 'auto',
                minHeight: '20vh',
                maxHeight: '90vh',
                objectFit: 'cover',
                transition: 'all 0.6s ease-in-out',
                border: '20px solid white',
                outline: '2px solid whitesmoke',
                objectPosition: '66% 33%',
                maxWidth: '100vw',

            })

        }

        else {
            setImgStyles({
                ...defaultStyles
            })}
        }, [isZoomedView]);

    

return (
<div className={styles.imageContainer} onClick={() => {setIsZoomedView(!isZoomedView)}}>
<img src={src} style={{...imgStyles}} id={id} />
</div>)
}

export default ImageContainer;
