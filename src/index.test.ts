import { describe, it, expect } from 'vitest';
import { parsePhoneNumber } from './index';

describe('parsePhoneNumber', () => {
  // US/Canada Tests
  describe('US/Canada format', () => {
    it('should parse standard 10-digit format', () => {
      const result = parsePhoneNumber('555-555-5555');
      expect(result).toEqual({
        countryCode: '1',
        areaCode: '555',
        localNumber: '5555555',
        formattedNumber: '+1 (555) 555-5555',
        isValid: true
      });
    });

    it('should parse international format with +1', () => {
      const result = parsePhoneNumber('+1 555-555-5555');
      expect(result).toEqual({
        countryCode: '1',
        areaCode: '555',
        localNumber: '5555555',
        formattedNumber: '+1 (555) 555-5555',
        isValid: true
      });
    });

    it('should parse 11-digit format with leading 1', () => {
      const result = parsePhoneNumber('15555555555');
      expect(result).toEqual({
        countryCode: '1',
        areaCode: '555',
        localNumber: '5555555',
        formattedNumber: '+1 (555) 555-5555',
        isValid: true
      });
    });
  });

  // Mexico Tests
  describe('Mexico format', () => {
    it('should parse international format with +52', () => {
      const result = parsePhoneNumber('+52 555-555-5555');
      expect(result).toEqual({
        countryCode: '52',
        areaCode: '555',
        localNumber: '5555555',
        formattedNumber: '+52 (555) 555-5555',
        isValid: true
      });
    });

    it('should parse 12-digit format with leading 52', () => {
      const result = parsePhoneNumber('525555555555');
      expect(result).toEqual({
        countryCode: '52',
        areaCode: '555',
        localNumber: '5555555',
        formattedNumber: '+52 (555) 555-5555',
        isValid: true
      });
    });
  });

  // UK Tests
  describe('UK format', () => {
    it('should parse international format with +44', () => {
      const result = parsePhoneNumber('+44 555-555-5555');
      expect(result).toEqual({
        countryCode: '44',
        areaCode: '555',
        localNumber: '5555555',
        formattedNumber: '+44 (555) 555-5555',
        isValid: true
      });
    });

    it('should parse 12-digit format with leading 44', () => {
      const result = parsePhoneNumber('445555555555');
      expect(result).toEqual({
        countryCode: '44',
        areaCode: '555',
        localNumber: '5555555',
        formattedNumber: '+44 (555) 555-5555',
        isValid: true
      });
    });
  });

  // Australia Tests
  describe('Australia format', () => {
    it('should parse international format with +61', () => {
      const result = parsePhoneNumber('+61 555-555-5555');
      expect(result).toEqual({
        countryCode: '61',
        areaCode: '555',
        localNumber: '5555555',
        formattedNumber: '+61 (555) 555-5555',
        isValid: true
      });
    });

    it('should parse 12-digit format with leading 61', () => {
      const result = parsePhoneNumber('615555555555');
      expect(result).toEqual({
        countryCode: '61',
        areaCode: '555',
        localNumber: '5555555',
        formattedNumber: '+61 (555) 555-5555',
        isValid: true
      });
    });
  });

  // South Korea Tests
  describe('South Korea format', () => {
    it('should parse international format with +82', () => {
      const result = parsePhoneNumber('+82 555-555-5555');
      expect(result).toEqual({
        countryCode: '82',
        areaCode: '555',
        localNumber: '5555555',
        formattedNumber: '+82 (555) 555-5555',
        isValid: true
      });
    });

    it('should parse 12-digit format with leading 82', () => {
      const result = parsePhoneNumber('825555555555');
      expect(result).toEqual({
        countryCode: '82',
        areaCode: '555',
        localNumber: '5555555',
        formattedNumber: '+82 (555) 555-5555',
        isValid: true
      });
    });
  });

  // Japan Tests
  describe('Japan format', () => {
    it('should parse international format with +81', () => {
      const result = parsePhoneNumber('+81 555-555-5555');
      expect(result).toEqual({
        countryCode: '81',
        areaCode: '555',
        localNumber: '5555555',
        formattedNumber: '+81 (555) 555-5555',
        isValid: true
      });
    });

    it('should parse 12-digit format with leading 81', () => {
      const result = parsePhoneNumber('815555555555');
      expect(result).toEqual({
        countryCode: '81',
        areaCode: '555',
        localNumber: '5555555',
        formattedNumber: '+81 (555) 555-5555',
        isValid: true
      });
    });
  });

  // Invalid Format Tests
  describe('Invalid formats', () => {
    it('should handle input with wrong country code', () => {
      const result = parsePhoneNumber('+2 555 555 5555');
      expect(result.isValid).toBe(false);
    });

    it('should handle input with multiple plus signs', () => {
      const result = parsePhoneNumber('++1 555 555 5555');
      expect(result.isValid).toBe(false);
    });

    it('should handle input with wrong number of digits', () => {
      const result = parsePhoneNumber('+1 555 555 555');
      expect(result.isValid).toBe(false);
    });

    it('should handle empty input', () => {
      const result = parsePhoneNumber('');
      expect(result.isValid).toBe(false);
    });
  });

  // Custom Country Codes Tests
  describe('Custom country codes', () => {
    it('should handle custom country codes', () => {
      const result = parsePhoneNumber('+81 555 555 5555', {
        countryCodes: {
          '81': 'Japan',
          '82': 'South Korea'
        }
      });
      expect(result).toEqual({
        countryCode: '81',
        areaCode: '555',
        localNumber: '5555555',
        formattedNumber: '+81 (555) 555-5555',
        isValid: true
      });
    });

    it('should handle custom country codes with standard format', () => {
      const result = parsePhoneNumber('815555555555', {
        countryCodes: {
          '81': 'Japan',
          '82': 'South Korea'
        }
      });
      expect(result).toEqual({
        countryCode: '81',
        areaCode: '555',
        localNumber: '5555555',
        formattedNumber: '+81 (555) 555-5555',
        isValid: true
      });
    });
  });
}); 