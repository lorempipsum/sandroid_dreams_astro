import styles from './Button.module.css';

interface ButtonProps {
    id: string;
    onClick: any;
    label: string;
}
const Button = (props: ButtonProps) => {
    return <button className={styles.flexButton} onClick={props.onClick} id={props.id}>{props.label}
    </button>
}

export default Button;