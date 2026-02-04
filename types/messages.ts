/**
 * Shared message and storage types for the extension.
 * Keeps background, content, and popup in sync and type-safe.
 */

import type { ProfileId } from '../utils/profiles';

/** Allowed profile IDs (validate in background) */
export const VALID_PROFILE_IDS: ProfileId[] = ['lowVision', 'dyslexia', 'cognitive', 'custom'];

/** Supported translation language codes (allowlist for security) */
export const VALID_TARGET_LANGS = new Set([
  'auto', 'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi',
  'nl', 'pl', 'tr', 'sv', 'da', 'fi', 'no', 'uk', 'cs', 'ro', 'hu', 'el', 'he', 'th', 'vi'
]);

/** Chrome storage keys */
export const STORAGE_KEYS = {
  ENABLED: 'enabled',
  PROFILE_ID: 'profileId',
  QUICK_SETTINGS: 'quickSettings',
  FONT_SIZE_MULTIPLIER: 'fontSizeMultiplier',
  CUSTOM_SETTINGS: 'customSettings',
  TARGET_LANGUAGE: 'targetLanguage',
  USAGE_COUNT: 'usageCount',
} as const;

/** Quick settings shape (sync with popup and content) */
export interface QuickSettings {
  readingMode?: boolean;
  colorBlindMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  readingRuler?: boolean;
  darkMode?: boolean;
  translateEnabled?: boolean;
  targetLanguage?: string;
}

/** Message: toggle accessibility */
export interface MessageToggle {
  action: 'toggle';
  profileId?: ProfileId;
  quickSettings?: QuickSettings;
  fontSizeMultiplier?: number;
}

/** Message: set profile */
export interface MessageSetProfile {
  action: 'setProfile';
  profileId: ProfileId;
  customSettings?: Record<string, unknown>;
}

/** Message: get state */
export interface MessageGetState {
  action: 'getState';
}

/** Message: translate (single or batch) */
export interface MessageTranslate {
  action: 'translate';
  text?: string;
  texts?: string[];
  targetLang: string;
}

/** Message: enable (from popup to content) */
export interface MessageEnable {
  action: 'enable';
  profileId?: ProfileId;
  customSettings?: Record<string, unknown>;
  quickSettings?: QuickSettings;
  fontSizeMultiplier?: number;
}

/** Message: disable */
export interface MessageDisable {
  action: 'disable';
}

/** Message: get status (content → popup) */
export interface MessageGetStatus {
  action: 'getStatus';
}

/** Message: update quick settings */
export interface MessageUpdateQuickSettings {
  action: 'updateQuickSettings';
  quickSettings: QuickSettings;
}

/** Message: update font size */
export interface MessageUpdateFontSize {
  action: 'updateFontSize';
  fontSizeMultiplier: number;
}

export type ExtensionMessage =
  | MessageToggle
  | MessageSetProfile
  | MessageGetState
  | MessageTranslate
  | MessageEnable
  | MessageDisable
  | MessageGetStatus
  | MessageUpdateQuickSettings
  | MessageUpdateFontSize;

export function isValidProfileId(id: string): id is ProfileId {
  return VALID_PROFILE_IDS.includes(id as ProfileId);
}

export function isValidTargetLang(lang: string): boolean {
  return typeof lang === 'string' && VALID_TARGET_LANGS.has(lang);
}
