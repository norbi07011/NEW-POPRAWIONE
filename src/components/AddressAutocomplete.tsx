import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onAddressDetails?: (details: AddressDetails) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export interface AddressDetails {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  fullAddress: string;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';

export function AddressAutocomplete({
  value,
  onChange,
  onAddressDetails,
  label = 'Adres',
  placeholder = 'Typ adres...',
  required = false,
  className = '',
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null); // google.maps.places.Autocomplete
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Sprawdź czy Google Maps już załadowane
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      return;
    }

    // Załaduj Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=nl`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup nie usuwamy skryptu bo może być używany przez inne komponenty
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    // Inicjalizuj Google Places Autocomplete
    // @ts-ignore - Google Maps loaded dynamically
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: ['nl', 'be', 'de', 'pl'] }, // Holandia, Belgia, Niemcy, Polska
      fields: ['address_components', 'formatted_address', 'geometry', 'name'],
    });

    // Listener na wybór adresu
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      
      if (!place || !place.address_components) {
        return;
      }

      // Parsuj komponenty adresu
      let street = '';
      let houseNumber = '';
      let city = '';
      let postalCode = '';
      let country = '';

      place.address_components.forEach((component) => {
        const types = component.types;
        
        if (types.includes('route')) {
          street = component.long_name;
        }
        if (types.includes('street_number')) {
          houseNumber = component.long_name;
        }
        if (types.includes('locality') || types.includes('postal_town')) {
          city = component.long_name;
        }
        if (types.includes('postal_code')) {
          postalCode = component.long_name;
        }
        if (types.includes('country')) {
          country = component.short_name;
        }
      });

      const fullStreet = houseNumber ? `${street} ${houseNumber}` : street;
      const fullAddress = place.formatted_address || '';

      const details: AddressDetails = {
        street: fullStreet,
        city,
        postalCode,
        country,
        fullAddress,
      };

      onChange(fullAddress);
      if (onAddressDetails) {
        onAddressDetails(details);
      }
    });

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        // @ts-ignore - Google Maps loaded dynamically
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onChange, onAddressDetails]);

  return (
    <div className={className}>
      {label && <Label>{label}{required && ' *'}</Label>}
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />
      {!isLoaded && (
        <p className="text-xs text-gray-500 mt-1">Laden van adressuggésties...</p>
      )}
    </div>
  );
}
