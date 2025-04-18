import { parsePhoneNumber } from 'phone-number-lib';
import { mountComponent, renderTemplateInto } from './framework.js';

// --- Phone Input Application Specific Logic ---

/**
 * Phone number masking function for the national number part.
 * Cleans input (removes non-digits).
 * Applies US/Canada format (XXX) XXX-XXXX ONLY if isValidState is true.
 * Assumes country code is handled separately (e.g., by dropdown).
 * @param {HTMLInputElement} input - The input element.
 * @param {boolean} isValidState - Whether the input is currently considered valid.
 */
function maskPhoneNumber(input, isValidState) {
  try {
    const originalValue = input.value;
    
    // Always clean the entire input to get only digits for masking the national number
    let cleanedDigits = originalValue.replace(/\D/g, '');
    
    // Limit to 10 digits for the national number mask (US/Canada format)
    cleanedDigits = cleanedDigits.substring(0, 10);

    let maskedValue = '';

    if (isValidState) {
        // Apply (XXX) XXX-XXXX format only if state is valid
         if (cleanedDigits.length > 0) {
            if (cleanedDigits.length <= 3) {
              maskedValue = `(${cleanedDigits}`;
            } else if (cleanedDigits.length <= 6) {
              maskedValue = `(${cleanedDigits.slice(0, 3)}) ${cleanedDigits.slice(3)}`;
            } else {
              maskedValue = `(${cleanedDigits.slice(0, 3)}) ${cleanedDigits.slice(3, 6)}-${cleanedDigits.slice(6, 10)}`;
            }
        }
    } else {
        // If not valid, just show the cleaned digits (up to 10)
        maskedValue = cleanedDigits;
    }
    
    if (input.value !== maskedValue) {
        let cursorPos = input.selectionStart;
        const originalLength = input.value.length;
        input.value = maskedValue;
        const newLength = maskedValue.length;
        
        // Calculate how many non-digit chars were removed/added *before* the original cursor
        const originalNonDigitsBeforeCursor = (originalValue.substring(0, cursorPos).match(/\D/g) || []).length;
        const newNonDigitsBeforeCursor = (maskedValue.substring(0, cursorPos - (originalLength - newLength)).match(/\D/g) || []).length; // Approximate new position
        
        // Adjust cursor position
        cursorPos += (newNonDigitsBeforeCursor - originalNonDigitsBeforeCursor); // Adjust for added/removed formatting
        cursorPos -= (originalLength - newLength) - (originalNonDigitsBeforeCursor - newNonDigitsBeforeCursor); // Adjust for removed digits
        
        cursorPos = Math.max(0, Math.min(cursorPos, newLength)); 
        input.setSelectionRange(cursorPos, cursorPos);
    }

  } catch (error) {
    console.error("Error during phone number masking:", error);
  }
}

/**
 * Sets up the phone input component logic and event handlers.
 * This function is passed to mountComponent.
 * @param {Object<string, Element>} refs - The refs collected by mountComponent.
 * @returns {Object<string, Function>} - The event handlers for this component.
 */
function setupPhoneComponent(refs) {
  // --- State ---
  let hasSubmittedOnce = false;
  let isValidState = false; // Track the current validity state
  const MIN_DIGIT_LENGTH_FOR_VALIDATION = 10;

  // --- Validation & Display Logic ---
  function validateAndDisplayResult() {
    try {
      refs.hintsDiv.classList.remove('hidden');
      // IMPORTANT: Validation uses dropdown + input value
      const result = parsePhoneNumber(refs.phoneInput.value, refs.countrySelect.value);
      refs.resultDiv.classList.remove('hidden');
      
      isValidState = result.isValid;

      if (result.isValid) {
        renderTemplateInto(refs.resultDiv, 'valid-result-template', { 
            jsonData: JSON.stringify(result, null, 2) 
        });
        // When valid, update input to reflect the national number portion 
        // if the lib provides it separately, or keep the masked version.
        // For now, let's re-apply mask to ensure consistency with the valid state.
        maskPhoneNumber(refs.phoneInput, isValidState); 
      } else {
        renderTemplateInto(refs.resultDiv, 'invalid-result-template');
        maskPhoneNumber(refs.phoneInput, isValidState); 
      }
    } catch (error) {
      console.error("Error during validation:", error);
      isValidState = false; 
      refs.resultDiv.classList.remove('hidden');
      renderTemplateInto(refs.resultDiv, 'error-result-template', { 
          errorMessage: `Error: ${error.message}` 
      });
       maskPhoneNumber(refs.phoneInput, isValidState);
    }
  }

  // Check required refs
  const requiredRefs = ['phoneForm', 'countrySelect', 'phoneInput', 'hintsDiv', 'resultDiv'];
  for (const refName of requiredRefs) {
    if (!refs[refName]) {
      console.error(`setupPhoneComponent: Missing required ref "${refName}"`);
      return {};
    }
  }

  // --- Event Handlers ---
  const handlers = {
    handleFormSubmit: (e) => {
      e.preventDefault();
      if (!hasSubmittedOnce) {
          hasSubmittedOnce = true; 
      }
      validateAndDisplayResult(); 
    },

    handlePhoneInput: (e) => {
      maskPhoneNumber(e.target, isValidState);
      if (hasSubmittedOnce) {
        const digits = e.target.value.replace(/\D/g, '');
        if (digits.length >= MIN_DIGIT_LENGTH_FOR_VALIDATION) {
          validateAndDisplayResult(); 
        }
      }
    },

    handlePhoneBlur: () => {
      if (hasSubmittedOnce) {
        validateAndDisplayResult(); 
      }
    },

    handlePhoneKeydown: (e) => {
      if (hasSubmittedOnce && e.key === 'Enter') {
        e.preventDefault(); 
        validateAndDisplayResult(); 
      }
    },

    handlePhonePaste: (e) => {
      e.preventDefault();
      try {
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        let cleanedPasteDigits = pastedText.replace(/\D/g, '');
        refs.phoneInput.value = cleanedPasteDigits.substring(0, 10);
        
        if (hasSubmittedOnce) {
           validateAndDisplayResult(); 
        } else {
            maskPhoneNumber(refs.phoneInput, isValidState);
        }
      } catch (error) {
        console.error("Error during paste event:", error);
        alert("Error processing pasted text: " + error.message);
      }
    }
  };

  return handlers;
}

// --- Initialization ---

try {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element with ID "root" not found.');
  }
  mountComponent(root, setupPhoneComponent);
  console.log("Phone Input App initialized successfully using framework.");

} catch (error) {
  console.error("Failed to initialize application:", error);
  const root = document.getElementById('root') || document.body;
  root.innerHTML = `<div class="text-red-600 p-4">Critical error: ${error.message}. App cannot initialize. Check console.</div>`;
} 