import * as React from 'react';
import Canvas from './Canvas.js';

import styles from './CanvasMapGenerator.module.css';
import { useState } from 'react';
import Button from '../Button/Button';

function CanvasMapGenerator() {
  const [reRenderTrigger, setRerenderTrigger] = useState(0);

  return (
    <>
      <Button
        id="button-render-new-map"
        label={'Render new map'}
        onClick={() => {
          setRerenderTrigger(reRenderTrigger + 1);
        }}
      ></Button>
      <div className={styles.canvas}>
        <Canvas reRenderTrigger={reRenderTrigger}></Canvas>
      </div>
    </>
  );
}

export default CanvasMapGenerator;
