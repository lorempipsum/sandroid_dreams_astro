import  {useState} from 'react';

import '../styles/animations.css';
// styles
import styles from './404.module.css'

// markup
const NotFoundPage = () => {
    const defaultFlavorText = <p className="fadeIn slowFadeIn">You enter an area of vast nothingness.</p>;
    const defaultOption1 = <a className="inlineLink fadeIn slowFadeIn" href="/"><span style={{marginRight: '1ch', display: "inline-block"}}>a)</span>Flee this place</a>;
    const defaultOption2 = <p onClick={() => tryRemembering()}
                                 className="inlineLink fadeIn slowFadeIn"><span style={{marginRight: '1ch', display: "inline-block"}}>b)</span>Look around the space.</p>;

    const newFlavorText =
        <p
            className="fadeIn slowFadeIn">You see a small screen displaying a three digit number.</p>;

    const newOption = <p><span onClick={() => readTheScreen()}
                               className="inlineLink fadeIn slowFadeIn"><span style={{marginRight: '1ch', display: "inline-block"}}>b)</span>Read the screen.</span></p>;

    const flavor404 = <p className="typewriter fadeIn slowFadeIn bordered">4 0 4</p>;
    const [flavorText, setFlavorText] = useState(defaultFlavorText);
    const [option1, setOption1] = useState(defaultOption1);
    const [option2, setOption2] = useState(defaultOption2);

    // If the HTML structure of the options is identical except for the content then the fade animation
    // doesn't work. Therefore wrap things in divs or not in an alternating fashion
    // to ensure the HTML structure is always somewhat different.
    const [wrapInADiv, setWrapInADiv] = useState(false);

    const tryRemembering = () => {
        setWrapInADiv(!wrapInADiv);
        setFlavorText(newFlavorText);
        setOption2(newOption);

    }

    const readTheScreen = () => {
        setFlavorText(flavor404);
        setOption2(<></>);
    }


    return (
        <>
            <h1 className="centered">{flavorText}</h1>
            <div className="centered">
                <p className={styles.option1}>{option1}</p>
                <p className={styles.option2}>{option2}</p>

            </div>
        </>
    );
}

export default NotFoundPage
