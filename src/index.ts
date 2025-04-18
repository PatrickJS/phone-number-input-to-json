export interface PhoneNumberData {
  countryCode: string;
  areaCode: string;
  localNumber: string;
  formattedNumber: string;
  isValid: boolean;
}

// Default country codes configuration
const DEFAULT_COUNTRY_CODES = {
  '1': 'US/Canada',
  '52': 'Mexico',
  '44': 'UK',
  '61': 'Australia',
  '82': 'South Korea',
  '81': 'Japan'
} as const;

export interface PhoneNumberConfig {
  countryCodes?: Record<string, string>;
}

/**
 * Parses a phone number string into a structured format
 * @param input - The phone number string to parse
 * @param config - Optional configuration for country codes
 * @returns PhoneNumberData object containing the parsed information
 */
export function parsePhoneNumber(input: string, config?: PhoneNumberConfig): PhoneNumberData {
  // Step 1: Initialize Default Values
  let countryCode = '1'; // Default to US
  let areaCode = '';
  let localNumber = '';
  let isValid = false;

  // Step 2: Get country codes from config or use defaults
  const countryCodes = config?.countryCodes || DEFAULT_COUNTRY_CODES;

  // Step 3: Basic Input Validation
  if (!input || input.trim() === '') {
    return {
      countryCode,
      areaCode,
      localNumber,
      formattedNumber: '',
      isValid: false
    };
  }

  // Step 4: Check for multiple plus signs
  const plusCount = (input.match(/\+/g) || []).length;
  if (plusCount > 1) {
    return {
      countryCode,
      areaCode,
      localNumber,
      formattedNumber: '',
      isValid: false
    };
  }

  // Step 5: Clean Input - get only digits
  const digits = input.replace(/\D/g, '');
  const hasPlus = plusCount === 1;

  // Step 6: Parse based on format
  if (hasPlus) {
    // International format - must have valid country code and exactly 10 digits after
    for (const [code, _] of Object.entries(countryCodes)) {
      if (digits.startsWith(code)) {
        const remainingDigits = digits.substring(code.length);
        if (remainingDigits.length === 10) {
          countryCode = code;
          areaCode = remainingDigits.substring(0, 3);
          localNumber = remainingDigits.substring(3);
          isValid = true;
          break;
        }
      }
    }
  } else {
    // Non-international format
    if (digits.length === 10) {
      // Standard 10-digit number
      countryCode = '1';
      areaCode = digits.substring(0, 3);
      localNumber = digits.substring(3);
      isValid = true;
    } else {
      // Check for country code prefix
      for (const [code, _] of Object.entries(countryCodes)) {
        if (digits.startsWith(code)) {
          const remainingDigits = digits.substring(code.length);
          if (remainingDigits.length === 10) {
            countryCode = code;
            areaCode = remainingDigits.substring(0, 3);
            localNumber = remainingDigits.substring(3);
            isValid = true;
            break;
          }
        }
      }
    }
  }

  // Step 7: Format Output
  const formattedNumber = isValid 
    ? `+${countryCode} (${areaCode}) ${localNumber.slice(0, 3)}-${localNumber.slice(3)}`
    : '';

  // Step 8: Return Result
  return {
    countryCode,
    areaCode,
    localNumber,
    formattedNumber,
    isValid
  };
} 