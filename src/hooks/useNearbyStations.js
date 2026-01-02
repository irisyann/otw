import { useState, useCallback, useRef } from 'react';
import { calculateDeviation } from '../utils/deviationCalculator';

export function useNearbyStations() {
  const [nearbyStations, setNearbyStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(false);

  const placesServiceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const cacheRef = useRef(new Map());

  const getPlacesService = useCallback((map) => {
    if (!placesServiceRef.current && window.google && map) {
      placesServiceRef.current = new window.google.maps.places.PlacesService(map);
    }
    return placesServiceRef.current;
  }, []);

  const getDirectionsService = useCallback(() => {
    if (!directionsServiceRef.current && window.google) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
    }
    return directionsServiceRef.current;
  }, []);

  // Get sample point count based on route length
  const getOptimalSampleCount = (routeLength) => {
    if (routeLength < 5000) return 3;      // Short route - 5km
    if (routeLength < 15000) return 5;     // Medium route - 15km
    return 7;                              // Long route - 15km+
  };

  const searchStationsNearPoint = useCallback((placesService, location) => {
    return new Promise((resolve) => {
      placesService.nearbySearch(
        {
          location,
          radius: 1500,
          type: 'transit_station',
          keyword: 'LRT MRT train station',
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(results || []);
          } else {
            resolve([]);
          }
        }
      );
    });
  }, []);

  const calculateStationDeviation = useCallback(async (start, end, station, directRouteData) => {
    const service = getDirectionsService();
    if (!service) return null;

    try {
      const result = await service.route({
        origin: { lat: start.lat, lng: start.lng },
        destination: { lat: end.lat, lng: end.lng },
        waypoints: [{
          location: {
            lat: station.geometry.location.lat(),
            lng: station.geometry.location.lng(),
          },
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
      console.error('Station deviation error:', err);
      return null;
    }
  }, [getDirectionsService]);

  const findNearbyStations = useCallback(async (map, start, end, directDirections, directRoute) => {
    const cacheKey = `${start.lat},${start.lng}-${end.lat},${end.lng}`;

    if (cacheRef.current.has(cacheKey)) {
      setNearbyStations(cacheRef.current.get(cacheKey));
      setLoadingStations(false);
      return;
    }

    if (!map || !directDirections || !directRoute) {
      setNearbyStations([]);
      return;
    }

    setLoadingStations(true);

    try {
      const placesService = getPlacesService(map);
      if (!placesService) {
        setLoadingStations(false);
        return;
      }

      // Get points along the route to search near
      const route = directDirections.routes[0];
      const path = route.overview_path;

      // Sample points along the route (start, middle points, end)
      const samplePoints = [];
      const sampleCount = getOptimalSampleCount(directRoute.distance.value);
      const step = Math.max(1, Math.floor(path.length / sampleCount));
      for (let i = 0; i < path.length; i += step) {
        samplePoints.push(path[i]);
      }

      // Search for stations near each sample point
      const allStations = [];
      const seenPlaceIds = new Set();

      for (const point of samplePoints) {
        const stations = await searchStationsNearPoint(placesService, point);
        for (const station of stations) {
          if (!seenPlaceIds.has(station.place_id)) {
            seenPlaceIds.add(station.place_id);
            allStations.push(station);
          }
        }
      }

      // Calculate deviation for each station
      const stationsWithDeviation = [];
      for (const station of allStations) {
        const deviation = await calculateStationDeviation(start, end, station, directRoute);
        if (deviation) {
          stationsWithDeviation.push({
            id: station.place_id,
            name: station.name,
            lat: station.geometry.location.lat(),
            lng: station.geometry.location.lng(),
            vicinity: station.vicinity,
            deviation,
          });
        }
      }

      // Deduplicate stations that are geographically close (within ~100m)
      const uniqueStations = stationsWithDeviation.filter((station, index, arr) => {
        const isDuplicate = arr.slice(0, index).some(other => {
          const latDiff = Math.abs(other.lat - station.lat);
          const lngDiff = Math.abs(other.lng - station.lng);
          // Roughly 0.001 degrees ≈ 100 meters
          return latDiff < 0.001 && lngDiff < 0.001;
        });
        return !isDuplicate;
      });

      // Sort by shortest extra duration and take top 3
      uniqueStations.sort((a, b) => a.deviation.extraDuration - b.deviation.extraDuration);
      setNearbyStations(uniqueStations.slice(0, 3));

      cacheRef.current.set(cacheKey, uniqueStations.slice(0, 3));
    } catch (err) {
      console.error('Error finding nearby stations:', err);
      setNearbyStations([]);
    } finally {
      setLoadingStations(false);
    }
  }, [getPlacesService, searchStationsNearPoint, calculateStationDeviation]);

  const clearStations = useCallback(() => {
    setNearbyStations([]);
  }, []);

  return {
    nearbyStations,
    loadingStations,
    findNearbyStations,
    clearStations,
  };
}
