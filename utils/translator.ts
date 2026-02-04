// Language translation utility using Google Translate public endpoint (no API key).
// Requests are proxied via the background script to avoid CORS.

import { STORAGE_KEYS, isValidTargetLang } from '../types/messages';

/** Max elements to translate per page (avoids rate limits and UI freeze) */
export const MAX_TRANSLATE_ELEMENTS = 100;

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'auto', name: 'Auto-detect', nativeName: 'Auto-detect' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

let targetLanguage: string = 'en';

export function setTargetLanguage(lang: string): void {
  if (isValidTargetLang(lang)) {
    targetLanguage = lang;
    if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
      chrome.storage.sync.set({ [STORAGE_KEYS.TARGET_LANGUAGE]: lang });
    }
  }
}

export function getTargetLanguage(): string {
  return targetLanguage;
}

export async function loadSettings(): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.TARGET_LANGUAGE], (result: { [key: string]: string }) => {
      if (result[STORAGE_KEYS.TARGET_LANGUAGE] && isValidTargetLang(result[STORAGE_KEYS.TARGET_LANGUAGE])) {
        targetLanguage = result[STORAGE_KEYS.TARGET_LANGUAGE];
      }
      resolve();
    });
  });
}

export async function translateText(text: string, targetLang: string = targetLanguage): Promise<string> {
  if (!text || text.trim().length === 0) return text;
  if (targetLang === 'auto' || !targetLang || !isValidTargetLang(targetLang)) return text;

  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
      resolve(text);
      return;
    }
    chrome.runtime.sendMessage(
      { action: 'translate', text, targetLang },
      (response: { translatedText?: string; error?: string }) => {
        if (chrome.runtime.lastError) {
          resolve(text);
          return;
        }
        if (response?.translatedText) resolve(response.translatedText);
        else resolve(text);
      }
    );
  });
}

export async function translateTexts(texts: string[], targetLang: string = targetLanguage): Promise<string[]> {
  if (!texts?.length) return texts;
  if (targetLang === 'auto' || !targetLang || !isValidTargetLang(targetLang)) return texts;

  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
      resolve(texts);
      return;
    }
    chrome.runtime.sendMessage(
      { action: 'translate', texts, targetLang },
      (response: { translatedTexts?: string[]; error?: string }) => {
        if (chrome.runtime.lastError) {
          resolve(texts);
          return;
        }
        if (response?.translatedTexts && Array.isArray(response.translatedTexts)) {
          const valid = response.translatedTexts.map((r, i) =>
            (r && r.trim() !== '') ? r : (texts[i] ?? '')
          );
          resolve(valid);
        } else {
          resolve(texts);
        }
      }
    );
  });
}

