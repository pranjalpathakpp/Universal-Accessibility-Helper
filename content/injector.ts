import { getProfile, applyProfile, type ProfileId, type AccessibilityProfile } from '../utils/profiles';
import { simplifyPageText } from '../utils/textSimplifier';
import { enhancePageAria, removeAriaEnhancements } from '../utils/ariaEnhancer';
import { applyCognitiveReduction, removeCognitiveReduction } from '../utils/cognitiveReducer';


function injectStyles(): void {
  if (document.getElementById('a11y-styles')) {
    return; 
  }
  
  const style = document.createElement('style');
  style.id = 'a11y-styles';
  style.textContent = `
    /* Base accessibility styles */
    .a11y-enabled {
      --a11y-font-size: 1rem;
      --a11y-line-height: 1.5;
      --a11y-letter-spacing: 0;
      --a11y-word-spacing: 0;
      --a11y-font-family: system-ui, -apple-system, sans-serif;
    }
    
    /* Apply styles only to text elements, exclude media, code, and layout containers */
    .a11y-enabled body p,
    .a11y-enabled body span,
    .a11y-enabled body div:not([class*="container"]):not([class*="wrapper"]):not([class*="grid"]):not([class*="flex"]):not([class*="row"]):not([class*="col"]),
    .a11y-enabled body h1,
    .a11y-enabled body h2,
    .a11y-enabled body h3,
    .a11y-enabled body h4,
    .a11y-enabled body h5,
    .a11y-enabled body h6,
    .a11y-enabled body li,
    .a11y-enabled body td,
    .a11y-enabled body th,
    .a11y-enabled body label,
    .a11y-enabled body button:not([class*="icon"]),
    .a11y-enabled body a {
      font-size: var(--a11y-font-size) !important;
      line-height: var(--a11y-line-height) !important;
      letter-spacing: var(--a11y-letter-spacing) !important;
      word-spacing: var(--a11y-word-spacing) !important;
      font-family: var(--a11y-font-family) !important;
    }
    
    /* Exclude specific elements that should keep their original styling */
    .a11y-enabled body *:not(svg):not(img):not(video):not(canvas):not(iframe):not(code):not(pre):not(script):not(style):not(noscript):not([class*="icon"]):not([class*="logo"]) {
      /* Only apply if not already targeted above */
    }
    
    /* High contrast - safer approach without breaking layouts */
    .a11y-high-contrast body {
      background: #f5f5f5 !important;
    }
    
    /* Only apply to text elements, preserve layout elements */
    .a11y-high-contrast p,
    .a11y-high-contrast span:not([class*="icon"]):not([class*="logo"]),
    .a11y-high-contrast div:not([class*="container"]):not([class*="wrapper"]):not([class*="grid"]):not([class*="flex"]):not([class*="row"]):not([class*="col"]),
    .a11y-high-contrast h1,
    .a11y-high-contrast h2,
    .a11y-high-contrast h3,
    .a11y-high-contrast h4,
    .a11y-high-contrast h5,
    .a11y-high-contrast h6,
    .a11y-high-contrast li,
    .a11y-high-contrast td,
    .a11y-high-contrast th {
      color: #000 !important;
    }
    
    .a11y-high-contrast a {
      color: #0000EE !important;
      text-decoration: underline !important;
    }
    
    .a11y-very-high-contrast body {
      background: white !important;
      color: black !important;
    }
    
    .a11y-very-high-contrast p,
    .a11y-very-high-contrast span:not([class*="icon"]):not([class*="logo"]),
    .a11y-very-high-contrast div:not([class*="container"]):not([class*="wrapper"]):not([class*="grid"]):not([class*="flex"]):not([class*="row"]):not([class*="col"]),
    .a11y-very-high-contrast h1,
    .a11y-very-high-contrast h2,
    .a11y-very-high-contrast h3,
    .a11y-very-high-contrast h4,
    .a11y-very-high-contrast h5,
    .a11y-very-high-contrast h6,
    .a11y-very-high-contrast li,
    .a11y-very-high-contrast td,
    .a11y-very-high-contrast th {
      background: white !important;
      color: black !important;
      border-color: black !important;
    }
    
    .a11y-very-high-contrast a {
      color: #0000EE !important;
      text-decoration: underline !important;
    }
    
    /* Remove background images */
    .a11y-no-bg-images * {
      background-image: none !important;
    }
    
    /* Disable animations */
    .a11y-no-animations *,
    .a11y-no-animations *::before,
    .a11y-no-animations *::after {
      animation: none !important;
      transition: none !important;
    }

    /* Reading Mode */
    .a11y-reading-mode {
      max-width: 800px !important;
      margin: 0 auto !important;
    }

    .a11y-reading-mode body > *:not(main):not(article):not([role="main"]):not([role="article"]) {
      display: none !important;
    }

    .a11y-reading-mode main,
    .a11y-reading-mode article,
    .a11y-reading-mode [role="main"],
    .a11y-reading-mode [role="article"] {
      max-width: 100% !important;
      padding: 40px 20px !important;
      background: #fafafa !important;
    }

    /* Reading Ruler */
    .a11y-reading-ruler {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: rgba(102, 126, 234, 0.5);
      pointer-events: none;
      z-index: 999999;
      box-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
      display: none;
    }

    .a11y-reading-ruler.active {
      display: block;
    }

    /* Color Blind Filters */
    .a11y-color-blind-protanopia {
      filter: url(#protanopia);
    }

    .a11y-color-blind-deuteranopia {
      filter: url(#deuteranopia);
    }

    .a11y-color-blind-tritanopia {
      filter: url(#tritanopia);
    }

    /* Dark Mode */
    .a11y-dark-mode {
      filter: invert(1) hue-rotate(180deg);
    }

    .a11y-dark-mode img,
    .a11y-dark-mode video,
    .a11y-dark-mode iframe,
    .a11y-dark-mode canvas {
      filter: invert(1) hue-rotate(180deg);
    }

    /* Enhanced Focus Indicators */
    .a11y-enabled *:focus-visible {
      outline: 3px solid #667eea !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3) !important;
    }

    .a11y-enabled button:focus-visible,
    .a11y-enabled a:focus-visible,
    .a11y-enabled input:focus-visible,
    .a11y-enabled select:focus-visible,
    .a11y-enabled textarea:focus-visible {
      outline: 3px solid #667eea !important;
      outline-offset: 2px !important;
      border-radius: 4px !important;
    }
  `;
  
  document.head.appendChild(style);
  
  // Add SVG filters for color blindness
  if (!document.getElementById('a11y-color-filters')) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'a11y-color-filters';
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Protanopia filter
    const protanopia = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    protanopia.id = 'protanopia';
    const protanopiaMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    protanopiaMatrix.setAttribute('type', 'matrix');
    protanopiaMatrix.setAttribute('values', '0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0');
    protanopia.appendChild(protanopiaMatrix);
    defs.appendChild(protanopia);
    
    // Deuteranopia filter
    const deuteranopia = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    deuteranopia.id = 'deuteranopia';
    const deuteranopiaMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    deuteranopiaMatrix.setAttribute('type', 'matrix');
    deuteranopiaMatrix.setAttribute('values', '0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0');
    deuteranopia.appendChild(deuteranopiaMatrix);
    defs.appendChild(deuteranopia);
    
    // Tritanopia filter
    const tritanopia = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    tritanopia.id = 'tritanopia';
    const tritanopiaMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    tritanopiaMatrix.setAttribute('type', 'matrix');
    tritanopiaMatrix.setAttribute('values', '0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0');
    tritanopia.appendChild(tritanopiaMatrix);
    defs.appendChild(tritanopia);
    
    svg.appendChild(defs);
    
    // Wait for body to be available
    if (document.body) {
      document.body.appendChild(svg);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        if (document.body) {
          document.body.appendChild(svg);
        }
      });
    }
  }
}


