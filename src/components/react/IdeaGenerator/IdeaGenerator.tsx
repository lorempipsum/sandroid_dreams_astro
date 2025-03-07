import { useState, useEffect } from "react"
import Button from "../Button/Button"

import styles from "./ideaGenerator.module.scss"

const SENSORS = ['Capacative Touch', 'Video Feed', 'Audio Feed', 
    'Distance Sensor', 'Temperature Sensor', 'Humidity Sensor',
    'Noise Sensor', 'Light Sensor', 'Pressure Sensor', 'Accelerometer', 'Facial Expression', 'Pose Detection']

const OUTPUT = ['LED', 'Motor', 'Speaker', 'Display', 'Servo Motor', 'Printed Photo', 'Video', 'Audio', 'Haptic Feedback', 'Animation', 'Text', 'Vibration', 'Heat', 'Cooling', 'Movement', 'Rotation', 'Laser']

const OBJECTS = ['Photo Frame', 'Mirror', 'Camera', 'Tablet', 'Lamp', 'Clock', 'Thermometer', 'Plant',  'Balloon', 'Kindle', 'Phone']

interface IdeaCardProps {
    idea: string;
    inputs: string[];
    className?: string;
}

const IdeaCard = ({idea, inputs, className}: IdeaCardProps) => {
    return (
        <div className={`${styles.ideaCard} ${className || ''}`}>
            <div className={styles.inputs}>
                {inputs.map((input) => (
                    <div key={`${idea}-${input}`} className={styles.input}>
                        {input}
                    </div>
                ))}
            </div>
            <div className={styles.idea}>{idea}</div>
        </div>
    )
}

const IdeaGenerator = () => {
    const [idea, setIdea] = useState<string>("")
    const [inputs, setInputs] = useState<string[]>([])
    const [fadeIn, setFadeIn] = useState<boolean>(false)

    const generateNewIdeaCard = () => {
        // Reset animation state
        setFadeIn(false)
        
        // Choose a random sensor, output, and object
        const sensor = SENSORS[Math.floor(Math.random() * SENSORS.length)]
        const output = OUTPUT[Math.floor(Math.random() * OUTPUT.length)]
        const object = OBJECTS[Math.floor(Math.random() * OBJECTS.length)]

        // Combine them into a sentence
        const newIdea = `Create a ${object} that uses a ${sensor} to control a ${output}.`

        // Create a new card with the idea
        setIdea(newIdea)
        setInputs([sensor, output, object])
        
        // Trigger animation after a short delay
        setTimeout(() => setFadeIn(true), 10)
    }

    useEffect(() => {
        // Generate an idea when the component mounts
        generateNewIdeaCard()
    }, [])

    return (
        <div className={styles.central}>
            <Button
                onClick={generateNewIdeaCard}
                label="Generate New Idea"
                id={'generateNewIdeaButton'}
                />
            
            
            {idea.length > 0 && (
                <IdeaCard 
                    idea={idea} 
                    inputs={inputs}
                    className={fadeIn ? styles.fadeIn : ''}
                />
            )}
        </div>
    )
}

export default IdeaGenerator