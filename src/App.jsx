import { useState, useCallback, useEffect, useRef } from 'react';
import { LoadScript } from '@react-google-maps/api';
import LocationInput from './components/LocationInput';
import StopsList from './components/StopsList';
import MapView from './components/MapView';
import NearbyStations from './components/NearbyStations';
import { useDirections } from './hooks/useDirections';
import { useNearbyStations } from './hooks/useNearbyStations';
import { formatDistance, formatDuration } from './utils/deviationCalculator';

const libraries = ['places'];

let stopIdCounter = 0;
const generateStopId = () => `stop-${++stopIdCounter}`;

export default function App() {
  const [start, setStart] = useState({ name: '', lat: null, lng: null });
  const [end, setEnd] = useState({ name: '', lat: null, lng: null });
  const [stops, setStops] = useState([]);
  const [showNearbyStations, setShowNearbyStations] = useState(false);
  const mapRef = useRef(null);

  const {
    directRoute,
    deviations,
    directDirections,
    combinedDirections,
    loading,
    error,
    calculateAllDeviations,
  } = useDirections();

  const {
    nearbyStations,
    loadingStations,
    findNearbyStations,
    clearStations,
  } = useNearbyStations();

  const handleAddStop = useCallback(() => {
    setStops(prev => [...prev, { id: generateStopId(), name: '', lat: null, lng: null }]);
  }, []);

  const handleStopChange = useCallback((id, updatedStop) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, ...updatedStop } : s));
  }, []);

  const handleRemoveStop = useCallback((id) => {
    setStops(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleCalculate = useCallback(() => {
    if (start.lat && end.lat) {
      calculateAllDeviations(start, end, stops);
    }
  }, [start, end, stops, calculateAllDeviations]);

  const handleMapReady = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const handleToggleNearbyStations = useCallback(() => {
    setShowNearbyStations(prev => !prev);
  }, []);

  const handleAddStationAsStop = useCallback((station) => {
    const newStop = {
      id: generateStopId(),
      name: station.name,
      lat: station.lat,
      lng: station.lng,
    };
    setStops(prev => [...prev, newStop]);
  }, []);

  useEffect(() => {
    if (start.lat && end.lat) {
      const timer = setTimeout(() => {
        calculateAllDeviations(start, end, stops);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [start, end, stops, calculateAllDeviations]);

  // Search for nearby stations when enabled and route is available
  useEffect(() => {
    if (showNearbyStations && directDirections && directRoute && mapRef.current) {
      findNearbyStations(mapRef.current, start, end, directDirections, directRoute);
    } else if (!showNearbyStations) {
      clearStations();
    }
  }, [showNearbyStations, directDirections, directRoute, start, end, findNearbyStations, clearStations]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">API Key Required</h2>
          <p className="text-yellow-700 text-sm">
            Please set your Google Maps API Key in <code className="bg-yellow-100 px-1 rounded">.env.local</code>:
          </p>
          <pre className="mt-2 bg-yellow-100 p-2 rounded text-xs overflow-x-auto">
            VITE_GOOGLE_MAPS_API_KEY=your_actual_key
          </pre>
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Map Section */}
        <div className="h-[40vh] lg:h-screen lg:flex-1 lg:order-2">
          <MapView
            start={start}
            end={end}
            stops={stops}
            directDirections={directDirections}
            combinedDirections={combinedDirections}
            nearbyStations={showNearbyStations ? nearbyStations : []}
            onMapReady={handleMapReady}
          />
        </div>

        {/* Controls Section */}
        <div className="flex-1 lg:w-96 lg:max-w-md lg:order-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="text-center pb-2 border-b">
              <h1 className="text-xl font-bold text-gray-800">Is It OTW?</h1>
              <p className="text-sm text-gray-500">Check if stops are on the way</p>
            </div>

            {/* Start Point */}
            <LocationInput
              label="Start"
              placeholder="Search start location..."
              onPlaceSelect={(place) => setStart(place)}
              icon={
                <span className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">
                  A
                </span>
              }
            />

            {/* End Point */}
            <LocationInput
              label="End"
              placeholder="Search end location..."
              onPlaceSelect={(place) => setEnd(place)}
              icon={
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  B
                </span>
              }
            />

            {/* Direct Route Info */}
            {directRoute && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm font-medium text-blue-800">Direct Route</div>
                <div className="text-xs text-blue-600 mt-1">
                  {formatDistance(directRoute.distance.value)} · {formatDuration(directRoute.duration.value)}
                </div>
              </div>
            )}

            {/* Middle Stops */}
            <StopsList
              stops={stops}
              onStopChange={handleStopChange}
              onRemoveStop={handleRemoveStop}
              onAddStop={handleAddStop}
              deviations={deviations}
            />

            {/* Nearby Stations */}
            {directRoute && (
              <NearbyStations
                enabled={showNearbyStations}
                onToggle={handleToggleNearbyStations}
                stations={nearbyStations}
                loading={loadingStations}
                onAddStation={handleAddStationAsStop}
              />
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                <p className="text-sm text-gray-500 mt-2">Calculating...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Calculate Button (for manual refresh) */}
            <button
              onClick={handleCalculate}
              disabled={!start.lat || !end.lat || loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {loading ? 'Calculating...' : 'Recalculate Route'}
            </button>

            {/* Legend */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center mb-2">How much extra?</p>
              <div className="flex justify-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  <span className="text-xs text-gray-600">&lt;10%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                  <span className="text-xs text-gray-600">10-25%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="text-xs text-gray-600">&gt;25%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LoadScript>
  );
}
