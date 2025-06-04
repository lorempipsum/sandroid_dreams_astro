import type { FC } from 'react';
import styles from './TypeSelector.module.scss';

interface TypeSelectorProps {
  types: string[];
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const TypeSelector: FC<TypeSelectorProps> = ({ types, selectedType, onTypeChange }) => {
  return (
    <select 
      className={styles.selector}
      value={selectedType}
      onChange={(e) => onTypeChange(e.target.value)}
    >
      {types.map(type => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
    </select>
  );
};

export default TypeSelector;
