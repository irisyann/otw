import { useState, useCallback } from 'react';
import { useRouteCalculations } from './useRouteCalculations';

export function useDirections() {
  const [directRoute, setDirectRoute] = useState(null);
  const [deviations, setDeviations] = useState({});
  const [directDirections, setDirectDirections] = useState(null);
  const [combinedDirections, setCombinedDirections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { getDirectionsService, calculateWaypointDeviation } = useRouteCalculations();

  const calculateCombinedRoute = useCallback(async (start, end, stops) => {
    const service = getDirectionsService();
    const validStops = stops.filter(s => s.lat);

    if (!service || !start?.lat || !end?.lat) return null;

    try {
      const waypoints = validStops.map(stop => ({
        location: { lat: stop.lat, lng: stop.lng },
        stopover: true,
      }));

      const result = await service.route({
        origin: { lat: start.lat, lng: start.lng },
        destination: { lat: end.lat, lng: end.lng },
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      });

      return result;
    } catch (err) {
      console.error('Combined route error:', err);
      return null;
    }
  }, [getDirectionsService]);

  const calculateAllDeviations = useCallback(async (start, end, stops) => {
    setLoading(true);
    setError(null);

    try {
      // Get direct route for baseline comparison
      const service = getDirectionsService();
      if (!service || !start?.lat || !end?.lat) {
        setLoading(false);
        return;
      }

      const directResult = await service.route({
        origin: { lat: start.lat, lng: start.lng },
        destination: { lat: end.lat, lng: end.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      const directRouteData = directResult.routes[0].legs[0];
      setDirectRoute(directRouteData);
      setDirectDirections(directResult);

      // Calculate deviations for each stop
      const newDeviations = {};
      for (const stop of stops) {
        if (stop.lat) {
          const deviation = await calculateWaypointDeviation(start, end, stop, directRouteData);
          if (deviation) {
            newDeviations[stop.id] = deviation;
          }
        }
      }
      setDeviations(newDeviations);

      // Calculate and show combined route with all stops
      const validStops = stops.filter(s => s.lat);
      if (validStops.length > 0) {
        const combinedResult = await calculateCombinedRoute(start, end, stops);
        setCombinedDirections(combinedResult);
      } else {
        setCombinedDirections(null);
      }

    } catch (err) {
      setError('Error calculating route');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getDirectionsService, calculateWaypointDeviation, calculateCombinedRoute]);

  const reset = useCallback(() => {
    setDirectRoute(null);
    setDeviations({});
    setDirectDirections(null);
    setCombinedDirections(null);
    setError(null);
  }, []);

  return {
    directRoute,
    deviations,
    directDirections,
    combinedDirections,
    loading,
    error,
    calculateAllDeviations,
    reset,
  };
}
