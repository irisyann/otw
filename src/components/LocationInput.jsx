import { useRef, useEffect, useState } from 'react';

export default function LocationInput({
  label,
  placeholder,
  onPlaceSelect,
  icon,
  value
}) {
  const containerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [isEditing, setIsEditing] = useState(!value);

  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
  }, [onPlaceSelect]);

  // Update editing state when value changes
  useEffect(() => {
    if (value) {
      setIsEditing(false);
    }
  }, [value]);

  // Check for Google Maps availability
  useEffect(() => {
    const checkGoogle = () => {
      if (window.google?.maps?.places?.PlaceAutocompleteElement) {
        setIsGoogleReady(true);
      } else {
        setTimeout(checkGoogle, 100);
      }
    };
    checkGoogle();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !isGoogleReady || !isEditing) return;
    if (autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.PlaceAutocompleteElement({
      types: ['geocode', 'establishment'],
    });

    autocomplete.style.cssText = `
      width: 100%;
      --gmpx-color-surface: white;
      --gmpx-color-on-surface: #374151;
      --gmpx-color-primary: #3b82f6;
    `;

    if (placeholder) {
      autocomplete.setAttribute('placeholder', placeholder);
    }

    autocompleteRef.current = autocomplete;
    containerRef.current.appendChild(autocomplete);

    autocomplete.addEventListener('gmp-select', async (event) => {
      const placePrediction = event.placePrediction || event.place || event.Eg;
      if (!placePrediction) return;

      try {
        const place = placePrediction.toPlace ? placePrediction.toPlace() : placePrediction;
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location']
        });

        if (place.location) {
          const lat = typeof place.location.lat === 'function'
            ? place.location.lat()
            : place.location.lat;
          const lng = typeof place.location.lng === 'function'
            ? place.location.lng()
            : place.location.lng;

          onPlaceSelectRef.current({
            name: place.formattedAddress || place.displayName,
            lat,
            lng,
            placeId: place.id,
          });
        }
      } catch (error) {
        console.error('Error fetching place details:', error);
      }
    });

    return () => {
      if (autocompleteRef.current && containerRef.current) {
        containerRef.current.removeChild(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [isGoogleReady, placeholder, isEditing]);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
            {icon}
          </span>
        )}
        {!isEditing && value ? (
          <div
            onClick={() => setIsEditing(true)}
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-white text-gray-700 cursor-pointer hover:border-gray-400 transition-colors truncate ${icon ? 'pl-10' : ''}`}
            title={value}
          >
            {value}
          </div>
        ) : (
          <div
            ref={containerRef}
            className={`location-input-container border border-gray-200 rounded-lg ${icon ? 'has-icon' : ''}`}
          />
        )}
      </div>
      <style>{`
        .location-input-container gmp-place-autocomplete {
          width: 100%;
          color-scheme: light only;
          border-radius: 0.5rem;
        }
        .location-input-container gmp-place-autocomplete::part(input) {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 1rem;
          outline: 1px solid #d1d5db;
          outline-offset: -1px;
          background-color: white;
          color: #374151;
        }
        .location-input-container gmp-place-autocomplete::part(input):focus {
          border-color: #3b82f6;
          outline: 2px solid #3b82f6;
          outline-offset: -1px;
        }
        .location-input-container.has-icon gmp-place-autocomplete::part(input) {
          padding-left: 2.5rem;
        }
      `}</style>
    </div>
  );
}
