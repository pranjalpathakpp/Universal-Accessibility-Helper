import { type ProfileId } from '../utils/profiles';
import {
  STORAGE_KEYS,
  isValidProfileId,
  isValidTargetLang,
  type QuickSettings,
} from '../types/messages';

const DEFAULT_PROFILE: ProfileId = 'lowVision';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    [STORAGE_KEYS.ENABLED]: false,
    [STORAGE_KEYS.PROFILE_ID]: DEFAULT_PROFILE,
  });
});

chrome.action.onClicked.addListener(() => {
  // Popup opens by default; optional: handle click to toggle
});

function isExtensionPage(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://')
  );
}

function sendToAllTabs(
  message: { action: string; [key: string]: unknown },
  callback?: () => void
): void {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id && tab.url && !isExtensionPage(tab.url)) {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Tab may not have content script (e.g. chrome:// or not loaded)
        });
      }
    });
    callback?.();
  });
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  const msg = (message || {}) as { action: string; [key: string]: unknown };

  const safeSend = (response: unknown) => {
    try {
      sendResponse(response);
    } catch {
      // Channel may already be closed
    }
  };

  try {
    if (msg.action === 'toggle') {
      chrome.storage.sync.get(
        [STORAGE_KEYS.ENABLED, STORAGE_KEYS.PROFILE_ID, STORAGE_KEYS.QUICK_SETTINGS, STORAGE_KEYS.FONT_SIZE_MULTIPLIER],
        (result: { [key: string]: unknown }) => {
          const newEnabled = !result[STORAGE_KEYS.ENABLED];
          // Prefer message values; fall back to storage so we never wipe existing settings
          const profileId = isValidProfileId(msg.profileId as string)
            ? (msg.profileId as ProfileId)
            : (isValidProfileId(result[STORAGE_KEYS.PROFILE_ID] as string) ? (result[STORAGE_KEYS.PROFILE_ID] as ProfileId) : DEFAULT_PROFILE);
          const quickSettings =
            msg.quickSettings != null && typeof msg.quickSettings === 'object'
              ? (msg.quickSettings as QuickSettings)
              : ((result[STORAGE_KEYS.QUICK_SETTINGS] as QuickSettings) || {});
          const rawFont = typeof msg.fontSizeMultiplier === 'number' ? msg.fontSizeMultiplier : result[STORAGE_KEYS.FONT_SIZE_MULTIPLIER];
          const fontSizeMultiplier =
            typeof rawFont === 'number' && rawFont >= 0.5 && rawFont <= 3 ? rawFont : 1.0;

          chrome.storage.sync.set(
            {
              [STORAGE_KEYS.ENABLED]: newEnabled,
              [STORAGE_KEYS.PROFILE_ID]: profileId,
              [STORAGE_KEYS.QUICK_SETTINGS]: quickSettings,
              [STORAGE_KEYS.FONT_SIZE_MULTIPLIER]: fontSizeMultiplier,
            },
            () => {
              sendToAllTabs({
                action: newEnabled ? 'enable' : 'disable',
                profileId,
                quickSettings,
                fontSizeMultiplier,
              });
              safeSend({ success: true, enabled: newEnabled });
            }
          );
        }
      );
      return true;
    }

    if (msg.action === 'setProfile') {
      const profileId = isValidProfileId(msg.profileId as string)
        ? (msg.profileId as ProfileId)
        : DEFAULT_PROFILE;
      const updateData: { [key: string]: unknown } = { [STORAGE_KEYS.PROFILE_ID]: profileId };
      if (profileId === 'custom' && msg.customSettings) {
        updateData[STORAGE_KEYS.CUSTOM_SETTINGS] = msg.customSettings;
      }

      chrome.storage.sync.get(
        [STORAGE_KEYS.QUICK_SETTINGS, STORAGE_KEYS.FONT_SIZE_MULTIPLIER],
        (storageResult: { [key: string]: unknown }) => {
          chrome.storage.sync.set(updateData, () => {
            chrome.storage.sync.get([STORAGE_KEYS.ENABLED], (res: { [key: string]: unknown }) => {
              if (res[STORAGE_KEYS.ENABLED]) {
                sendToAllTabs({
                  action: 'enable',
                  profileId,
                  customSettings: msg.customSettings,
                  quickSettings: storageResult[STORAGE_KEYS.QUICK_SETTINGS] || {},
                  fontSizeMultiplier: storageResult[STORAGE_KEYS.FONT_SIZE_MULTIPLIER] ?? 1.0,
                });
              }
              safeSend({ success: true });
            });
          });
        }
      );
      return true;
    }

    if (msg.action === 'getState') {
      chrome.storage.sync.get(
        [STORAGE_KEYS.ENABLED, STORAGE_KEYS.PROFILE_ID],
        (result: { [key: string]: unknown }) => {
          safeSend({
            enabled: Boolean(result[STORAGE_KEYS.ENABLED]),
            profileId: isValidProfileId(result[STORAGE_KEYS.PROFILE_ID] as string)
              ? result[STORAGE_KEYS.PROFILE_ID]
              : DEFAULT_PROFILE,
          });
        }
      );
      return true;
    }

    if (msg.action === 'translate') {
      const targetLang = typeof msg.targetLang === 'string' ? msg.targetLang.trim() : '';
      if (!targetLang || !isValidTargetLang(targetLang) || targetLang === 'auto') {
        safeSend({
          translatedText: msg.text || '',
          translatedTexts: msg.texts || [],
          error: 'Invalid or missing target language',
        });
        return true;
      }

      const textsToTranslate =
        Array.isArray(msg.texts) && msg.texts.length > 0
          ? msg.texts
          : typeof msg.text === 'string' && msg.text.length > 0
            ? [msg.text]
            : [];

      if (textsToTranslate.length === 0) {
        safeSend({
          translatedText: (msg.text as string) || '',
          translatedTexts: [],
        });
        return true;
      }

      const translateOne = (text: string): Promise<string> => {
        const encoded = encodeURIComponent(text);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encoded}`;
        return fetch(url)
          .then((res) => {
            if (!res.ok) throw new Error(`Translation: ${res.status}`);
            return res.json();
          })
          .then((data: unknown) => {
            let out = '';
            if (Array.isArray(data) && Array.isArray(data[0])) {
              for (const item of data[0] as unknown[]) {
                if (Array.isArray(item) && typeof item[0] === 'string') {
                  out += item[0];
                }
              }
            }
            return out || text;
          })
          .catch(() => text);
      };

      const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
      Promise.all(
        textsToTranslate.map((text, i) =>
          delay(i * 50).then(() => translateOne(text))
        )
      )
        .then((results: string[]) => {
          if (Array.isArray(msg.texts)) {
            safeSend({ translatedTexts: results, success: true });
          } else {
            safeSend({
              translatedText: results[0] ?? (msg.text as string) ?? '',
              success: true,
            });
          }
        })
        .catch((err: Error) => {
          if (Array.isArray(msg.texts)) {
            safeSend({
              translatedTexts: msg.texts as string[],
              error: err.message || 'Translation failed',
            });
          } else {
            safeSend({
              translatedText: (msg.text as string) ?? '',
              error: err.message || 'Translation failed',
            });
          }
        });

      return true;
    }

    safeSend({ success: false, error: 'Unknown action' });
  } catch (err) {
    safeSend({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
  return true;
});
