/**
 * ARIA Enhancement for Screen Readers
 * Adds missing ARIA labels and improves existing ones
 */

/**
 * Generate a descriptive label for an element
 */
function generateAriaLabel(element: HTMLElement): string | null {
  const tagName = element.tagName.toLowerCase();
  const text = element.textContent?.trim() || '';
  const type = element.getAttribute('type');
  const role = element.getAttribute('role');
  
  // Buttons
  if (tagName === 'button' || role === 'button') {
    if (text) return text;
    if (element.getAttribute('aria-label')) return null; // Already has label
    return 'Button';
  }
  
  // Links
  if (tagName === 'a') {
    if (text) return text;
    const href = element.getAttribute('href');
    if (href && href !== '#') {
      return `Link to ${href}`;
    }
    return 'Link';
  }
  
  // Form inputs
  if (tagName === 'input') {
    const placeholder = element.getAttribute('placeholder');
    const name = element.getAttribute('name');
    const label = element.getAttribute('aria-label');
    
    if (label) return null; // Already has label
    
    if (placeholder) return placeholder;
    if (name) return `${name} input`;
    if (type === 'submit') return 'Submit';
    if (type === 'button') return 'Button';
    return 'Input field';
  }
  
  // Images
  if (tagName === 'img') {
    const alt = element.getAttribute('alt');
    if (alt !== null) return null; // Has alt text (even if empty, it's intentional)
    
    const src = element.getAttribute('src') || '';
    const filename = src.split('/').pop() || 'image';
    return `Image: ${filename}`;
  }
  
  // Icons (common icon patterns)
  if (element.classList.contains('icon') || 
      element.classList.contains('fa') ||
      element.querySelector('svg')) {
    if (text) return text;
    return 'Icon';
  }
  
  return null;
}

/**
 * Enhance a single element with ARIA attributes
 */
function enhanceElement(element: HTMLElement): void {
  // Skip if already processed
  if (element.hasAttribute('data-a11y-aria-enhanced')) {
    return;
  }
  
  // Skip if element is hidden
  if (element.offsetParent === null && 
      window.getComputedStyle(element).display === 'none') {
    return;
  }
  
  const label = generateAriaLabel(element);
  
  if (label) {
    // Add aria-label if missing
    if (!element.getAttribute('aria-label')) {
      element.setAttribute('aria-label', label);
    }
  }
  
  // Mark as processed
  element.setAttribute('data-a11y-aria-enhanced', 'true');
}

/**
 * Add landmark roles to common page sections
 */
function enhanceLandmarks(): void {
  // Main content
  const main = document.querySelector('main, [role="main"]') || 
               document.querySelector('article') ||
               document.querySelector('.main, .content');
  
  if (main && !main.getAttribute('role')) {
    main.setAttribute('role', 'main');
  }
  
  // Navigation
  const navs = document.querySelectorAll('nav:not([role])');
  navs.forEach(nav => {
    nav.setAttribute('role', 'navigation');
  });
  
  // Headers
  const headers = document.querySelectorAll('header:not([role])');
  headers.forEach(header => {
    header.setAttribute('role', 'banner');
  });
  
  // Footers
  const footers = document.querySelectorAll('footer:not([role])');
  footers.forEach(footer => {
    footer.setAttribute('role', 'contentinfo');
  });
  
  // Search
  const searchForms = document.querySelectorAll('form[role="search"], form.search');
  searchForms.forEach(form => {
    if (!form.getAttribute('role')) {
      form.setAttribute('role', 'search');
    }
  });
}

/**
 * Enhance all interactive elements on the page
 */
export function enhancePageAria(): void {
  // Enhance landmarks first
  enhanceLandmarks();
  
  // Enhance interactive elements
  const selectors = [
    'button',
    'a',
    'input',
    'select',
    'textarea',
    '[role="button"]',
    '[role="link"]',
    'img',
    '[class*="icon"]',
    '[class*="btn"]'
  ];
  
  selectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll<HTMLElement>(selector);
      elements.forEach(element => {
        enhanceElement(element);
      });
    } catch (e) {
      // Ignore invalid selectors
      console.warn('Invalid selector:', selector);
    }
  });
}

/**
 * Remove ARIA enhancements (cleanup)
 */
export function removeAriaEnhancements(): void {
  const enhanced = document.querySelectorAll('[data-a11y-aria-enhanced]');
  enhanced.forEach(element => {
    const originalLabel = element.getAttribute('data-a11y-original-aria-label');
    if (originalLabel === null) {
      // We added this aria-label, remove it
      element.removeAttribute('aria-label');
    } else if (originalLabel === '') {
      // Original had no label, remove it
      element.removeAttribute('aria-label');
    } else {
      // Restore original label
      element.setAttribute('aria-label', originalLabel);
    }
    element.removeAttribute('data-a11y-aria-enhanced');
    element.removeAttribute('data-a11y-original-aria-label');
  });
  
  // Also remove any landmark roles we might have added
  // (We don't track these, but they're usually safe to leave)
}