function removeEnhancements(): void {
  console.log('[A11y] Removing all enhancements');
  
  document.documentElement.classList.remove(
    'a11y-enabled',
    'a11y-high-contrast',
    'a11y-very-high-contrast',
    'a11y-no-bg-images',
    'a11y-no-animations',
    'a11y-reading-mode',
    'a11y-dark-mode',
    'a11y-color-blind-protanopia',
    'a11y-color-blind-deuteranopia',
    'a11y-color-blind-tritanopia'
  );
  
  // Remove reading ruler
  const ruler = document.getElementById('a11y-reading-ruler');
  if (ruler) {
    ruler.remove();
  }
  
  
  document.documentElement.removeAttribute('data-a11y-profile');
  
  
  const cssVars = [
    '--a11y-font-size',
    '--a11y-line-height',
    '--a11y-letter-spacing',
    '--a11y-word-spacing',
    '--a11y-font-family'
  ];
  
  cssVars.forEach(varName => {
    document.documentElement.style.removeProperty(varName);
  });

  if (document.body) {
    document.body.style.removeProperty('background');
    document.body.style.removeProperty('color');
  }

  removeAriaEnhancements();

  removeCognitiveReduction();
  
  document.querySelectorAll('[data-a11y-original-text]').forEach(el => {
    const originalText = el.getAttribute('data-a11y-original-text');
    if (originalText !== null && originalText.length > 0) {
      
      const currentText = el.textContent || '';
      if (currentText !== originalText) {
        el.textContent = originalText;
      }
      el.removeAttribute('data-a11y-original-text');
    }
    el.removeAttribute('data-a11y-simplified');
  });

  document.querySelectorAll('.a11y-key-sentence').forEach(el => {
    const parent = el.parentElement;
    if (parent && parent.hasAttribute('data-a11y-highlighted')) {
      
      const originalText = parent.getAttribute('data-a11y-original-text');
      if (originalText) {
        parent.textContent = originalText;
        parent.removeAttribute('data-a11y-original-text');
      }
      parent.removeAttribute('data-a11y-highlighted');
    }
    el.remove();
  });
  
  console.log('[A11y] All enhancements removed');
}

