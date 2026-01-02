import { getDeviationLevel, formatDistance, formatDuration } from '../utils/deviationCalculator';

export default function NearbyStations({
  enabled,
  onToggle,
  stations,
  loading,
  onAddStation
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toggle Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Find Nearby LRT/MRT</span>
        </div>
        <div className={`w-10 h-6 rounded-full transition-colors ${enabled ? 'bg-purple-600' : 'bg-gray-300'}`}>
          <div className={`w-4 h-4 mt-1 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-1'}`}></div>
        </div>
      </button>

      {/* Stations List */}
      {enabled && (
        <div className="p-3 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
              <span className="ml-2 text-sm text-gray-500">Searching stations...</span>
            </div>
          ) : stations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">
              No stations found along the route
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-2">Top stations with least detour:</p>
              {stations.map((station, index) => {
                const { label, color } = getDeviationLevel(station.deviation.deviationPercent);
                const colorClasses = {
                  green: 'bg-green-50 border-green-200',
                  yellow: 'bg-yellow-50 border-yellow-200',
                  red: 'bg-red-50 border-red-200',
                };
                const badgeClasses = {
                  green: 'bg-green-500',
                  yellow: 'bg-yellow-500',
                  red: 'bg-red-500',
                };

                return (
                  <div
                    key={station.id}
                    className={`p-2.5 rounded-lg border ${colorClasses[color]} cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => onAddStation(station)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{station.name}</p>
                          <p className="text-xs text-gray-500 truncate">{station.vicinity}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-white text-xs font-medium ${badgeClasses[color]}`}>
                          {label}
                        </span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {station.deviation.deviationPercent >= 0 ? '+' : ''}{station.deviation.deviationPercent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-1.5 text-xs text-gray-500 pl-7">
                      {station.deviation.extraDistance >= 0 ? '+' : ''}{formatDistance(Math.abs(station.deviation.extraDistance))} · {station.deviation.extraDuration >= 0 ? '+' : ''}{formatDuration(Math.abs(station.deviation.extraDuration))}
                    </div>
                    <p className="text-xs text-purple-600 pl-7 mt-1">Click to add as stop</p>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
