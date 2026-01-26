// Language translation utility using free Google Translate (no API key required)
// Uses the same servers that translate.google.com uses

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
  targetLanguage = lang;
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.set({ targetLanguage: lang });
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
    chrome.storage.sync.get(['targetLanguage'], (result: { [key: string]: any }) => {
      if (result.targetLanguage) {
        targetLanguage = result.targetLanguage;
      }
      resolve();
    });
  });
}

// Generate a token for Google Translate (simplified version)
function generateToken(text: string): string {
  // This is a simplified token generation
  // In production, you might want to use a more sophisticated approach
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString();
}

// Translate single text using free Google Translate
export async function translateText(text: string, targetLang: string = targetLanguage): Promise<string> {
  if (!text || text.trim().length === 0) {
    return text;
  }

  // Skip translation if target language is 'auto'
  if (targetLang === 'auto' || !targetLang) {
    return text;
  }

  console.log(`[Translate] Translating text (length: ${text.length}) to ${targetLang}`);
  console.log(`[Translate] Text preview: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);

  // Use background script to proxy the request (avoids CORS issues)
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        action: 'translate',
        text: text,
        targetLang: targetLang
      }, (response: any) => {
        if (chrome.runtime.lastError) {
          console.error('[Translate] Runtime error:', chrome.runtime.lastError.message);
          resolve(text);
          return;
        }
        
        if (response && response.translatedText) {
          console.log(`[Translate] Successfully translated: "${text.substring(0, 50)}..." -> "${response.translatedText.substring(0, 50)}..."`);
          resolve(response.translatedText);
        } else if (response && response.error) {
          console.error('[Translate] Translation error:', response.error);
          resolve(text);
        } else {
          console.warn('[Translate] No translation in response:', response);
          resolve(text);
        }
      });
    } else {
      console.warn('[Translate] Chrome runtime not available');
      resolve(text);
    }
  });
}

// Translate multiple text segments at once (more efficient)
export async function translateTexts(texts: string[], targetLang: string = targetLanguage): Promise<string[]> {
  if (!texts || texts.length === 0) {
    return texts;
  }

  // Skip translation if target language is 'auto'
  if (targetLang === 'auto' || !targetLang) {
    return texts;
  }

  console.log(`[Translate] Translating ${texts.length} text segment(s) to ${targetLang}`);

  // Use background script to proxy the request (avoids CORS issues)
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        action: 'translate',
        texts: texts,
        targetLang: targetLang
      }, (response: any) => {
        if (chrome.runtime.lastError) {
          console.error('[Translate] Runtime error:', chrome.runtime.lastError.message);
          resolve(texts);
          return;
        }
        
        if (response && response.translatedTexts && Array.isArray(response.translatedTexts)) {
          console.log(`[Translate] Successfully translated ${response.translatedTexts.length} segment(s)`);
          console.log(`[Translate] Input texts (first 3):`, texts.slice(0, 3).map((t: string) => `"${t?.substring(0, 40)}..."`));
          console.log(`[Translate] Results preview (first 3):`, response.translatedTexts.slice(0, 3).map((r: string) => `"${r?.substring(0, 40)}..."`));
          
          // Validate that we got valid translations
          const validResults = response.translatedTexts.map((result: string, index: number) => {
            const original = texts[index] || '';
            
            if (!result || result.trim() === '') {
              console.warn(`[Translate] Result ${index} is empty, using original: "${original.substring(0, 30)}..."`);
              return original;
            }
            
            // Check if result is same as original (might be correct for proper nouns, etc.)
            if (result === original) {
              console.log(`[Translate] Result ${index} same as original (might be correct): "${original.substring(0, 30)}..."`);
              // Still return it - it's a valid translation (just happens to be the same)
              return result;
            }
            
            return result;
          });
          
          console.log(`[Translate] Valid results count: ${validResults.filter((r, i) => r && r !== texts[i]).length}/${validResults.length}`);
          resolve(validResults);
        } else if (response && response.error) {
          console.error('[Translate] Translation error:', response.error);
          resolve(texts);
        } else {
          console.warn('[Translate] No translation in response:', response);
          console.warn('[Translate] Response keys:', response ? Object.keys(response) : 'null');
          resolve(texts);
        }
      });
    } else {
      console.warn('[Translate] Chrome runtime not available');
      resolve(texts);
    }
  });
}

// Translate page content
export async function translatePage(targetLang: string): Promise<void> {
  if (targetLang === 'auto' || !targetLang) {
    console.log('[Translate] Skipping translation - auto or no language selected');
    return;
  }

  console.log(`[Translate] Starting page translation to ${targetLang}`);

  // More comprehensive selectors to find text elements
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

  // Try all selectors
  let textElements = document.querySelectorAll(allSelectors.join(', '));
  
  console.log(`[Translate] Found ${textElements.length} potential text elements with selectors`);

  const elementsToTranslate: Array<{ element: Element; originalText: string }> = [];
  let skippedCount = 0;
  let skippedReasons: { [key: string]: number } = {};

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

  console.log(`[Translate] Found ${elementsToTranslate.length} elements to translate`);
  console.log(`[Translate] Skipped ${skippedCount} elements. Reasons:`, skippedReasons);

  if (elementsToTranslate.length === 0) {
    console.warn('[Translate] No elements found to translate');
    console.warn('[Translate] Debug info:', {
      totalElementsFound: textElements.length,
      skippedCount: skippedCount,
      skippedReasons: skippedReasons,
      pageUrl: window.location.href,
      pageTitle: document.title
    });
    
    // Try a more aggressive approach: find any visible text nodes
    console.log('[Translate] Trying fallback: searching for visible text nodes...');
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
      console.log(`[Translate] Fallback found ${fallbackElements.length} elements. Using fallback...`);
      // Use fallback elements, but limit to first 50 to avoid performance issues
      const limitedFallback = fallbackElements.slice(0, 50);
      console.log(`[Translate] Using first ${limitedFallback.length} fallback elements`);
      
      // Continue with translation using fallback elements
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
        } catch (error) {
          console.error('[Translate] Error in fallback translation:', error);
          errorCount += batch.length;
        }
      }
      
      console.log(`[Translate] Fallback translation complete. Translated ${translatedCount}/${limitedFallback.length} elements.`);
      return;
    }
    
    console.error('[Translate] No elements could be found for translation, even with fallback');
    return;
  }

  // Translate in smaller batches - translate individually for better reliability
  const batchSize = 5; // Smaller batches, each translated individually
  let translatedCount = 0;
  let errorCount = 0;
  
  console.log(`[Translate] Starting translation of ${elementsToTranslate.length} elements in batches of ${batchSize}`);
  
  for (let i = 0; i < elementsToTranslate.length; i += batchSize) {
    const batch = elementsToTranslate.slice(i, i + batchSize);
    console.log(`[Translate] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(elementsToTranslate.length / batchSize)} (${batch.length} elements)`);
    
    try {
      // Extract texts from batch
      const textsToTranslate = batch.map(({ originalText }) => originalText);
      
      // Translate all texts in batch at once (multi-segment)
      const translatedTexts = await translateTexts(textsToTranslate, targetLang);
      
      // Apply translations to elements
      let batchSuccessCount = 0;
      batch.forEach(({ element, originalText }, index) => {
        const translated = translatedTexts[index];
        
        if (!translated || translated.trim() === '') {
          console.warn(`[Translate] Empty translation for element ${i + index + 1}: "${originalText.substring(0, 30)}..."`);
          return;
        }
        
        if (translated === originalText) {
          console.warn(`[Translate] Translation same as original for element ${i + index + 1}: "${originalText.substring(0, 30)}..." -> "${translated.substring(0, 30)}..."`);
          // Still apply it - might be correct (e.g., proper nouns, numbers)
          element.textContent = translated;
          element.setAttribute('data-a11y-translated', 'true');
          translatedCount++;
          batchSuccessCount++;
        } else if (translated.trim().length > 0) {
          element.textContent = translated;
          element.setAttribute('data-a11y-translated', 'true');
          translatedCount++;
          batchSuccessCount++;
          console.log(`[Translate] ✓ Translated element ${i + index + 1}: "${originalText.substring(0, 30)}..." -> "${translated.substring(0, 30)}..."`);
        }
      });
      
      console.log(`[Translate] Batch complete: ${batchSuccessCount}/${batch.length} successful`);
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < elementsToTranslate.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error('[Translate] Error translating batch:', error);
      errorCount += batch.length;
    }
  }

  console.log(`[Translate] Page translation complete. Translated ${translatedCount}/${elementsToTranslate.length} elements. Errors: ${errorCount}`);
  
  if (translatedCount === 0 && elementsToTranslate.length > 0) {
    console.error('[Translate] WARNING: No elements were translated. Check console for errors.');
    console.error('[Translate] This might indicate:');
    console.error('[Translate] 1. translate-google-api package not installed (run: npm install translate-google-api)');
    console.error('[Translate] 2. Background service worker not responding');
    console.error('[Translate] 3. Translation API not accessible');
    console.error('[Translate] Check background service worker console for details');
  } else if (translatedCount > 0) {
    console.log(`[Translate] ✓ Success! ${translatedCount} elements translated successfully`);
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

// Use browser's built-in translation as fallback
export function useBrowserTranslation(targetLang: string): void {
  // Add lang attribute to html element
  document.documentElement.lang = targetLang;
  
  // Trigger browser's built-in translation if available
  console.log('[Translate] Browser translation enabled. Please use browser\'s translate feature.');
}