interface QuickSettings {
  readingMode?: boolean;
  colorBlindMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  readingRuler?: boolean;
  darkMode?: boolean;
}

let currentQuickSettings: QuickSettings = {};
let currentFontSizeMultiplier = 1.0;

function applyAccessibility(profileId: ProfileId, customSettings?: Partial<AccessibilityProfile>, quickSettings?: QuickSettings, fontSizeMultiplier?: number): void {
  console.log('[A11y] Applying profile:', profileId);
  
  if (quickSettings) {
    currentQuickSettings = quickSettings;
  }
  
  if (fontSizeMultiplier !== undefined) {
    currentFontSizeMultiplier = fontSizeMultiplier;
  }
  
  if (document.documentElement.classList.contains('a11y-enabled')) {
    console.log('[A11y] Removing old enhancements before applying new profile');
    removeEnhancements();
    
    setTimeout(() => {
      applyProfileInternal(profileId, customSettings);
    }, 50);
  } else {
    applyProfileInternal(profileId, customSettings);
  }
}

function applyProfileInternal(profileId: ProfileId, customSettings?: Partial<AccessibilityProfile>): void {
  let profile = getProfile(profileId);

  if (profileId === 'custom' && customSettings) {
    profile = { ...profile, ...customSettings };
    console.log('[A11y] Using custom settings:', customSettings);
    applyProfileWithSettings(profile, profileId);
  } else if (profileId === 'custom') {
    
    chrome.storage.sync.get(['customSettings'], (result) => {
      if (result.customSettings) {
        const mergedProfile = { ...profile, ...result.customSettings };
        console.log('[A11y] Loaded custom settings from storage');
        applyProfileWithSettings(mergedProfile, profileId);
      } else {
        applyProfileWithSettings(profile, profileId);
      }
    });
  } else {
    applyProfileWithSettings(profile, profileId);
  }
}

function applyProfileWithSettings(profile: AccessibilityProfile, profileId: ProfileId): void {
  try {
    console.log('[A11y] Profile settings:', profile);
    
    injectStyles();
    console.log('[A11y] Styles injected');
    
    // Apply font size multiplier
    const adjustedFontSize = profile.fontSize * currentFontSizeMultiplier;
    const adjustedProfile = { ...profile, fontSize: adjustedFontSize };
    
    applyProfile(adjustedProfile);
    console.log('[A11y] Profile applied to DOM');
    
    document.documentElement.setAttribute('data-a11y-profile', profileId);
    
    // Apply quick settings
    if (currentQuickSettings.readingMode) {
      document.documentElement.classList.add('a11y-reading-mode');
    }
    
    if (currentQuickSettings.darkMode) {
      document.documentElement.classList.add('a11y-dark-mode');
    }
    
    if (currentQuickSettings.colorBlindMode && currentQuickSettings.colorBlindMode !== 'none') {
      document.documentElement.classList.add(`a11y-color-blind-${currentQuickSettings.colorBlindMode}`);
    }
    
    if (currentQuickSettings.readingRuler) {
      createReadingRuler();
    }
    
    // Use requestIdleCallback for non-critical operations
    const applyNonCriticalFeatures = () => {
      try {
        if (profile.simplifyText) {
          console.log('[A11y] Simplifying text');
          simplifyPageText();
        }
        
        if (profile.enhanceAria) {
          console.log('[A11y] Enhancing ARIA');
          enhancePageAria();
        }
        
        if (profile.reduceCognitiveLoad) {
          console.log('[A11y] Reducing cognitive load');
          applyCognitiveReduction();
        }
      } catch (error: any) {
        console.error('[A11y] Error applying non-critical features:', error);
      }
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(applyNonCriticalFeatures, { timeout: 2000 });
    } else {
      setTimeout(applyNonCriticalFeatures, 100);
    }
    
    console.log('[A11y] Accessibility enabled successfully!');
  } catch (error: any) {
    console.error('[A11y] Error applying profile:', error);
    throw error;
  }
}

