import { useSpring, animated } from '@react-spring/web';
import styles from './Button.module.scss';

interface ButtonProps {
    id: string;
    onClick: any;
    label: string;
}

const Button = (props: ButtonProps) => {
    const [springs, api] = useSpring(() => ({
        scale: 1,
        config: {
            tension: 200,
            friction: 5
        }
    }));

    const handleClick = async () => {
        props.onClick();
    };

    const handleMouseEnter = () => api.start({ scale: 1.05});
    const handleMouseLeave = () => api.start({ scale: 1});

    return (
        <animated.button
            className={styles.flexButton}
            onClick={handleClick}
            id={props.id}
            style={{
                ...springs,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '12px 24px',
                cursor: 'pointer',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {props.label}
        </animated.button>
    );
};

export default Button;