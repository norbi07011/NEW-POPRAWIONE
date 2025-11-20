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

export function AddressAutocomplete({
  value,
  onChange,
  label = 'Adres',
  placeholder = 'Typ adres...',
  required = false,
  className = '',
}: AddressAutocompleteProps) {
  return (
    <div className={className}>
      {label && <Label>{label}{required && ' *'}</Label>}
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete="street-address"
      />
    </div>
  );
}