function createReadingRuler(): void {
  let ruler = document.getElementById('a11y-reading-ruler');
  if (!ruler) {
    if (!document.body) {
      // Wait for body to be available
      document.addEventListener('DOMContentLoaded', createReadingRuler, { once: true });
      return;
    }
    
    ruler = document.createElement('div');
    ruler.id = 'a11y-reading-ruler';
    ruler.className = 'a11y-reading-ruler';
    document.body.appendChild(ruler);
    
    let lastMouseY = 0;
    
    const updateRuler = (y: number) => {
      if (currentQuickSettings.readingRuler && ruler) {
        ruler.style.top = `${y}px`;
        ruler.classList.add('active');
        lastMouseY = y;
      }
    };
    
    const mouseMoveHandler = (e: MouseEvent) => {
      if (currentQuickSettings.readingRuler) {
        updateRuler(e.clientY);
      }
    };
    
    document.addEventListener('mousemove', mouseMoveHandler, { passive: true });
    
    const handleScroll = () => {
      if (currentQuickSettings.readingRuler && ruler && lastMouseY > 0) {
        const scrollY = window.scrollY || window.pageYOffset;
        ruler.style.top = `${lastMouseY + scrollY}px`;
        ruler.classList.add('active');
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Store handlers for cleanup
    (ruler as any)._scrollHandler = handleScroll;
    (ruler as any)._mouseMoveHandler = mouseMoveHandler;
  } else {
    ruler.classList.add('active');
  }
}

function updateQuickSettings(quickSettings: QuickSettings): void {
  currentQuickSettings = { ...currentQuickSettings, ...quickSettings };
  
  // Update reading mode
  if (quickSettings.readingMode !== undefined) {
    if (quickSettings.readingMode) {
      document.documentElement.classList.add('a11y-reading-mode');
    } else {
      document.documentElement.classList.remove('a11y-reading-mode');
    }
  }
  
  // Update dark mode
  if (quickSettings.darkMode !== undefined) {
    if (quickSettings.darkMode) {
      document.documentElement.classList.add('a11y-dark-mode');
    } else {
      document.documentElement.classList.remove('a11y-dark-mode');
    }
  }
  
  // Update color blind mode
  document.documentElement.classList.remove(
    'a11y-color-blind-protanopia',
    'a11y-color-blind-deuteranopia',
    'a11y-color-blind-tritanopia'
  );
  
  if (quickSettings.colorBlindMode && quickSettings.colorBlindMode !== 'none') {
    document.documentElement.classList.add(`a11y-color-blind-${quickSettings.colorBlindMode}`);
  }
  
  // Update reading ruler
  if (quickSettings.readingRuler !== undefined) {
    if (quickSettings.readingRuler) {
      createReadingRuler();
    } else {
      const ruler = document.getElementById('a11y-reading-ruler');
      if (ruler) {
        ruler.classList.remove('active');
        const scrollHandler = (ruler as any)._scrollHandler;
        const mouseMoveHandler = (ruler as any)._mouseMoveHandler;
        if (scrollHandler) {
          window.removeEventListener('scroll', scrollHandler);
        }
        if (mouseMoveHandler) {
          document.removeEventListener('mousemove', mouseMoveHandler);
        }
      }
    }
  }
}

function updateFontSize(multiplier: number): void {
  currentFontSizeMultiplier = multiplier;
  const root = document.documentElement;
  
  // Get the base profile font size from data attribute or default
  const profileId = root.getAttribute('data-a11y-profile') || 'lowVision';
  const profile = getProfile(profileId as ProfileId);
  const baseFontSize = profile.fontSize;
  
  // Apply multiplier
  root.style.setProperty('--a11y-font-size', `${baseFontSize * multiplier}rem`);
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (chrome.runtime.lastError) {
    console.log('[A11y] Extension context invalidated');
    return false;
  }
  
  console.log('[A11y] Received message:', message);
  
  if (message.action === 'enable') {
    console.log('[A11y] Enabling accessibility with profile:', message.profileId);
    
    try {
      applyAccessibility(
        message.profileId || 'lowVision', 
        message.customSettings,
        message.quickSettings,
        message.fontSizeMultiplier
      );
      sendResponse({ success: true });
    } catch (error: any) {
      console.error('[A11y] Error applying accessibility:', error);
      sendResponse({ success: false, error: error.message });
    }
  } else if (message.action === 'disable') {
    console.log('[A11y] Disabling accessibility');
    try {
      removeEnhancements();
      sendResponse({ success: true });
    } catch (error: any) {
      console.error('[A11y] Error removing accessibility:', error);
      sendResponse({ success: false, error: error.message });
    }
  } else if (message.action === 'getStatus') {
    const isEnabled = document.documentElement.classList.contains('a11y-enabled');
    sendResponse({ enabled: isEnabled });
  } else if (message.action === 'updateQuickSettings') {
    try {
      updateQuickSettings(message.quickSettings);
      sendResponse({ success: true });
    } catch (error: any) {
      console.error('[A11y] Error updating quick settings:', error);
      sendResponse({ success: false, error: error.message });
    }
  } else if (message.action === 'updateFontSize') {
    try {
      updateFontSize(message.fontSizeMultiplier);
      sendResponse({ success: true });
    } catch (error: any) {
      console.error('[A11y] Error updating font size:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  return true; 
});


console.log('[A11y] Content script loaded and ready');


function checkAndApplyOnLoad() {
  try {
    chrome.storage.sync.get(['enabled', 'profileId', 'quickSettings', 'fontSizeMultiplier'], (result) => {
      if (chrome.runtime.lastError) {
        console.log('[A11y] Extension context invalidated, skipping auto-apply');
        return;
      }
      
      if (result.enabled && result.profileId) {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            applyAccessibility(
              result.profileId,
              undefined,
              result.quickSettings,
              result.fontSizeMultiplier
            );
          });
        } else {
          applyAccessibility(
            result.profileId,
            undefined,
            result.quickSettings,
            result.fontSizeMultiplier
          );
        }
      }
    });
  } catch (error: any) {
    console.log('[A11y] Could not check storage:', error.message);
  }
}


checkAndApplyOnLoad();


document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    
    setTimeout(() => {
      try {
        checkAndApplyOnLoad();
      } catch (error) {
        
      }
    }, 100);
  }
});


