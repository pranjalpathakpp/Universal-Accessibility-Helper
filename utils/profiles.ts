/**
 * Accessibility Profiles
 * Each profile defines specific rules for different accessibility needs
 */

export type ProfileId = 'lowVision' | 'dyslexia' | 'cognitive' | 'custom';

export interface AccessibilityProfile {
  id: ProfileId;
  name: string;
  description: string;
  fontSize: number;
  contrast: 'normal' | 'high' | 'veryHigh';
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  removeBackgroundImages: boolean;
  disableAnimations: boolean;
  simplifyText: boolean;
  enhanceAria: boolean;
  reduceCognitiveLoad: boolean;
  fontFamily: string;
}

export const PROFILES: Record<ProfileId, AccessibilityProfile> = {
  lowVision: {
    id: 'lowVision',
    name: 'Low Vision',
    description: 'Larger fonts, high contrast, clear spacing',
    fontSize: 1.3,
    contrast: 'veryHigh',
    lineHeight: 1.8,
    letterSpacing: 0.05,
    wordSpacing: 0.1,
    removeBackgroundImages: true,
    disableAnimations: true,
    simplifyText: false,
    enhanceAria: true,
    reduceCognitiveLoad: true,
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  dyslexia: {
    id: 'dyslexia',
    name: 'Dyslexia',
    description: 'Dyslexia-friendly font, increased spacing',
    fontSize: 1.2,
    contrast: 'high',
    lineHeight: 1.6,
    letterSpacing: 0.1,
    wordSpacing: 0.15,
    removeBackgroundImages: false,
    disableAnimations: true,
    simplifyText: true,
    enhanceAria: true,
    reduceCognitiveLoad: false,
    fontFamily: 'OpenDyslexic, Arial, sans-serif'
  },
  cognitive: {
    id: 'cognitive',
    name: 'Cognitive Load',
    description: 'Simplified text, reduced distractions',
    fontSize: 1.15,
    contrast: 'high',
    lineHeight: 1.6,
    letterSpacing: 0.02,
    wordSpacing: 0.05,
    removeBackgroundImages: false, // Don't remove - can break layouts
    disableAnimations: true,
    simplifyText: false, // Disable text simplification - it breaks layout
    enhanceAria: true,
    reduceCognitiveLoad: true,
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    description: 'Your personalized settings',
    fontSize: 1.0,
    contrast: 'normal',
    lineHeight: 1.5,
    letterSpacing: 0,
    wordSpacing: 0,
    removeBackgroundImages: false,
    disableAnimations: false,
    simplifyText: false,
    enhanceAria: false,
    reduceCognitiveLoad: false,
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }
};

export function getProfile(id: ProfileId): AccessibilityProfile {
  return PROFILES[id];
}

export function applyProfile(profile: AccessibilityProfile): void {
  // This will be called by the content script
  const root = document.documentElement;
  
  // Remove old contrast classes first
  root.classList.remove('a11y-high-contrast', 'a11y-very-high-contrast');
  
  // Font settings
  root.style.setProperty('--a11y-font-size', `${profile.fontSize}rem`);
  root.style.setProperty('--a11y-line-height', `${profile.lineHeight}`);
  root.style.setProperty('--a11y-letter-spacing', `${profile.letterSpacing}em`);
  root.style.setProperty('--a11y-word-spacing', `${profile.wordSpacing}em`);
  root.style.setProperty('--a11y-font-family', profile.fontFamily);
  
  // Contrast - add appropriate class
  if (profile.contrast === 'high') {
    root.classList.add('a11y-high-contrast');
  } else if (profile.contrast === 'veryHigh') {
    root.classList.add('a11y-very-high-contrast');
  }
  
  // Remove old classes first, then add new ones
  root.classList.remove('a11y-no-bg-images', 'a11y-no-animations');
  
  // Other settings
  if (profile.removeBackgroundImages) {
    root.classList.add('a11y-no-bg-images');
  }
  
  if (profile.disableAnimations) {
    root.classList.add('a11y-no-animations');
  }
  
  root.classList.add('a11y-enabled');
}

