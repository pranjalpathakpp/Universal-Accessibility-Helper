import { type ProfileId } from '../utils/profiles';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    enabled: false,
    profileId: 'lowVision' as ProfileId
  });
});


chrome.action.onClicked.addListener((tab) => {
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle') {
    chrome.storage.sync.get(['enabled', 'profileId', 'quickSettings', 'fontSizeMultiplier'], (result) => {
      const newEnabled = !result.enabled;
      const profileId = message.profileId || result.profileId || 'lowVision';
      const quickSettings = message.quickSettings || result.quickSettings || {};
      const fontSizeMultiplier = message.fontSizeMultiplier || result.fontSizeMultiplier || 1.0;
      
      chrome.storage.sync.set({
        enabled: newEnabled,
        profileId: profileId,
        quickSettings: quickSettings,
        fontSizeMultiplier: fontSizeMultiplier
      }, () => {
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            if (tab.id && tab.url && 
                !tab.url.startsWith('chrome://') && 
                !tab.url.startsWith('chrome-extension://') &&
                !tab.url.startsWith('edge://')) {
              chrome.tabs.sendMessage(tab.id, {
                action: newEnabled ? 'enable' : 'disable',
                profileId: profileId,
                quickSettings: quickSettings,
                fontSizeMultiplier: fontSizeMultiplier
              }).catch((error) => {
                console.log('[A11y Background] Could not send message to tab:', tab.id, error);
              });
            }
          });
        });
        
        sendResponse({ success: true, enabled: newEnabled });
      });
    });
    
    return true; 
  }
  
  if (message.action === 'setProfile') {
    chrome.storage.sync.get(['quickSettings', 'fontSizeMultiplier'], (storageResult) => {
      const updateData: any = { profileId: message.profileId };

      if (message.profileId === 'custom' && message.customSettings) {
        updateData.customSettings = message.customSettings;
      }
      
      chrome.storage.sync.set(updateData, () => {
        chrome.storage.sync.get(['enabled'], (result) => {
          if (result.enabled) {
            chrome.tabs.query({}, (tabs) => {
              tabs.forEach(tab => {
                if (tab.id) {
                  chrome.tabs.sendMessage(tab.id, {
                    action: 'enable',
                    profileId: message.profileId,
                    customSettings: message.customSettings,
                    quickSettings: storageResult.quickSettings || {},
                    fontSizeMultiplier: storageResult.fontSizeMultiplier || 1.0
                  }).catch(() => {});
                }
              });
            });
          }
        });
        
        sendResponse({ success: true });
      });
    });
    
    return true;
  }
  
  if (message.action === 'getState') {
    chrome.storage.sync.get(['enabled', 'profileId'], (result) => {
      sendResponse({
        enabled: result.enabled || false,
        profileId: result.profileId || 'lowVision'
      });
    });
    
    return true;
  }

  if (message.action === 'translate') {
    // Use direct Google Translate API (more reliable than translate-google-api package)
    const { text, texts, targetLang } = message;
    
    console.log('[Translate Background] Received translation request:', { 
      singleText: !!text, 
      multiText: !!texts, 
      textCount: texts?.length || 1,
      targetLang 
    });
    
    if (!targetLang || targetLang === 'auto') {
      console.warn('[Translate Background] Invalid target language:', targetLang);
      sendResponse({ 
        translatedText: text || '', 
        translatedTexts: texts || [],
        error: 'Invalid target language' 
      });
      return true;
    }

    // Handle single text or multi-segment text
    const textsToTranslate = texts && Array.isArray(texts) ? texts : (text ? [text] : []);
    
    if (textsToTranslate.length === 0) {
      sendResponse({ translatedText: '', translatedTexts: [] });
      return true;
    }

    console.log(`[Translate Background] Translating ${textsToTranslate.length} text segment(s) to ${targetLang} using direct API`);
    
    // Translate each text individually using direct Google Translate API
    // This is more reliable than the translate-google-api package
    const translateText = (textToTranslate: string): Promise<string> => {
      return new Promise((resolve) => {
        const encodedText = encodeURIComponent(textToTranslate);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodedText}`;
        
        fetch(url)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Translation error: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            let translatedText = '';
            if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
              for (const item of data[0]) {
                if (item && Array.isArray(item) && item[0] && typeof item[0] === 'string') {
                  translatedText += item[0];
                }
              }
            }
            resolve(translatedText || textToTranslate);
          })
          .catch(error => {
            console.error('[Translate Background] Translation error for text:', error);
            resolve(textToTranslate); // Return original on error
          });
      });
    };

    // Translate all texts with small delays to avoid rate limiting
    const translateWithDelay = (textToTranslate: string, index: number): Promise<string> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          translateText(textToTranslate)
            .then(translated => {
              console.log(`[Translate Background] Translated ${index + 1}/${textsToTranslate.length}: "${textToTranslate.substring(0, 30)}..." -> "${translated.substring(0, 30)}..."`);
              resolve(translated);
            });
        }, index * 50); // 50ms delay between each translation
      });
    };

    // Translate all texts
    Promise.all(
      textsToTranslate.map((textToTranslate, index) => translateWithDelay(textToTranslate, index))
    )
      .then((results: string[]) => {
        console.log('[Translate Background] All translations complete:', results.length, 'result(s)');
        console.log('[Translate Background] Results preview:', results.slice(0, 3).map(r => r?.substring(0, 50) + '...'));
        
        if (texts && Array.isArray(texts)) {
          sendResponse({ 
            translatedTexts: results,
            success: true 
          });
        } else {
          sendResponse({ 
            translatedText: results[0] || (text || ''),
            success: true 
          });
        }
      })
      .catch((error: any) => {
        console.error('[Translate Background] Translation batch error:', error);
        if (texts && Array.isArray(texts)) {
          sendResponse({ translatedTexts: texts, error: error.message || 'Translation failed' });
        } else {
          sendResponse({ translatedText: text || '', error: error.message || 'Translation failed' });
        }
      });
    
    return true; // Keep channel open for async response
  }
});

