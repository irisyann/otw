import { useCallback, useRef } from 'react';
import { calculateDeviation } from '../utils/deviationCalculator';

/**
 * Shared hook for route and deviation calculations
 * Used by both useDirections and useNearbyStations
 */
export function useRouteCalculations() {
  const directionsServiceRef = useRef(null);

  const getDirectionsService = useCallback(() => {
    if (!directionsServiceRef.current && window.google) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
    }
    return directionsServiceRef.current;
  }, []);

  /**
   * Calculate deviation for a waypoint (stop or station) between start and end
   * @param {Object} start - Start location with lat/lng
   * @param {Object} end - End location with lat/lng
   * @param {Object} waypoint - Waypoint location with lat/lng
   * @param {Object} directRouteData - Direct route data for comparison
   * @returns {Object|null} Deviation data or null if calculation fails
   */
  const calculateWaypointDeviation = useCallback(async (start, end, waypoint, directRouteData) => {
    const service = getDirectionsService();
    if (!service || !start?.lat || !end?.lat || !waypoint?.lat) {
      return null;
    }

    try {
      const result = await service.route({
        origin: { lat: start.lat, lng: start.lng },
        destination: { lat: end.lat, lng: end.lng },
        waypoints: [{
          location: { lat: waypoint.lat, lng: waypoint.lng },
          stopover: true,
        }],
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      const legs = result.routes[0].legs;
      const totalDistance = legs.reduce((sum, leg) => sum + leg.distance.value, 0);
      const totalDuration = legs.reduce((sum, leg) => sum + leg.duration.value, 0);

      const detourRoute = {
        distance: { value: totalDistance },
        duration: { value: totalDuration },
      };

      return calculateDeviation(directRouteData, detourRoute);
    } catch (err) {
      console.error('Waypoint deviation calculation error:', err);
      return null;
    }
  }, [getDirectionsService]);

  return {
    getDirectionsService,
    calculateWaypointDeviation,
  };
}
