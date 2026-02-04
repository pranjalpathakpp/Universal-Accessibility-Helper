import { getProfile, applyProfile, type ProfileId, type AccessibilityProfile } from '../utils/profiles';
import { simplifyPageText } from '../utils/textSimplifier';
import { enhancePageAria, removeAriaEnhancements } from '../utils/ariaEnhancer';
import { applyCognitiveReduction, removeCognitiveReduction } from '../utils/cognitiveReducer';
import { translatePage, restoreOriginalText, setTargetLanguage, loadSettings as loadTranslateSettings } from '../utils/translator';
import { STORAGE_KEYS, isValidProfileId, isValidTargetLang } from '../types/messages';


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

    /* Reading Mode - Better implementation that doesn't break the page */
    .a11y-reading-mode body {
      max-width: 800px !important;
      margin: 0 auto !important;
      padding: 20px !important;
    }

    /* Hide navigation and sidebars, but keep main content */
    .a11y-reading-mode header:not([role="banner"]):not(main header):not(article header),
    .a11y-reading-mode nav:not([role="navigation"]):not(main nav):not(article nav),
    .a11y-reading-mode aside:not(main aside):not(article aside),
    .a11y-reading-mode footer:not([role="contentinfo"]):not(main footer):not(article footer),
    .a11y-reading-mode .sidebar:not(main .sidebar):not(article .sidebar),
    .a11y-reading-mode .navigation:not(main .navigation):not(article .navigation),
    .a11y-reading-mode .menu:not(main .menu):not(article .menu),
    .a11y-reading-mode .advertisement:not(main .advertisement):not(article .advertisement),
    .a11y-reading-mode [class*="ad-"]:not(main [class*="ad-"]):not(article [class*="ad-"]),
    .a11y-reading-mode [class*="sidebar"]:not(main [class*="sidebar"]):not(article [class*="sidebar"]),
    .a11y-reading-mode [class*="nav"]:not(nav):not(main [class*="nav"]):not(article [class*="nav"]) {
      display: none !important;
    }

    /* Ensure main content is visible and properly styled */
    .a11y-reading-mode main,
    .a11y-reading-mode article,
    .a11y-reading-mode [role="main"],
    .a11y-reading-mode [role="article"],
    .a11y-reading-mode .content:not(header .content):not(nav .content):not(footer .content),
    .a11y-reading-mode .post:not(header .post):not(nav .post):not(footer .post),
    .a11y-reading-mode .entry:not(header .entry):not(nav .entry):not(footer .entry) {
      max-width: 100% !important;
      padding: 40px 20px !important;
      background: transparent !important;
      display: block !important;
    }

    /* Fallback: if no main/article found, show body content */
    .a11y-reading-mode body > *:not(header):not(nav):not(aside):not(footer):not(script):not(style) {
      display: block !important;
    }

    /* Reading Ruler - Elegant purple that works on both light and dark backgrounds */
    .a11y-reading-ruler {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, transparent 0%, #9d4edd 20%, #7b2cbf 50%, #9d4edd 80%, transparent 100%) !important;
      pointer-events: none;
      z-index: 999999;
      box-shadow: 0 0 20px rgba(157, 78, 221, 0.6), 0 0 10px rgba(123, 44, 191, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2);
      display: none;
      opacity: 0.9;
      transition: opacity 0.2s ease;
    }

    .a11y-reading-ruler.active {
      display: block;
      opacity: 1;
    }

    /* Ensure ruler is visible in dark mode with enhanced glow */
    .a11y-dark-mode .a11y-reading-ruler {
      background: linear-gradient(90deg, transparent 0%, #c77dff 20%, #9d4edd 50%, #c77dff 80%, transparent 100%) !important;
      box-shadow: 0 0 25px rgba(199, 125, 255, 0.8), 0 0 15px rgba(157, 78, 221, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.3);
    }

    /* Color Blind Filters - Applied before dark mode */
    .a11y-color-blind-protanopia:not(.a11y-dark-mode) {
      filter: url(#protanopia);
    }

    .a11y-color-blind-deuteranopia:not(.a11y-dark-mode) {
      filter: url(#deuteranopia);
    }

    .a11y-color-blind-tritanopia:not(.a11y-dark-mode) {
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

    /* Color Blind Filters for Dark Mode - Apply after dark mode inversion */
    .a11y-dark-mode.a11y-color-blind-protanopia {
      filter: invert(1) hue-rotate(180deg) url(#protanopia);
    }

    .a11y-dark-mode.a11y-color-blind-deuteranopia {
      filter: invert(1) hue-rotate(180deg) url(#deuteranopia);
    }

    .a11y-dark-mode.a11y-color-blind-tritanopia {
      filter: invert(1) hue-rotate(180deg) url(#tritanopia);
    }

    .a11y-dark-mode.a11y-color-blind-protanopia img,
    .a11y-dark-mode.a11y-color-blind-protanopia video,
    .a11y-dark-mode.a11y-color-blind-protanopia iframe,
    .a11y-dark-mode.a11y-color-blind-protanopia canvas,
    .a11y-dark-mode.a11y-color-blind-deuteranopia img,
    .a11y-dark-mode.a11y-color-blind-deuteranopia video,
    .a11y-dark-mode.a11y-color-blind-deuteranopia iframe,
    .a11y-dark-mode.a11y-color-blind-deuteranopia canvas,
    .a11y-dark-mode.a11y-color-blind-tritanopia img,
    .a11y-dark-mode.a11y-color-blind-tritanopia video,
    .a11y-dark-mode.a11y-color-blind-tritanopia iframe,
    .a11y-dark-mode.a11y-color-blind-tritanopia canvas {
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
  // Clean up reading ruler handlers first
  if (rulerMouseMoveHandler) {
    document.removeEventListener('mousemove', rulerMouseMoveHandler);
    rulerMouseMoveHandler = null;
  }
  if (rulerScrollHandler) {
    window.removeEventListener('scroll', rulerScrollHandler);
    rulerScrollHandler = null;
  }
  
  // Remove all reading rulers (prevent duplicates)
  document.querySelectorAll('#a11y-reading-ruler').forEach(ruler => {
    ruler.remove();
  });
  
  // Remove reading mode class first to restore hidden elements
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
  
  document.documentElement.removeAttribute('data-a11y-profile');
  
  // Reset mouse position
  lastMouseY = 0;
  
  
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
  
  // Restore original text if translated
  restoreOriginalText();
  
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
}

interface QuickSettings {
  readingMode?: boolean;
  colorBlindMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  readingRuler?: boolean;
  darkMode?: boolean;
  translateEnabled?: boolean;
  targetLanguage?: string;
}

let currentQuickSettings: QuickSettings = {};
let currentFontSizeMultiplier = 1.0;

let profileSwitchTimeout: number | null = null;
let isSwitchingProfile = false;
let pendingProfileSwitch: { profileId: ProfileId; customSettings?: Partial<AccessibilityProfile>; quickSettings?: QuickSettings; fontSizeMultiplier?: number } | null = null;

// Reading ruler handlers
let rulerMouseMoveHandler: ((e: MouseEvent) => void) | null = null;
let rulerScrollHandler: (() => void) | null = null;
let lastMouseY = 0;

function applyAccessibility(profileId: ProfileId, customSettings?: Partial<AccessibilityProfile>, quickSettings?: QuickSettings, fontSizeMultiplier?: number): void {
  // Store the latest request
  pendingProfileSwitch = { profileId, customSettings, quickSettings, fontSizeMultiplier };
  
  // Clear any pending profile switches
  if (profileSwitchTimeout !== null) {
    clearTimeout(profileSwitchTimeout);
    profileSwitchTimeout = null;
  }
  
  // If already switching, queue this request
  if (isSwitchingProfile) {
    return; // The latest request is already stored in pendingProfileSwitch
  }
  
  if (quickSettings) {
    currentQuickSettings = quickSettings;
  }
  
  if (fontSizeMultiplier !== undefined) {
    currentFontSizeMultiplier = fontSizeMultiplier;
  }
  
  isSwitchingProfile = true;
  
  if (document.documentElement.classList.contains('a11y-enabled')) {
    try {
      removeEnhancements();
    } catch {
      // Continue with re-apply
    }
    
    // Wait for DOM to stabilize before applying new profile
    // Use multiple requestAnimationFrame calls to ensure DOM is ready
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Check if there's a newer pending request
        if (pendingProfileSwitch) {
          const latest = pendingProfileSwitch;
          pendingProfileSwitch = null;
          
          if (latest.quickSettings) {
            currentQuickSettings = latest.quickSettings;
          }
          if (latest.fontSizeMultiplier !== undefined) {
            currentFontSizeMultiplier = latest.fontSizeMultiplier;
          }
          
          profileSwitchTimeout = window.setTimeout(() => {
            try {
              applyProfileInternal(latest.profileId, latest.customSettings);
            } catch {
              // Already logged or non-fatal
            } finally {
              isSwitchingProfile = false;
              profileSwitchTimeout = null;
              
              // Process any new pending request after a short delay
              if (pendingProfileSwitch) {
                const next = pendingProfileSwitch;
                pendingProfileSwitch = null;
                setTimeout(() => {
                  applyAccessibility(next.profileId, next.customSettings, next.quickSettings, next.fontSizeMultiplier);
                }, 150);
              }
            }
          }, 300);
        } else {
          profileSwitchTimeout = window.setTimeout(() => {
            try {
              applyProfileInternal(profileId, customSettings);
            } catch {
              // Already logged or non-fatal
            } finally {
              isSwitchingProfile = false;
              profileSwitchTimeout = null;
              pendingProfileSwitch = null;
            }
          }, 300);
        }
      });
    });
  } else {
    try {
      applyProfileInternal(profileId, customSettings);
    } catch {
      // Non-fatal
    } finally {
      isSwitchingProfile = false;
      pendingProfileSwitch = null;
    }
  }
}

function applyProfileInternal(profileId: ProfileId, customSettings?: Partial<AccessibilityProfile>): void {
  let profile = getProfile(profileId);

  if (profileId === 'custom' && customSettings) {
    profile = { ...profile, ...customSettings };
    applyProfileWithSettings(profile, profileId);
  } else if (profileId === 'custom') {
    chrome.storage.sync.get([STORAGE_KEYS.CUSTOM_SETTINGS], (result: { [key: string]: unknown }) => {
      if (result[STORAGE_KEYS.CUSTOM_SETTINGS]) {
        const mergedProfile = { ...profile, ...(result[STORAGE_KEYS.CUSTOM_SETTINGS] as object) };
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
    injectStyles();
    const adjustedFontSize = profile.fontSize * currentFontSizeMultiplier;
    const adjustedProfile = { ...profile, fontSize: adjustedFontSize };
    
    applyProfile(adjustedProfile);
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
    
    // Apply translation if enabled
    if (currentQuickSettings.translateEnabled && currentQuickSettings.targetLanguage && isValidTargetLang(currentQuickSettings.targetLanguage) && currentQuickSettings.targetLanguage !== 'auto') {
      loadTranslateSettings().then(() => {
        setTargetLanguage(currentQuickSettings.targetLanguage || 'en');
        setTimeout(() => {
          translatePage(currentQuickSettings.targetLanguage || 'en').catch(() => {});
        }, 1000);
      });
    }

    const applyNonCriticalFeatures = () => {
      try {
        if (profile.simplifyText) simplifyPageText();
        if (profile.enhanceAria) enhancePageAria();
        if (profile.reduceCognitiveLoad) applyCognitiveReduction();
      } catch {
        // Non-critical
      }
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(applyNonCriticalFeatures, { timeout: 2000 });
    } else {
      setTimeout(applyNonCriticalFeatures, 100);
    }
  } catch (err) {
    throw err;
  }
}

function createReadingRuler(): void {
  // Remove any existing ruler first to prevent duplicates
  const existingRuler = document.getElementById('a11y-reading-ruler');
  if (existingRuler) {
    existingRuler.remove();
  }
  
  // Clean up existing handlers
  if (rulerMouseMoveHandler) {
    document.removeEventListener('mousemove', rulerMouseMoveHandler);
    rulerMouseMoveHandler = null;
  }
  if (rulerScrollHandler) {
    window.removeEventListener('scroll', rulerScrollHandler);
    rulerScrollHandler = null;
  }
  
  if (!document.body) {
    // Wait for body to be available
    document.addEventListener('DOMContentLoaded', createReadingRuler, { once: true });
    return;
  }
  
  const ruler = document.createElement('div');
  ruler.id = 'a11y-reading-ruler';
  ruler.className = 'a11y-reading-ruler';
  document.body.appendChild(ruler);
  
  const updateRuler = (y: number) => {
    if (currentQuickSettings.readingRuler && ruler) {
      ruler.style.top = `${y}px`;
      ruler.classList.add('active');
      lastMouseY = y;
    }
  };
  
  rulerMouseMoveHandler = (e: MouseEvent) => {
    if (currentQuickSettings.readingRuler) {
      updateRuler(e.clientY);
    }
  };
  
  rulerScrollHandler = () => {
    if (currentQuickSettings.readingRuler && ruler && lastMouseY > 0) {
      const scrollY = window.scrollY || window.pageYOffset;
      ruler.style.top = `${lastMouseY + scrollY}px`;
      ruler.classList.add('active');
    }
  };
  
  document.addEventListener('mousemove', rulerMouseMoveHandler, { passive: true });
  window.addEventListener('scroll', rulerScrollHandler, { passive: true });
  
  ruler.classList.add('active');
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
      // Remove all rulers and clean up handlers
      document.querySelectorAll('#a11y-reading-ruler').forEach(ruler => {
        ruler.remove();
      });
      if (rulerMouseMoveHandler) {
        document.removeEventListener('mousemove', rulerMouseMoveHandler);
        rulerMouseMoveHandler = null;
      }
      if (rulerScrollHandler) {
        window.removeEventListener('scroll', rulerScrollHandler);
        rulerScrollHandler = null;
      }
      lastMouseY = 0;
    }
  }

  if (quickSettings.translateEnabled !== undefined || quickSettings.targetLanguage !== undefined) {
    if (quickSettings.translateEnabled && quickSettings.targetLanguage && quickSettings.targetLanguage !== 'auto' && isValidTargetLang(quickSettings.targetLanguage)) {
      if (document.querySelectorAll('[data-a11y-translated="true"]').length > 0) {
        restoreOriginalText();
      }
      loadTranslateSettings().then(() => {
        setTargetLanguage(quickSettings.targetLanguage || 'en');
        setTimeout(() => {
          translatePage(quickSettings.targetLanguage || 'en').catch(() => {});
        }, 300);
      }).catch(() => {});
    } else if (quickSettings.translateEnabled === false) {
      restoreOriginalText();
    } else if (quickSettings.targetLanguage && quickSettings.targetLanguage !== 'auto' && quickSettings.translateEnabled && isValidTargetLang(quickSettings.targetLanguage)) {
      restoreOriginalText();
      loadTranslateSettings().then(() => {
        setTargetLanguage(quickSettings.targetLanguage || 'en');
        setTimeout(() => {
          translatePage(quickSettings.targetLanguage || 'en').catch(() => {});
        }, 300);
      });
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


chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  const msg = (message || {}) as { action: string; [key: string]: unknown };
  const safeSend = (response: unknown) => {
    try {
      sendResponse(response);
    } catch {
      // Channel may be closed
    }
  };

  if (msg.action === 'enable') {
    const profileId = isValidProfileId((msg.profileId as string) || '') ? (msg.profileId as ProfileId) : 'lowVision';
    const fontSize = typeof msg.fontSizeMultiplier === 'number' && msg.fontSizeMultiplier >= 0.5 && msg.fontSizeMultiplier <= 3
      ? msg.fontSizeMultiplier
      : undefined;
    try {
      applyAccessibility(profileId, msg.customSettings as Partial<AccessibilityProfile> | undefined, msg.quickSettings as QuickSettings | undefined, fontSize);
      safeSend({ success: true });
    } catch (err) {
      safeSend({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
    }
    return true;
  }

  if (msg.action === 'disable') {
    try {
      removeEnhancements();
      safeSend({ success: true });
    } catch (err) {
      safeSend({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
    }
    return true;
  }

  if (msg.action === 'getStatus') {
    safeSend({ enabled: document.documentElement.classList.contains('a11y-enabled') });
    return true;
  }

  if (msg.action === 'updateQuickSettings') {
    try {
      updateQuickSettings((msg.quickSettings as QuickSettings) || {});
      safeSend({ success: true });
    } catch (err) {
      safeSend({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
    }
    return true;
  }

  if (msg.action === 'translate') {
    const text = typeof msg.text === 'string' ? msg.text : '';
    const targetLang = typeof msg.targetLang === 'string' ? msg.targetLang : '';
    if (!text || !targetLang || targetLang === 'auto' || !isValidTargetLang(targetLang)) {
      safeSend({ translatedText: text });
      return true;
    }
    chrome.runtime.sendMessage(
      { action: 'translate', text, targetLang },
      (response: { translatedText?: string }) => {
        if (chrome.runtime.lastError) safeSend({ translatedText: text });
        else safeSend({ translatedText: response?.translatedText ?? text });
      }
    );
    return true;
  }

  if (msg.action === 'updateFontSize') {
    const mult = msg.fontSizeMultiplier;
    if (typeof mult === 'number' && mult >= 0.5 && mult <= 3) {
      try {
        updateFontSize(mult);
        safeSend({ success: true });
      } catch (err) {
        safeSend({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    } else {
      safeSend({ success: true });
    }
    return true;
  }

  return true;
});


function checkAndApplyOnLoad() {
  try {
    chrome.storage.sync.get(
      [STORAGE_KEYS.ENABLED, STORAGE_KEYS.PROFILE_ID, STORAGE_KEYS.QUICK_SETTINGS, STORAGE_KEYS.FONT_SIZE_MULTIPLIER],
      (result: { [key: string]: unknown }) => {
        if (chrome.runtime.lastError) return;
        if (!result[STORAGE_KEYS.ENABLED] || !result[STORAGE_KEYS.PROFILE_ID]) return;
        const profileId = isValidProfileId(String(result[STORAGE_KEYS.PROFILE_ID]))
          ? (result[STORAGE_KEYS.PROFILE_ID] as ProfileId)
          : 'lowVision';
        const quickSettings = (result[STORAGE_KEYS.QUICK_SETTINGS] as QuickSettings) || {};
        const fontSizeMultiplier = typeof result[STORAGE_KEYS.FONT_SIZE_MULTIPLIER] === 'number'
          ? result[STORAGE_KEYS.FONT_SIZE_MULTIPLIER] as number
          : undefined;
        const apply = () => {
          applyAccessibility(profileId, undefined, quickSettings, fontSizeMultiplier);
        };
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', apply);
        } else {
          apply();
        }
      }
    );
  } catch {
    // Storage or context unavailable
  }
}


checkAndApplyOnLoad();


document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    setTimeout(() => {
      try {
        checkAndApplyOnLoad();
      } catch {
        // Ignore
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
          chrome.storage.sync.get([STORAGE_KEYS.ENABLED, STORAGE_KEYS.PROFILE_ID], (result: { [key: string]: unknown }) => {
            if (chrome.runtime.lastError) {
              isProcessingMutation = false;
              return;
            }
            if (!result[STORAGE_KEYS.ENABLED] || !result[STORAGE_KEYS.PROFILE_ID]) {
              isProcessingMutation = false;
              return;
            }
            if (!document.documentElement.classList.contains('a11y-enabled')) {
              isProcessingMutation = false;
              return;
            }
            const profileId = isValidProfileId(String(result[STORAGE_KEYS.PROFILE_ID])) ? result[STORAGE_KEYS.PROFILE_ID] : 'lowVision';
            try {
              const profile = getProfile(profileId as ProfileId);
          
          // Use requestIdleCallback for better performance
          const processMutations = () => {
            try {
              if (profile.enhanceAria) {
                enhancePageAria();
              }
              if (profile.simplifyText) {
                simplifyPageText();
              }
            } catch {
              // Non-critical
            } finally {
              isProcessingMutation = false;
            }
          };
          
          if ('requestIdleCallback' in window) {
            requestIdleCallback(processMutations, { timeout: 1000 });
          } else {
            setTimeout(processMutations, 100);
          }
        } catch {
          isProcessingMutation = false;
        }
      });
    } catch {
      isProcessingMutation = false;
    }
  }, 500);
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

