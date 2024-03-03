import * as React from 'react';

import styles from './commuteChecker.module.scss';
import { useState } from 'react';
import Button from '../Button/Button';

function CommuteChecker() {
    const [formValues, setFormValues] = useState(
        {
            start: "",
            end: ""
        }
    );



  return <>
        <form className={styles.form}>
            <label htmlFor="start">Start</label>
            <input type="text" id="start" name="start" value={formValues.start} onChange={(e) => setFormValues({...formValues, start: e.target.value})}></input>
            <label htmlFor="end">End</label>
            <input type="text" id="end" name="end" value={formValues.end} onChange={(e) => setFormValues({...formValues, end: e.target.value})}></input>
            <Button id="button-render-new-map" label={"Render new map"} onClick={() => {setFormValues(formValues)}}></Button>
        </form>
  </> 
}

export default CommuteChecker