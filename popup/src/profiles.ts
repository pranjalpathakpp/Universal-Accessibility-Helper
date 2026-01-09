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
    fontSize: 1.1,
    contrast: 'high',
    lineHeight: 1.7,
    letterSpacing: 0.03,
    wordSpacing: 0.08,
    removeBackgroundImages: true,
    disableAnimations: true,
    simplifyText: true,
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

