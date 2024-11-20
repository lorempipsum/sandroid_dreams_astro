import { useState } from "react"
import Button from "../Button/Button"

import styles from "./ideaGenerator.module.css"

const SENSORS = ['Capacative Touch', 'Video Feed', 'Audio Feed', 
    'Distance Sensor', 'Temperature Sensor', 'Humidity Sensor',
    'Noise Sensor', 'Light Sensor', 'Pressure Sensor', 'Accelerometer']


const OUTPUT = ['LED', 'Motor', 'Speaker', 'Display', 'Servo Motor', 'Printed Photo', 'Video', 'Audio', 'Haptic Feedback', 'Animation']

const OBJECTS = ['Photo Frame', 'Mirror', 'Camera Box', 'Tablet', 'Lamp', 'Clock', 'Thermometer', 'Plant',  'Balloon', 'Kindle', 'Laptop', 'Phone', 'Drawings']

interface IdeaCardProps {
    idea: string;
    inputs: string[];
}

const IdeaCard = ({idea, inputs}: IdeaCardProps) => {
    return <div className={styles.ideaCard}><div className={styles.inputs}>{inputs.map((input) => <div key={`${idea}-${input}`} className={styles.input}>{input}</div>)}
        </div><div className={styles.idea}>{idea}</div></div>
}

const IdeaGenerator = ({}) => {
    const [idea, setIdea] = useState<string>("")
    const [inputs, setInputs] = useState<string[]>([])


    const generateNewIdeaCard = () => {
        // Choose a random sensor, output, and object
        const sensor = SENSORS[Math.floor(Math.random() * SENSORS.length)]
        const output = OUTPUT[Math.floor(Math.random() * OUTPUT.length)]
        const object = OBJECTS[Math.floor(Math.random() * OBJECTS.length)]

        // Combine them into a sentence
        const newIdea = `Create a ${object} that uses a ${sensor} to control a ${output}.`

        // Create a new card with the idea

        setIdea(newIdea)
        setInputs([sensor, output, object])

    }

    return <div className={styles.central}><Button label="Generate Idea" id="idea-generator-button" onClick={generateNewIdeaCard} />
    
    {idea.length > 0 && <IdeaCard idea={idea} inputs={inputs}/>}</div>
}

export default IdeaGenerator