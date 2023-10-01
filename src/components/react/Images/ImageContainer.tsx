
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
        maxHeight: '50vh',
        objectFit: 'cover',

    }
    const [isZoomedView, setIsZoomedView] = useState(false);
    const [imgStyles, setImgStyles] = useState({...defaultStyles});
    const { height, width } = useWindowDimensions();

  

    useEffect(() => {
        console.log(`clicke event!`);

        console.log(isZoomedView);
        if (isZoomedView === true ) {
            
            setImgStyles({
                width: '100vw',
                height: 'auto',
                maxHeight: '90vh',
            })

        }

        else {
            console.log("DEFAULTING BACK")
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
