export function calculateDeviation(directRoute, detourRoute) {
  if (!directRoute || !detourRoute) {
    return null;
  }

  const directDistance = directRoute.distance.value; // meters
  const directDuration = directRoute.duration.value; // seconds

  const detourDistance = detourRoute.distance.value;
  const detourDuration = detourRoute.duration.value;

  const extraDistance = detourDistance - directDistance;
  const extraDuration = detourDuration - directDuration;

  const deviationPercent = directDistance > 0
    ? (extraDistance / directDistance) * 100
    : 0;

  return {
    extraDistance,
    extraDuration,
    deviationPercent,
    directDistance,
    directDuration,
    detourDistance,
    detourDuration,
  };
}

export function getDeviationLevel(deviationPercent) {
  if (deviationPercent < 10) {
    return { level: 'low', label: 'On the way', color: 'green' };
  } else if (deviationPercent < 25) {
    return { level: 'medium', label: 'Slight detour', color: 'yellow' };
  } else {
    return { level: 'high', label: 'Detour', color: 'red' };
  }
}

export function formatDistance(meters) {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}
