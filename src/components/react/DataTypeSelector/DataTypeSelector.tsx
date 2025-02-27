import React from 'react';
import TypeSelector from '../TypeSelector/TypeSelector';
import styles from './DataTypeSelector.module.scss';

interface DataTypeSelectorProps {
  dataType: string;
  onDataTypeChange: (type: string) => void;
  facilityTypes: string[];
  selectedType: string;
  onTypeChange: (type: string) => void;
}

const DataTypeSelector = ({ 
  dataType, 
  onDataTypeChange, 
  facilityTypes, 
  selectedType, 
  onTypeChange 
}: DataTypeSelectorProps) => {
  return (
    <div className={styles.selector}>
      <TypeSelector 
        selectedType={dataType} 
        onTypeChange={onDataTypeChange}
        types={['facilities', 'crimes', 'protected trees', 'trees', 'collisions']}
      />
      {dataType === 'facilities' && (
        <>
        <span>of type</span>
        <TypeSelector 
          types={facilityTypes}
          selectedType={selectedType}
          onTypeChange={onTypeChange}
        />
        </>
      )}
    </div>
  );
};

export default DataTypeSelector;
