// framework.js

/**
 * Attaches event listeners declaratively based on data-event-* attributes.
 * Searches within the provided parent element.
 * @param {Element} parentElement - The element to search within for event attributes.
 * @param {Object<string, Function>} handlers - An object mapping handler names (from data-event-* attributes) to functions.
 */
function attachEventListeners(parentElement, handlers) {
  if (!parentElement || typeof parentElement.querySelectorAll !== 'function') {
    console.error('Invalid parentElement provided to attachEventListeners');
    return;
  }
  if (!handlers || typeof handlers !== 'object') {
    console.error('Invalid handlers object provided to attachEventListeners');
    return;
  }

  // Select all elements with any data-event-* attribute within the parent
  parentElement.querySelectorAll('[data-event-submit], [data-event-input], [data-event-paste], [data-event-click], [data-event-blur], [data-event-keydown]').forEach(element => {
    // Iterate over all data attributes of the element
    for (const key in element.dataset) {
      if (key.startsWith('event')) {
        // Extract event type (e.g., 'submit', 'input', 'blur')
        const eventType = key.substring(5).toLowerCase();
        // Get the handler function name (e.g., 'handleFormSubmit')
        const handlerName = element.dataset[key];
        // Find the corresponding handler function
        const handler = handlers[handlerName];

        if (typeof handler === 'function') {
          // Add the event listener
          element.addEventListener(eventType, handler);
          // console.log(`Attached ${eventType} listener calling ${handlerName} to`, element);
        } else {
          // Warn if a handler specified in the HTML wasn't found in the provided handlers object
          console.warn(`Handler "${handlerName}" not found for event "${eventType}" on element:`, element);
        }
      }
    }
  });
}

/**
 * Renders content from a template into a container element, optionally populating data.
 * Placeholders within the template should have `data-ref="key"` corresponding to keys in the data object.
 * @param {Element} containerElement - The DOM element to render content into.
 * @param {string} templateId - The ID of the HTML <template> element.
 * @param {Object} [data={}] - Optional data object. Values will be placed into template elements with matching `data-ref` attributes.
 * @throws {Error} If container or template is invalid.
 */
export function renderTemplateInto(containerElement, templateId, data = {}) {
    if (!containerElement) {
        throw new Error('Container element is required for renderTemplateInto.');
    }
    const template = document.getElementById(templateId);
    if (!template || !(template instanceof HTMLTemplateElement)) {
        throw new Error(`Template with ID "${templateId}" not found or is not a <template> element.`);
    }

    // Clear previous content
    containerElement.innerHTML = '';

    // Clone the template content
    const content = template.content.cloneNode(true);

    // Populate data into elements with matching data-ref within the cloned fragment
    if (data && typeof data === 'object') {
        for (const key in data) {
            // Query within the cloned fragment, not the whole document
            const refElement = content.querySelector(`[data-ref="${key}"]`);
            if (refElement) {
                // Use textContent for security unless HTML is explicitly needed and sanitized
                refElement.textContent = data[key]; 
            } else {
                 console.warn(`renderTemplateInto: data-ref="${key}" not found in template "${templateId}".`);
            }
        }
    }

    // Append the populated content
    containerElement.appendChild(content);
}

/**
 * Mounts a component defined by an HTML template into a root element.
 * The root element must specify the template ID via a `data-template` attribute.
 * It clones the template, collects references (data-ref), and attaches event listeners.
 * @param {Element} rootElement - The DOM element to render the component into (must have `data-template`).
 * @param {Function} setupComponent - A function that receives the collected refs object 
 *                                    and should return an object containing the event handlers 
 *                                    for the component.
 * @returns {Object<string, Element>} - An object mapping ref names to their DOM elements.
 * @throws {Error} If rootElement is invalid, missing `data-template`, template not found, or setupComponent is invalid.
 */
export function mountComponent(rootElement, setupComponent) {
  if (!rootElement || !rootElement.dataset) {
    throw new Error('Root element is required for mountComponent.');
  }
  
  const templateId = rootElement.dataset.template;
  if (!templateId) {
    throw new Error('Root element must have a `data-template` attribute specifying the template ID.');
  }

  if (typeof setupComponent !== 'function') {
    throw new Error('setupComponent function is required for mountComponent.');
  }

  const template = document.getElementById(templateId);
  if (!template || !(template instanceof HTMLTemplateElement)) {
    throw new Error(`Template with ID "${templateId}" (specified by root element) not found or is not a <template> element.`);
  }

  // Clear previous content and render the new component
  rootElement.innerHTML = '';
  const content = template.content.cloneNode(true);
  rootElement.appendChild(content);

  // Collect references to elements with data-ref within the newly added content
  const refs = {};
  rootElement.querySelectorAll('[data-ref]').forEach(element => {
    refs[element.dataset.ref] = element;
  });

  // Call the application-specific setup function, passing the refs.
  const handlers = setupComponent(refs);

  // Attach the event listeners based on data-event-* attributes within the component's root
  attachEventListeners(rootElement, handlers);

  return refs;
} 