export async function translatePage(targetLang: string): Promise<void> {
  if (targetLang === 'auto' || !targetLang || !isValidTargetLang(targetLang)) return;

  const allSelectors = [
    // Priority: main content areas
    'main p', 'main h1', 'main h2', 'main h3', 'main h4', 'main h5', 'main h6',
    'article p', 'article h1', 'article h2', 'article h3', 'article h4', 'article h5', 'article h6',
    '[role="main"] p', '[role="main"] h1', '[role="main"] h2', '[role="main"] h3', '[role="main"] h4',
    '.content p', '.content h1', '.content h2', '.content h3',
    // Wikipedia-specific
    '#content p', '#content h1', '#content h2', '#content h3', '#content h4',
    '#mw-content-text p', '#mw-content-text h1', '#mw-content-text h2', '#mw-content-text h3',
    '.mw-parser-output p', '.mw-parser-output h1', '.mw-parser-output h2', '.mw-parser-output h3',
    // General text elements (broader search)
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th', 'dd', 'dt',
    // Divs with text content
    'div[class*="content"]', 'div[class*="text"]', 'div[class*="article"]',
  ];

  let textElements = document.querySelectorAll(allSelectors.join(', '));
  const elementsToTranslate: Array<{ element: Element; originalText: string }> = [];
  let skippedCount = 0;
  const skippedReasons: { [key: string]: number } = {};

  // Collect elements with text
  textElements.forEach((element) => {
    // Skip if already translated
    if (element.hasAttribute('data-a11y-translated')) {
      skippedCount++;
      skippedReasons['already-translated'] = (skippedReasons['already-translated'] || 0) + 1;
      return;
    }

    // Skip if has original text attribute (means it was translated before)
    if (element.hasAttribute('data-a11y-original-text')) {
      skippedCount++;
      skippedReasons['has-original-text'] = (skippedReasons['has-original-text'] || 0) + 1;
      return;
    }

    // Skip reading ruler
    if (element.classList.contains('a11y-reading-ruler') || element.id === 'a11y-reading-ruler') {
      return;
    }

    // Skip if in script, style, or code blocks (but be less restrictive with nav/header/footer)
    const excludedParent = element.closest('script, style, noscript, code, pre, svg, iframe');
    if (excludedParent) {
      skippedCount++;
      skippedReasons['excluded-parent'] = (skippedReasons['excluded-parent'] || 0) + 1;
      return;
    }

    // Skip if element is hidden
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      skippedCount++;
      skippedReasons['hidden'] = (skippedReasons['hidden'] || 0) + 1;
      return;
    }

    // Get text content
    const text = element.textContent?.trim();
    if (!text || text.length < 3) {
      skippedCount++;
      skippedReasons['no-text'] = (skippedReasons['no-text'] || 0) + 1;
      return;
    }

    if (text.length > 5000) {
      skippedCount++;
      skippedReasons['too-long'] = (skippedReasons['too-long'] || 1) + 1;
      return;
    }

    // Skip if it's mostly numbers or symbols (but be less strict)
    const textRatio = text.replace(/[^a-zA-Z]/g, '').length / text.length;
    if (textRatio < 0.2) { // Lowered from 0.3 to 0.2
      skippedCount++;
      skippedReasons['mostly-symbols'] = (skippedReasons['mostly-symbols'] || 0) + 1;
      return;
    }

    // Skip if element has children that are also text elements (but allow p and li)
    const tagName = element.tagName.toLowerCase();
    const hasTextChildren = element.querySelector('p, span, h1, h2, h3, h4, h5, h6, li, a, button, td, th');
    if (hasTextChildren && tagName !== 'p' && tagName !== 'li' && tagName !== 'td' && tagName !== 'th' && tagName !== 'dd' && tagName !== 'dt') {
      skippedCount++;
      skippedReasons['has-text-children'] = (skippedReasons['has-text-children'] || 0) + 1;
      return;
    }

    // Store original text
    element.setAttribute('data-a11y-original-text', text);
    elementsToTranslate.push({ element, originalText: text });
  });

  const capped = elementsToTranslate.slice(0, MAX_TRANSLATE_ELEMENTS);

  if (capped.length === 0) {
    const fallbackElements: Array<{ element: Element; originalText: string }> = [];
    
    // Find all elements with text content, regardless of tag
    const allElements = document.querySelectorAll('*');
    allElements.forEach((element) => {
      if (element.hasAttribute('data-a11y-translated') || 
          element.hasAttribute('data-a11y-original-text') ||
          element.closest('script, style, noscript') ||
          element.classList.contains('a11y-reading-ruler') ||
          element.id === 'a11y-reading-ruler') {
        return;
      }

      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return;
      }

      const text = element.textContent?.trim();
      if (text && text.length >= 10 && text.length < 5000) {
        const textRatio = text.replace(/[^a-zA-Z]/g, '').length / text.length;
        if (textRatio >= 0.3) {
          // Only add if it doesn't have text children (to avoid duplicates)
          const hasTextChildren = element.querySelector('p, h1, h2, h3, h4, h5, h6, li, span, div, td, th');
          if (!hasTextChildren || ['p', 'li', 'td', 'th', 'span', 'div'].includes(element.tagName.toLowerCase())) {
            element.setAttribute('data-a11y-original-text', text);
            fallbackElements.push({ element, originalText: text });
          }
        }
      }
    });

    if (fallbackElements.length > 0) {
      const limitedFallback = fallbackElements.slice(0, Math.min(50, MAX_TRANSLATE_ELEMENTS));
      const batchSize = 10;
      let translatedCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < limitedFallback.length; i += batchSize) {
        const batch = limitedFallback.slice(i, i + batchSize);
        try {
          const textsToTranslate = batch.map(({ originalText }) => originalText);
          const translatedTexts = await translateTexts(textsToTranslate, targetLang);
          
          batch.forEach(({ element, originalText }, index) => {
            const translated = translatedTexts[index];
            if (translated && translated !== originalText && translated.trim().length > 0) {
              element.textContent = translated;
              element.setAttribute('data-a11y-translated', 'true');
              translatedCount++;
            }
          });
          
          if (i + batchSize < limitedFallback.length) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch {
          errorCount += batch.length;
        }
      }
      return;
    }
    return;
  }

  const batchSize = 5;
  let translatedCount = 0;
  for (let i = 0; i < capped.length; i += batchSize) {
    const batch = capped.slice(i, i + batchSize);
    try {
      const textsToTranslate = batch.map(({ originalText }) => originalText);
      const translatedTexts = await translateTexts(textsToTranslate, targetLang);
      batch.forEach(({ element, originalText }, index) => {
        const translated = translatedTexts[index];
        if (translated?.trim()) {
          element.textContent = translated;
          element.setAttribute('data-a11y-translated', 'true');
          translatedCount++;
        }
      });
      if (i + batchSize < capped.length) {
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch {
      // Continue with next batch
    }
  }
}

// Restore original text
export function restoreOriginalText(): void {
  const translatedElements = document.querySelectorAll('[data-a11y-translated="true"]');
  
  translatedElements.forEach((element) => {
    const originalText = element.getAttribute('data-a11y-original-text');
    if (originalText) {
      element.textContent = originalText;
      element.removeAttribute('data-a11y-translated');
      element.removeAttribute('data-a11y-original-text');
    }
  });
}

export function useBrowserTranslation(targetLang: string): void {
  document.documentElement.lang = targetLang;
}
