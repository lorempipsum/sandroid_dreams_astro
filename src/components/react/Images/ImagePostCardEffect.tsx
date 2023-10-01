import {  useState } from "react";
import { useSpring, animated, easings } from 'react-spring';

import styles from "./ImagePostCardEffect.module.css"

const ImagePostCardEffectReact = ({src}: any) => {
    const [isLightBoxOn, setIsLightBoxOn] = useState(false);

    const lightboxStyles = isLightBoxOn ? {width: '100vw !improtant'} : {};

    return (
        

        <animated.div
          className={`${styles.imageContainer}`}
          onClick={() => {setIsLightBoxOn(!isLightBoxOn)}}
          style={{...lightboxStyles}}
        >
                    
          <img src={src} alt="Image 1"  />
        </animated.div>
      );
};


export default ImagePostCardEffectReact;