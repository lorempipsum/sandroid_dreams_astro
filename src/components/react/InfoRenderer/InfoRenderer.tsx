import React from 'react';
import type { CrimeLocation } from '../../../utils/crimeDataLoader';
import type { TreeLocation } from '../../../utils/treeDataLoader';
import type { GeneralTree } from '../../../utils/generalTreeDataLoader';

interface InfoRendererProps {
  location: any;
  distance: number;
  bearing: number;
  dataType: string;
}

const InfoRenderer = ({ location, distance, bearing, dataType }: InfoRendererProps) => {
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

export default InfoRenderer;
