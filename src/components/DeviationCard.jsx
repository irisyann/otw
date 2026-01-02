import { getDeviationLevel, formatDistance, formatDuration } from '../utils/deviationCalculator';

export default function DeviationCard({ deviation }) {
  if (!deviation) return null;

  const { extraDistance, extraDuration, deviationPercent } = deviation;
  const { label, color } = getDeviationLevel(deviationPercent);

  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  };

  const badgeClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  const distanceSign = extraDistance >= 0 ? '+' : '-';
  const durationSign = extraDuration >= 0 ? '+' : '-';
  const percentSign = deviationPercent >= 0 ? '+' : '-';

  return (
    <div className={`mt-2 p-3 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-white text-xs font-medium ${badgeClasses[color]}`}>
            {label}
          </span>
          <span className="text-sm font-medium">
            {percentSign}{Math.abs(deviationPercent).toFixed(1)}%
          </span>
        </div>
        <div className="text-xs text-gray-600">
          {distanceSign}{formatDistance(Math.abs(extraDistance))} · {durationSign}{formatDuration(Math.abs(extraDuration))}
        </div>
      </div>
    </div>
  );
}
