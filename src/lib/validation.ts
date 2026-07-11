// Shared form validation helpers — used by any form with manual
// (non react-hook-form) state, e.g. the checkout/profile address forms.
// Forms built on react-hook-form + zod should define their own schema
// instead, but can still reuse the regexes below for consistency.

export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
export const INDIAN_PINCODE_REGEX = /^\d{6}$/;
export const NAME_REGEX = /^[A-Za-z][A-Za-z\s.'-]{1,49}$/;

export function validateFullName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Full name is required';
  if (trimmed.length < 2) return 'Full name must be at least 2 characters';
  if (trimmed.length > 50) return 'Full name must be under 50 characters';
  if (!NAME_REGEX.test(trimmed)) return 'Full name can only contain letters, spaces, and - . \'';
  return null;
}

export function validatePhone(value: string): string | null {
  const trimmed = value.trim().replace(/[\s-]/g, '');
  if (!trimmed) return 'Phone number is required';
  if (!INDIAN_PHONE_REGEX.test(trimmed)) return 'Enter a valid 10-digit mobile number';
  return null;
}

/** Same as validatePhone, but an empty value is allowed (for optional contact fields). */
export function validateOptionalPhone(value: string): string | null {
  const trimmed = value.trim().replace(/[\s-]/g, '');
  if (!trimmed) return null;
  if (!INDIAN_PHONE_REGEX.test(trimmed)) return 'Enter a valid 10-digit mobile number';
  return null;
}

export function validatePersonName(value: string, label = 'Name'): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${label} is required`;
  if (trimmed.length < 2) return `${label} must be at least 2 characters`;
  if (trimmed.length > 50) return `${label} must be under 50 characters`;
  if (!NAME_REGEX.test(trimmed)) return `${label} can only contain letters`;
  return null;
}

export function validateAge(value: string): string | null {
  if (!value.trim()) return null;
  const age = Number(value);
  if (!Number.isInteger(age)) return 'Age must be a whole number';
  if (age < 13 || age > 120) return 'Age must be between 13 and 120';
  return null;
}

export function validateStreet(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Street address is required';
  if (trimmed.length < 5) return 'Please enter a complete street address';
  if (trimmed.length > 200) return 'Street address is too long';
  return null;
}

export function validateCity(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'City is required';
  if (trimmed.length < 2) return 'Enter a valid city name';
  if (trimmed.length > 50) return 'City name is too long';
  return null;
}

export function validateState(value: string): string | null {
  if (!value.trim()) return 'Please select a state';
  return null;
}

export function validatePincode(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Pincode is required';
  if (!INDIAN_PINCODE_REGEX.test(trimmed)) return 'Enter a valid 6-digit pincode';
  return null;
}

export interface AddressFormValues {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

/** Validates a shipping/billing address form. Returns a field->message map (empty if valid). */
export function validateAddressFields(values: AddressFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  const fullNameError = validateFullName(values.fullName);
  const phoneError = validatePhone(values.phone);
  const streetError = validateStreet(values.street);
  const cityError = validateCity(values.city);
  const stateError = validateState(values.state);
  const zipError = validatePincode(values.zipCode);

  if (fullNameError) errors.fullName = fullNameError;
  if (phoneError) errors.phone = phoneError;
  if (streetError) errors.street = streetError;
  if (cityError) errors.city = cityError;
  if (stateError) errors.state = stateError;
  if (zipError) errors.zipCode = zipError;

  return errors;
}
