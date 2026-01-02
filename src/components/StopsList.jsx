import LocationInput from './LocationInput';
import DeviationCard from './DeviationCard';

export default function StopsList({ stops, onStopChange, onRemoveStop, onAddStop, deviations }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Stops</h3>
        <button
          onClick={onAddStop}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          + Add Stop
        </button>
      </div>

      {stops.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
          Click above to add stops
        </div>
      ) : (
        <div className="space-y-3">
          {stops.map((stop, index) => (
            <div key={stop.id} className="relative">
              <div className="flex gap-2">
                <div className="flex-1">
                  <LocationInput
                    label={`Stop ${index + 1}`}
                    placeholder="Search location..."
                    value={stop.name}
                    onPlaceSelect={(place) => onStopChange(stop.id, { ...stop, ...place })}
                    icon={
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                    }
                  />
                </div>
                <button
                  onClick={() => onRemoveStop(stop.id)}
                  className="self-end mb-1 p-3 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove stop"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {stop.lat && deviations[stop.id] && (
                <DeviationCard deviation={deviations[stop.id]} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
