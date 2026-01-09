function generateAriaLabel(element: HTMLElement): string | null {
  const tagName = element.tagName.toLowerCase();
  const text = element.textContent?.trim() || '';
  const type = element.getAttribute('type');
  const role = element.getAttribute('role');
  
  if (tagName === 'button' || role === 'button') {
    if (text) return text;
    if (element.getAttribute('aria-label')) return null; 
    return 'Button';
  }
  
  if (tagName === 'a') {
    if (text) return text;
    const href = element.getAttribute('href');
    if (href && href !== '#') {
      return `Link to ${href}`;
    }
    return 'Link';
  }
  
  if (tagName === 'input') {
    const placeholder = element.getAttribute('placeholder');
    const name = element.getAttribute('name');
    const label = element.getAttribute('aria-label');
    
    if (label) return null; 
    
    if (placeholder) return placeholder;
    if (name) return `${name} input`;
    if (type === 'submit') return 'Submit';
    if (type === 'button') return 'Button';
    return 'Input field';
  }
  
  if (tagName === 'img') {
    const alt = element.getAttribute('alt');
    if (alt !== null) return null; 
    
    const src = element.getAttribute('src') || '';
    const filename = src.split('/').pop() || 'image';
    return `Image: ${filename}`;
  }
  
  if (element.classList.contains('icon') || 
      element.classList.contains('fa') ||
      element.querySelector('svg')) {
    if (text) return text;
    return 'Icon';
  }
  
  return null;
}

function enhanceElement(element: HTMLElement): void {
  
  if (element.hasAttribute('data-a11y-aria-enhanced')) {
    return;
  }
  
  if (element.offsetParent === null && 
      window.getComputedStyle(element).display === 'none') {
    return;
  }
  
  const label = generateAriaLabel(element);
  
  if (label) {
    
    if (!element.getAttribute('aria-label')) {
      element.setAttribute('aria-label', label);
    }
  }
  
  element.setAttribute('data-a11y-aria-enhanced', 'true');
}

function enhanceLandmarks(): void {
  
  const main = document.querySelector('main, [role="main"]') || 
               document.querySelector('article') ||
               document.querySelector('.main, .content');
  
  if (main && !main.getAttribute('role')) {
    main.setAttribute('role', 'main');
  }
  
  const navs = document.querySelectorAll('nav:not([role])');
  navs.forEach(nav => {
    nav.setAttribute('role', 'navigation');
  });
  
  const headers = document.querySelectorAll('header:not([role])');
  headers.forEach(header => {
    header.setAttribute('role', 'banner');
  });
  
  const footers = document.querySelectorAll('footer:not([role])');
  footers.forEach(footer => {
    footer.setAttribute('role', 'contentinfo');
  });
  
  const searchForms = document.querySelectorAll('form[role="search"], form.search');
  searchForms.forEach(form => {
    if (!form.getAttribute('role')) {
      form.setAttribute('role', 'search');
    }
  });
}

export function enhancePageAria(): void {
  
  enhanceLandmarks();

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
      
      console.warn('Invalid selector:', selector);
    }
  });
}

export function removeAriaEnhancements(): void {
  const enhanced = document.querySelectorAll('[data-a11y-aria-enhanced]');
  enhanced.forEach(element => {
    const originalLabel = element.getAttribute('data-a11y-original-aria-label');
    if (originalLabel === null) {
      
      element.removeAttribute('aria-label');
    } else if (originalLabel === '') {
      
      element.removeAttribute('aria-label');
    } else {
     
      element.setAttribute('aria-label', originalLabel);
    }
    element.removeAttribute('data-a11y-aria-enhanced');
    element.removeAttribute('data-a11y-original-aria-label');
  });
  
}

