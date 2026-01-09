import { getProfile, applyProfile, type ProfileId } from '../utils/profiles';
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
  `;
  
  document.head.appendChild(style);
}


function removeEnhancements(): void {
  console.log('[A11y] Removing all enhancements');
  
  
  document.documentElement.classList.remove(
    'a11y-enabled',
    'a11y-high-contrast',
    'a11y-very-high-contrast',
    'a11y-no-bg-images',
    'a11y-no-animations'
  );
  
  
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

function applyAccessibility(profileId: ProfileId, customSettings?: Partial<AccessibilityProfile>): void {
  console.log('[A11y] Applying profile:', profileId);
  
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
  console.log('[A11y] Profile settings:', profile);
  
 
  injectStyles();
  console.log('[A11y] Styles injected');
  
  
  applyProfile(profile);
  console.log('[A11y] Profile applied to DOM');
  
  
  document.documentElement.setAttribute('data-a11y-profile', profileId);
  
  
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
  
  console.log('[A11y] Accessibility enabled successfully!');
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
      applyAccessibility(message.profileId || 'lowVision', message.customSettings);
      sendResponse({ success: true });
    } catch (error) {
      console.error('[A11y] Error applying accessibility:', error);
      sendResponse({ success: false, error: error.message });
    }
  } else if (message.action === 'disable') {
    console.log('[A11y] Disabling accessibility');
    try {
      removeEnhancements();
      sendResponse({ success: true });
    } catch (error) {
      console.error('[A11y] Error removing accessibility:', error);
      sendResponse({ success: false, error: error.message });
    }
  } else if (message.action === 'getStatus') {
    const isEnabled = document.documentElement.classList.contains('a11y-enabled');
    sendResponse({ enabled: isEnabled });
  }
  
  return true; 
});


console.log('[A11y] Content script loaded and ready');


function checkAndApplyOnLoad() {
  try {
    chrome.storage.sync.get(['enabled', 'profileId'], (result) => {
      if (chrome.runtime.lastError) {
        
        console.log('[A11y] Extension context invalidated, skipping auto-apply');
        return;
      }
      
      if (result.enabled && result.profileId) {
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            applyAccessibility(result.profileId);
          });
        } else {
          applyAccessibility(result.profileId);
        }
      }
    });
  } catch (error) {
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

const observer = new MutationObserver(() => {
  
  if (isProcessingMutation || mutationTimeout !== null) {
    return;
  }
  
  
  mutationTimeout = window.setTimeout(() => {
    mutationTimeout = null;
    isProcessingMutation = true;
    
    chrome.storage.sync.get(['enabled', 'profileId'], (result) => {
      if (!result.enabled || !result.profileId) {
        isProcessingMutation = false;
        return;
      }
      
      
      if (!document.documentElement.classList.contains('a11y-enabled')) {
        isProcessingMutation = false;
        return;
      }
      
      const profile = getProfile(result.profileId);
      
      
      if (profile.enhanceAria) {
        enhancePageAria();
      }
      if (profile.simplifyText) {
        simplifyPageText();
      }
      
      isProcessingMutation = false;
    });
  }, 300); 
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

