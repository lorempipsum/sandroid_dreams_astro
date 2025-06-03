import React from 'react';
import styles from './DotInfo.module.scss';
import type { CrimeLocation } from '../../../../utils/crimeDataLoader';
import type { TreeLocation } from '../../../../utils/treeDataLoader';
import type { GeneralTree } from '../../../../utils/generalTreeDataLoader';

interface DotInfoProps {
  location: any;
  distance: number;
  bearing?: number; // Make optional since it wasn't always provided in original
  compass?: number; // Add compass prop
  dataType: 'facilities' | 'crimes' | 'trees' | 'protected trees';
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

const DotInfo = ({ location, distance, bearing = 0, compass = 0, dataType, style, onClick }: DotInfoProps) => {
  const [flipLeft, setFlipLeft] = React.useState(false);
  const dotInfoRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const checkPosition = () => {
      if (dotInfoRef.current) {
        const rect = dotInfoRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const margin = 20; // Add some margin to trigger flip earlier
        setFlipLeft(rect.right + margin > viewportWidth);
      }
    };

    // Run check immediately and after a small delay to ensure DOM updates
    checkPosition();
    const timeoutId = setTimeout(checkPosition, 100);
    window.addEventListener('resize', checkPosition);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkPosition);
    };
  }, [style?.left, style?.top, compass]); // Add compass to dependencies

  const renderInfo = () => {
    switch (dataType) {
      case 'crimes': {
        const crime = location as CrimeLocation;
        return (
          <>
            <h3>{crime.streetName}</h3>
            <p>{Math.round(distance)}m away</p>
            <p>Month: {crime.month}</p>
            <p>Category: {crime.category}</p>
            <p>Crime Type: {crime.locationType}</p>
            <p>Outcome: {crime.outcome || 'Unknown'}</p>
            <p>Bearing: {Math.round(bearing)}°</p>
          </>
        );
      }
      case 'protected trees': {
        const tree = location as TreeLocation;
        return (
          <>
            <h3>{tree.reference}</h3>
            <p>{Math.round(distance)}m away</p>
            <p>Type: {tree.treeType}</p>
            {tree.notes && <p>Notes: {tree.notes}</p>}
            {tree.treePreservationOrder && <p>TPO: {tree.treePreservationOrder}</p>}
            {tree.startDate && <p>Protected since: {tree.startDate}</p>}
            <p>Bearing: {Math.round(bearing)}°</p>
          </>
        );
      }
      case 'trees': {
        const tree = location as GeneralTree;
        return (
          <>
            <h3>{tree.commonName}</h3>
            <p>{Math.round(distance)}m away</p>
            <p>Latin Name: {tree.latinName}</p>
            <p>Height: {tree.height}</p>
            <p>Crown width: {tree.crownWidth}</p>
            <p>Condition: {tree.condition}</p>
            <p>Bearing: {Math.round(bearing)}°</p>
          </>
        );
      }
      default:
        return (
          <>
            <h3>{location.name}</h3>
            <p>{Math.round(distance)}m away</p>
            <p>Bearing: {Math.round(bearing)}°</p>
          </>
        );
    }
  };

  const modifiedStyle = {
    ...style,
    transform: flipLeft ? 'translate(-150%, -120%)' : 'translate(-50%, -120%)'
  };

  return (
    <div 
      ref={dotInfoRef}
      className={styles.dotInfo}
      style={modifiedStyle} 
      onClick={onClick}
    >
      {renderInfo()}
    </div>
  );
};

export default DotInfo;
