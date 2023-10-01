import styles from "./BlogImage.module.css";

interface WrappedImageProps {
    src: string;
    id: string;
}

const WrappedImage = ({src, id}: WrappedImageProps) => {
    return (
        <div className={styles.imagewrapper}>
            <img src={src} id={id} />
        </div>
    )
}
