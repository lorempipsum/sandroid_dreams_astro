import { findNearestBin } from "../../../utils/locationUtils";

export const getLocationsForType = (items: any[], userLocation: GeolocationCoordinates) => {
    return items
      .map(item => ({
        bin: item,
        ...findNearestBin(userLocation, [item])
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  };