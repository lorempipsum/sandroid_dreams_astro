import { findNearestBin } from '../../../utils/locationUtils';
import type { BaseLocation } from '../../../types/locations';

export const getLocationsForType = <T extends BaseLocation>(
  items: T[],
  userLocation: GeolocationCoordinates
): Array<{ bin: T; distance: number; bearing: number }> => {
  return items
    .map((item) => findNearestBin(userLocation, [item]))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10);
};
