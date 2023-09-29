import { useEffect, useState } from "react";
import { useSpring, animated, easings } from 'react-spring';

import styles from "./ImagePostCardEffect.module.css"

const ImagePostCardEffectReact = ({src}: any) => {
    const [isLightBoxOn, setIsLightBoxOn] = useState(false);

    const springAnimation = useSpring({
        height: isLightBoxOn ? "100vh" : "auto",
    })


    

    return (
        

        <animated.div
          className={`${styles.imageContainer}`}
          onClick={() => {setIsLightBoxOn(!isLightBoxOn)}}
          style={springAnimation}
        >
                    
          <img src={src} alt="Image 1"  />
        </animated.div>
      );
};


export default ImagePostCardEffectReact;