let mutationTimeout: number | null = null;
let isProcessingMutation = false;
let mutationCount = 0;
const MAX_MUTATIONS_PER_SECOND = 10;

const observer = new MutationObserver((mutations) => {
  // Throttle mutations to prevent performance issues
  mutationCount++;
  if (mutationCount > MAX_MUTATIONS_PER_SECOND) {
    return;
  }
  
  if (isProcessingMutation || mutationTimeout !== null) {
    return;
  }
  
  // Reset mutation count after 1 second
  setTimeout(() => {
    mutationCount = 0;
  }, 1000);
  
  mutationTimeout = window.setTimeout(() => {
    mutationTimeout = null;
    isProcessingMutation = true;
    
    try {
      chrome.storage.sync.get(['enabled', 'profileId'], (result) => {
        if (chrome.runtime.lastError) {
          isProcessingMutation = false;
          return;
        }
        
        if (!result.enabled || !result.profileId) {
          isProcessingMutation = false;
          return;
        }
        
        if (!document.documentElement.classList.contains('a11y-enabled')) {
          isProcessingMutation = false;
          return;
        }
        
        try {
          const profile = getProfile(result.profileId);
          
          // Use requestIdleCallback for better performance
          const processMutations = () => {
            try {
              if (profile.enhanceAria) {
                enhancePageAria();
              }
              if (profile.simplifyText) {
                simplifyPageText();
              }
            } catch (error: any) {
              console.error('[A11y] Error processing mutations:', error);
            } finally {
              isProcessingMutation = false;
            }
          };
          
          if ('requestIdleCallback' in window) {
            requestIdleCallback(processMutations, { timeout: 1000 });
          } else {
            setTimeout(processMutations, 100);
          }
        } catch (error: any) {
          console.error('[A11y] Error getting profile:', error);
          isProcessingMutation = false;
        }
      });
    } catch (error: any) {
      console.error('[A11y] Error in mutation observer:', error);
      isProcessingMutation = false;
    }
  }, 500); // Increased debounce time for better performance
});


if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
} else {
  
  document.addEventListener('DOMContentLoaded', () => {
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  });
}

