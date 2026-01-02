import { useRef, useEffect, useState } from 'react';

export default function LocationInput({
  label,
  placeholder,
  onPlaceSelect,
  icon
}) {
  const containerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
  }, [onPlaceSelect]);

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
    if (!containerRef.current || !isGoogleReady) return;
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
  }, [isGoogleReady, placeholder]);

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
        <div
          ref={containerRef}
          className={`location-input-container ${icon ? 'has-icon' : ''}`}
        />
      </div>
      <style>{`
        .location-input-container gmp-place-autocomplete {
          width: 100%;
          color-scheme: light only;
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
