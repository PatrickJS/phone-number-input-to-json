# Phone Number Input to JSON

A simple utility to parse phone numbers into a structured JSON format. Supports multiple country formats and validation rules.

## Features

- Parses phone numbers into a structured format
- Supports multiple country codes (US/Canada, Mexico, UK, Australia, South Korea, Japan)
- Handles both international and standard formats
- Validates phone number structure
- Customizable country code configuration

## Installation

```bash
npm install phone-number-input-to-json
```

## Usage

### Basic Usage

```typescript
import { parsePhoneNumber } from 'phone-number-input-to-json';

// Standard 10-digit format (US/Canada)
const result1 = parsePhoneNumber('555-555-5555');
// Result:
// {
//   countryCode: '1',
//   areaCode: '555',
//   localNumber: '5555555',
//   formattedNumber: '+1 (555) 555-5555',
//   isValid: true
// }

// International format
const result2 = parsePhoneNumber('+52 555-555-5555');
// Result:
// {
//   countryCode: '52',
//   areaCode: '555',
//   localNumber: '5555555',
//   formattedNumber: '+52 (555) 555-5555',
//   isValid: true
// }
```

### Supported Formats

1. Standard 10-digit format:
   - `555-555-5555`
   - `(555) 555-5555`
   - `555.555.5555`
   - `5555555555`

2. International format (with plus sign):
   - `+1 555-555-5555`
   - `+52 555-555-5555`
   - `+44 555-555-5555`
   - `+61 555-555-5555`
   - `+82 555-555-5555`
   - `+81 555-555-5555`

3. Country code prefix format (without plus):
   - `15555555555` (US/Canada)
   - `525555555555` (Mexico)
   - `445555555555` (UK)
   - `615555555555` (Australia)
   - `825555555555` (South Korea)
   - `815555555555` (Japan)

### Custom Country Codes

You can provide your own country code configuration:

```typescript
const result = parsePhoneNumber('+81 555-555-5555', {
  countryCodes: {
    '81': 'Japan',
    '82': 'South Korea'
  }
});
```

### Validation Rules

1. Empty or whitespace-only input is invalid
2. Multiple plus signs are invalid
3. For international format (with plus sign):
   - Must start with a valid country code
   - Must have exactly 10 digits after the country code
4. For standard format (no plus sign):
   - Must be exactly 10 digits, or
   - Must start with a valid country code and have exactly 10 digits after

### Return Format

```typescript
interface PhoneNumberData {
  countryCode: string;    // Country code (e.g., '1', '52', '44')
  areaCode: string;       // Area code (first 3 digits)
  localNumber: string;    // Local number (remaining 7 digits)
  formattedNumber: string; // Formatted number with country code
  isValid: boolean;       // Whether the number is valid
}
```

## License

MIT
