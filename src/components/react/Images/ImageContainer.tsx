
import { useEffect, useState } from 'react';
import useWindowDimensions from '../hooks/useWindowDimensions';
import styles from './ImageContainer.module.css';

interface ImageContainerProps {
    src: string;
    id: string;
}

const ImageContainer = ({src, id}: ImageContainerProps) => {
    const defaultStyles = {
        width: "100%",
        height: "auto",
        minHeight: '20vh',
        maxHeight: '70vh',
        objectFit: 'cover',
        border: '20px solid white',
        outline: '2px solid whitesmoke',
        transition: 'all 1s ease-in-out',
        objectPosition: '33% 33%'

    }
    const [isZoomedView, setIsZoomedView] = useState(false);
    const [imgStyles, setImgStyles] = useState({...defaultStyles});

  

    useEffect(() => {

        if (isZoomedView === true ) {
            
            setImgStyles({
                width: '90vw',
                height: 'auto',
                minHeight: '20vh',
                maxHeight: '90vh',
                objectFit: 'cover',
                transition: 'all 1s ease-in-out',
                border: '20px solid white',
                outline: '2px solid whitesmoke',
                objectPosition: '50% 33%'

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
