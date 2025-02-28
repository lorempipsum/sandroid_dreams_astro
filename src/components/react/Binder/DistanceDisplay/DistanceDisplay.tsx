import React from 'react';
import styles from './DistanceDisplay.module.scss';

interface DistanceDisplayProps {
  name: string;
  distance: number | null;
}

const DistanceDisplay = ({ name, distance }: DistanceDisplayProps) => (
  <div className={styles.distance}>
    <div className={styles.binName}>{name}</div>
    {distance ? `${Math.round(distance)}m` : 'Calculating...'}
  </div>
);

export default DistanceDisplay;
