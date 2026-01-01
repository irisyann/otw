import { GoogleMap, Marker } from '@react-google-maps/api';
import { useMemo, useEffect, useRef, useCallback } from 'react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 3.1390,
  lng: 101.6869,
};

export default function MapView({ start, end, stops, directDirections, combinedDirections, nearbyStations = [], onMapReady }) {
  const mapRef = useRef(null);
  const directRendererRef = useRef(null);
  const combinedRendererRef = useRef(null);

  const center = useMemo(() => {
    if (start?.lat) {
      return { lat: start.lat, lng: start.lng };
    }
    return defaultCenter;
  }, [start]);

  const options = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
    ],
  }), []);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    if (onMapReady) {
      onMapReady(map);
    }
  }, [onMapReady]);

  // Manage direct route renderer
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Clear previous renderer
    if (directRendererRef.current) {
      directRendererRef.current.setMap(null);
      directRendererRef.current = null;
    }

    if (directDirections) {
      // Show blue when no stops, gray when comparing with detour
      const hasStops = !!combinedDirections;
      directRendererRef.current = new window.google.maps.DirectionsRenderer({
        map: mapRef.current,
        directions: directDirections,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: hasStops ? '#9CA3AF' : '#3B82F6',
          strokeWeight: hasStops ? 4 : 5,
          strokeOpacity: hasStops ? 0.6 : 0.9,
        },
      });
    }

    return () => {
      if (directRendererRef.current) {
        directRendererRef.current.setMap(null);
      }
    };
  }, [directDirections, combinedDirections]);

  // Manage combined route renderer
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    // Clear previous renderer
    if (combinedRendererRef.current) {
      combinedRendererRef.current.setMap(null);
      combinedRendererRef.current = null;
    }

    if (combinedDirections) {
      combinedRendererRef.current = new window.google.maps.DirectionsRenderer({
        map: mapRef.current,
        directions: combinedDirections,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#F97316',
          strokeWeight: 5,
          strokeOpacity: 0.9,
        },
      });
    }

    return () => {
      if (combinedRendererRef.current) {
        combinedRendererRef.current.setMap(null);
      }
    };
  }, [combinedDirections]);

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={12}
      options={options}
      onLoad={onMapLoad}
    >
      {/* Start marker */}
      {start?.lat && (
        <Marker
          position={{ lat: start.lat, lng: start.lng }}
          icon={{
            path: window.google?.maps?.SymbolPath?.CIRCLE,
            scale: 12,
            fillColor: '#22C55E',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 3,
          }}
          label={{ text: 'A', color: 'white', fontWeight: 'bold', fontSize: '12px' }}
        />
      )}

      {/* End marker */}
      {end?.lat && (
        <Marker
          position={{ lat: end.lat, lng: end.lng }}
          icon={{
            path: window.google?.maps?.SymbolPath?.CIRCLE,
            scale: 12,
            fillColor: '#EF4444',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 3,
          }}
          label={{ text: 'B', color: 'white', fontWeight: 'bold', fontSize: '12px' }}
        />
      )}

      {/* Stop markers */}
      {stops.filter(s => s.lat).map((stop, index) => (
        <Marker
          key={stop.id}
          position={{ lat: stop.lat, lng: stop.lng }}
          icon={{
            path: window.google?.maps?.SymbolPath?.CIRCLE,
            scale: 10,
            fillColor: '#F97316',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2,
          }}
          label={{ text: String(index + 1), color: 'white', fontWeight: 'bold', fontSize: '11px' }}
        />
      ))}

      {/* Nearby station markers */}
      {nearbyStations.map((station, index) => (
        <Marker
          key={station.id}
          position={{ lat: station.lat, lng: station.lng }}
          icon={{
            path: window.google?.maps?.SymbolPath?.CIRCLE,
            scale: 8,
            fillColor: '#9333EA',
            fillOpacity: 0.8,
            strokeColor: 'white',
            strokeWeight: 2,
          }}
          label={{ text: String.fromCharCode(65 + index), color: 'white', fontWeight: 'bold', fontSize: '10px' }}
          title={station.name}
        />
      ))}
    </GoogleMap>
  );
}
