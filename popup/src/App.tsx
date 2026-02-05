import { useState, useEffect, useCallback } from 'react';
import { PROFILES, type ProfileId, type AccessibilityProfile } from './profiles';
import {
  FiEye,
  FiBookOpen,
  FiCpu,
  FiSettings,
  FiCheck,
  FiZap,
  FiType,
  FiMinus,
  FiPlus,
  FiMoon,
  FiSun,
  FiHelpCircle
} from 'react-icons/fi';
import SettingsPanel from './SettingsPanel';
import ViralityPrompt from './ViralityPrompt';
import './App.css';

interface ExtensionState {
  enabled: boolean;
  profileId: ProfileId;
}

interface QuickSettings {
  readingMode: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  readingRuler: boolean;
  darkMode: boolean;
  focusMode: boolean;
  translateEnabled: boolean;
  targetLanguage: string;
  theme: 'default' | 'paper' | 'night' | 'highContrastBlue';
}

function App() {
  const [state, setState] = useState<ExtensionState>({
    enabled: false,
    profileId: 'lowVision'
  });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [customSettings, setCustomSettings] = useState<Partial<AccessibilityProfile>>(PROFILES.custom);
  const [quickSettings, setQuickSettings] = useState<QuickSettings>({
    readingMode: false,
    colorBlindMode: 'none',
    readingRuler: false,
    darkMode: false,
    focusMode: false,
    translateEnabled: false,
    targetLanguage: 'en',
    theme: 'default'
  });
  type ReadLaterItem = {
    id: string;
    url: string;
    title: string;
    createdAt: number;
    profileId: ProfileId;
    quickSettings: QuickSettings;
    fontSizeMultiplier: number;
  };
  const [readLaterItems, setReadLaterItems] = useState<ReadLaterItem[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'getState' }, (response: { enabled?: boolean; profileId?: ProfileId }) => {
      if (chrome.runtime.lastError) {
        setLoading(false);
        return;
      }
      if (response) {
        setState({
          enabled: Boolean(response.enabled),
          profileId: response.profileId || 'lowVision'
        });
      }
      setLoading(false);
    });

    chrome.storage.sync.get(['quickSettings'], (result: { quickSettings?: Partial<QuickSettings> }) => {
      if (result.quickSettings) {
        setQuickSettings(prev => ({
          ...prev,
          ...result.quickSettings,
          translateEnabled: result.quickSettings?.translateEnabled ?? false,
          targetLanguage: result.quickSettings?.targetLanguage || 'en',
          theme: result.quickSettings?.theme || 'default'
        }));
      }
    });

    chrome.storage.sync.get(['fontSizeMultiplier'], (result: { fontSizeMultiplier?: number }) => {
      if (typeof result.fontSizeMultiplier === 'number' && result.fontSizeMultiplier >= 0.5 && result.fontSizeMultiplier <= 3) {
        setFontSizeMultiplier(result.fontSizeMultiplier);
      }
    });

    chrome.storage.local.get(['usageCount'], (result: { usageCount?: number }) => {
      const count = typeof result.usageCount === 'number' ? result.usageCount : 0;
      setUsageCount(count);
    });

    chrome.storage.local.get(['readLaterItems'], (result: { readLaterItems?: ReadLaterItem[] }) => {
      if (Array.isArray(result.readLaterItems)) {
        setReadLaterItems(result.readLaterItems);
      }
    });
  }, []);

  const handleToggle = useCallback(() => {
    setLoading(true);
    chrome.runtime.sendMessage({
      action: 'toggle',
      profileId: state.profileId,
      quickSettings,
      fontSizeMultiplier
    }, (response: { enabled?: boolean }) => {
      if (chrome.runtime.lastError) {
        setLoading(false);
        return;
      }
      if (response) {
        setState(prev => ({ ...prev, enabled: Boolean(response.enabled) }));
        if (response.enabled) {
          chrome.storage.local.get(['usageCount'], (result: { usageCount?: number }) => {
            const newCount = (typeof result.usageCount === 'number' ? result.usageCount : 0) + 1;
            chrome.storage.local.set({ usageCount: newCount }, () => setUsageCount(newCount));
          });
        }
      }
      setLoading(false);
    });
  }, [state.profileId, quickSettings, fontSizeMultiplier]);

  const handleProfileChange = (profileId: ProfileId) => {
    if (profileId === 'custom' && !showSettings) {
      setShowSettings(true);
      return;
    }
    setLoading(true);
    chrome.runtime.sendMessage({ action: 'setProfile', profileId }, (response: { success?: boolean }) => {
      if (chrome.runtime.lastError) {
        setLoading(false);
        return;
      }
      if (response?.success) {
        setState(prev => ({ ...prev, profileId }));
      }
      setLoading(false);
    });
  };

  const handleSaveCustomSettings = (settings: Partial<AccessibilityProfile>) => {
    setCustomSettings(settings);
    setLoading(true);
    chrome.storage.sync.set({ customSettings: settings }, () => {
      chrome.runtime.sendMessage({ action: 'setProfile', profileId: 'custom', customSettings: settings }, (response: { success?: boolean }) => {
        if (chrome.runtime.lastError) {
          setLoading(false);
          return;
        }
        if (response?.success) {
          setState(prev => ({ ...prev, profileId: 'custom' }));
        }
        setLoading(false);
      });
    });
  };

  useEffect(() => {
    chrome.storage.sync.get(['customSettings'], (result: { [key: string]: any }) => {
      if (result.customSettings) {
        setCustomSettings(result.customSettings);
      }
    });
  }, []);

  const handleQuickSettingChange = useCallback((key: keyof QuickSettings, value: unknown) => {
    const newSettings: QuickSettings = { ...quickSettings, [key]: value } as QuickSettings;
    setQuickSettings(newSettings);
    chrome.storage.sync.set({ quickSettings: newSettings }, () => {
      if (state.enabled) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'updateQuickSettings', quickSettings: newSettings }).catch(() => {});
          }
        });
      }
    });
  }, [quickSettings, state.enabled]);

  const saveCurrentPageForLater = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('chrome-extension://')) {
        return;
      }
      const now = Date.now();
      const id = `${now}-${Math.random().toString(36).slice(2, 8)}`;
      const item: ReadLaterItem = {
        id,
        url: tab.url,
        title: tab.title || 'Untitled page',
        createdAt: now,
        profileId: state.profileId,
        quickSettings,
        fontSizeMultiplier
      };
      setReadLaterItems(prev => {
        const existingWithoutUrl = prev.filter(x => x.url !== item.url);
        const updated = [item, ...existingWithoutUrl].slice(0, 50);
        chrome.storage.local.set({ readLaterItems: updated });
        return updated;
      });
    });
  };

  const openReadLaterItem = (item: ReadLaterItem) => {
    chrome.storage.sync.set({
      enabled: true,
      profileId: item.profileId,
      quickSettings: item.quickSettings,
      fontSizeMultiplier: item.fontSizeMultiplier
    }, () => {
      chrome.tabs.create({ url: item.url });
    });
  };

  const removeReadLaterItem = (id: string) => {
    setReadLaterItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      chrome.storage.local.set({ readLaterItems: updated });
      return updated;
    });
  };

  const handleFontSizeAdjust = (delta: number) => {
    const newMultiplier = Math.max(0.5, Math.min(3.0, fontSizeMultiplier + delta));
    setFontSizeMultiplier(newMultiplier);
    chrome.storage.sync.set({ fontSizeMultiplier: newMultiplier }, () => {
      if (state.enabled) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'updateFontSize',
              fontSizeMultiplier: newMultiplier
            });
          }
        });
      }
    });
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            handleToggle();
            break;
          case 'r':
            if (state.enabled) {
              e.preventDefault();
              handleQuickSettingChange('readingMode', !quickSettings.readingMode);
            }
            break;
          case 'l':
            if (state.enabled) {
              e.preventDefault();
              handleQuickSettingChange('readingRuler', !quickSettings.readingRuler);
            }
            break;
          case 'm':
            if (state.enabled) {
              e.preventDefault();
              handleQuickSettingChange('darkMode', !quickSettings.darkMode);
            }
            break;
          case '.':
            if (state.enabled) {
              e.preventDefault();
              handleFontSizeAdjust(0.1);
            }
            break;
          case ',':
            if (state.enabled) {
              e.preventDefault();
              handleFontSizeAdjust(-0.1);
            }
            break;
          case 'p':
            {
              e.preventDefault();
              const order: ProfileId[] = ['lowVision', 'dyslexia', 'cognitive', 'custom'];
              const idx = order.indexOf(state.profileId);
              const next = order[(idx + 1) % order.length];
              handleProfileChange(next);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleToggle, state.enabled, quickSettings.readingMode, quickSettings.readingRuler, quickSettings.darkMode, handleQuickSettingChange, fontSizeMultiplier, state.profileId]);

  if (loading && state.enabled === false) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const getDomain = (url: string): string => {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-icon">
            <FiZap size={24} />
          </div>
          <div className="header-text">
            <h1>Accessibility Helper</h1>
            <p className="subtitle">Built for users with visual, cognitive, and reading needs</p>
          </div>
          <button 
            className="header-btn"
            onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
            title="Keyboard Shortcuts"
            aria-label="Show keyboard shortcuts"
          >
            <FiHelpCircle size={18} />
          </button>
        </div>
      </header>

      {showKeyboardShortcuts && (
        <div className="keyboard-shortcuts-panel">
          <h3>Keyboard Shortcuts</h3>
          <div className="shortcuts-list">
            <div className="shortcut-item">
              <kbd>Ctrl/Cmd + K</kbd>
              <span>Toggle accessibility mode</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl/Cmd + R</kbd>
              <span>Toggle reading mode</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl/Cmd + L</kbd>
              <span>Toggle reading ruler</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl/Cmd + M</kbd>
              <span>Toggle dark mode</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl/Cmd + ,</kbd>
              <span>Decrease font size</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl/Cmd + .</kbd>
              <span>Increase font size</span>
            </div>
            <div className="shortcut-item">
              <kbd>Ctrl/Cmd + P</kbd>
              <span>Cycle profiles</span>
            </div>
          </div>
        </div>
      )}

      <main className="main">
        {usageCount >= 3 && (
          <ViralityPrompt 
            usageCount={usageCount} 
            onDismiss={() => setUsageCount(prev => prev + 1)}
          />
        )}
        
        <div className="toggle-section">
          <div className="toggle-header">
            <span className="toggle-label">Enable Accessibility Mode</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={state.enabled}
                onChange={handleToggle}
                disabled={loading}
              />
              <span className="slider"></span>
            </label>
          </div>
          {state.enabled && (
            <p className="status-text">
              <FiCheck size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Active on this page
            </p>
          )}
        </div>

        {state.enabled && (
          <>
            {/* Quick Actions */}
            <div className="quick-actions-section">
              <h2>Quick Actions</h2>
              <div className="quick-actions-grid">
                <button
                  className={`quick-action-btn ${quickSettings.readingMode ? 'active' : ''}`}
                  onClick={() => handleQuickSettingChange('readingMode', !quickSettings.readingMode)}
                  title="Reading Mode - Focus on content"
                >
                  <FiBookOpen size={18} />
                  <span>Reading Mode</span>
                </button>
                <button
                  className={`quick-action-btn ${quickSettings.readingRuler ? 'active' : ''}`}
                  onClick={() => handleQuickSettingChange('readingRuler', !quickSettings.readingRuler)}
                  title="Reading Ruler - Highlight reading line"
                >
                  <FiType size={18} />
                  <span>Reading Ruler</span>
                </button>
                <button
                  className={`quick-action-btn ${quickSettings.darkMode ? 'active' : ''}`}
                  onClick={() => handleQuickSettingChange('darkMode', !quickSettings.darkMode)}
                  title="Dark Mode"
                >
                  {quickSettings.darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
                  <span>Dark Mode</span>
                </button>
                <button
                  className={`quick-action-btn ${quickSettings.focusMode ? 'active' : ''}`}
                  onClick={() => handleQuickSettingChange('focusMode', !quickSettings.focusMode)}
                  title="Focus Mode - Dim non-content areas"
                >
                  <FiEye size={18} />
                  <span>Focus Mode</span>
                </button>
              </div>

              {/* Font Size Quick Adjust */}
              <div className="font-size-control">
                <label>Font Size</label>
                <div className="font-size-adjuster">
                  <button
                    className="font-size-btn"
                    onClick={() => handleFontSizeAdjust(-0.1)}
                    disabled={fontSizeMultiplier <= 0.5}
                    aria-label="Decrease font size"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className="font-size-value">{fontSizeMultiplier.toFixed(1)}x</span>
                  <button
                    className="font-size-btn"
                    onClick={() => handleFontSizeAdjust(0.1)}
                    disabled={fontSizeMultiplier >= 3.0}
                    aria-label="Increase font size"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>

              {/* Color Blind Support */}
              <div className="color-blind-control">
                <label>Color Vision</label>
                <select
                  value={quickSettings.colorBlindMode}
                  onChange={(e) => handleQuickSettingChange('colorBlindMode', e.target.value)}
                  className="color-blind-select"
                >
                  <option value="none">Normal</option>
                  <option value="protanopia">Protanopia</option>
                  <option value="deuteranopia">Deuteranopia</option>
                  <option value="tritanopia">Tritanopia</option>
                </select>
              </div>

              {/* Theme Presets */}
              <div className="theme-control">
                <label>Theme</label>
                <div className="theme-pills">
                  <button
                    className={`theme-pill ${quickSettings.theme === 'default' ? 'active' : ''}`}
                    onClick={() => handleQuickSettingChange('theme', 'default')}
                    type="button"
                  >
                    Default
                  </button>
                  <button
                    className={`theme-pill ${quickSettings.theme === 'paper' ? 'active' : ''}`}
                    onClick={() => handleQuickSettingChange('theme', 'paper')}
                    type="button"
                  >
                    Paper
                  </button>
                  <button
                    className={`theme-pill ${quickSettings.theme === 'night' ? 'active' : ''}`}
                    onClick={() => handleQuickSettingChange('theme', 'night')}
                    type="button"
                  >
                    Night
                  </button>
                  <button
                    className={`theme-pill ${quickSettings.theme === 'highContrastBlue' ? 'active' : ''}`}
                    onClick={() => handleQuickSettingChange('theme', 'highContrastBlue')}
                    type="button"
                  >
                    High Contrast
                  </button>
                </div>
              </div>

              {/* Language Translation */}
              <div className="translation-control">
                <div className="translation-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={quickSettings.translateEnabled || false}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        handleQuickSettingChange('translateEnabled', enabled);
                        // If enabling, ensure a language is selected
                        if (enabled && !quickSettings.targetLanguage) {
                          handleQuickSettingChange('targetLanguage', 'es');
                        }
                      }}
                    />
                    <span>Translate Page</span>
                  </label>
                </div>
                {quickSettings.translateEnabled && (
                  <select
                    value={quickSettings.targetLanguage || 'en'}
                    onChange={(e) => {
                      const lang = e.target.value;
                      handleQuickSettingChange('targetLanguage', lang);
                    }}
                    className="language-select"
                  >
                    <option value="auto">Auto-detect</option>
                    <option value="en">English</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="fr">French (Français)</option>
                    <option value="de">German (Deutsch)</option>
                    <option value="it">Italian (Italiano)</option>
                    <option value="pt">Portuguese (Português)</option>
                    <option value="ru">Russian (Русский)</option>
                    <option value="ja">Japanese (日本語)</option>
                    <option value="ko">Korean (한국어)</option>
                    <option value="zh">Chinese (中文)</option>
                    <option value="ar">Arabic (العربية)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                    <option value="nl">Dutch (Nederlands)</option>
                    <option value="pl">Polish (Polski)</option>
                    <option value="tr">Turkish (Türkçe)</option>
                  </select>
                )}
                {quickSettings.translateEnabled && quickSettings.targetLanguage !== 'auto' && (
                  <button
                    className="quick-action-btn translate-selection-btn"
                    onClick={() => {
                      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        if (tabs[0]?.id) {
                          chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'translateSelection',
                            targetLang: quickSettings.targetLanguage || 'en'
                          }).catch(() => {});
                        }
                      });
                    }}
                    title="Translate selected text on the page"
                  >
                    <FiBookOpen size={16} />
                    <span>Translate Selection</span>
                  </button>
                )}
              </div>
            </div>

            <div className="profiles-section">
              <h2>Accessibility Profile</h2>
              <div className="profiles-grid">
              {Object.values(PROFILES).map((profile) => {
                const getProfileIcon = (id: ProfileId) => {
                  switch (id) {
                    case 'lowVision': return <FiEye size={20} />;
                    case 'dyslexia': return <FiBookOpen size={20} />;
                    case 'cognitive': return <FiCpu size={20} />;
                    case 'custom': return <FiSettings size={20} />;
                    default: return <FiZap size={20} />;
                  }
                };

                const displayProfile = profile.id === 'custom' && customSettings 
                  ? { ...profile, ...customSettings }
                  : profile;
                
                return (
                  <button
                    key={profile.id}
                    className={`profile-card ${state.profileId === profile.id ? 'active' : ''}`}
                    onClick={() => handleProfileChange(profile.id)}
                    disabled={loading}
                  >
                    <div className="profile-icon">
                      {getProfileIcon(profile.id)}
                    </div>
                    <div className="profile-name">{profile.name}</div>
                    <div className="profile-desc">{displayProfile.description}</div>
                    {profile.id === 'custom' && (
                      <div className="profile-hint">Click to customize</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          </>
        )}

        {/* Read Later */}
        <div className="read-later-section">
          <div className="read-later-header">
            <h2>Read Later</h2>
            <button
              type="button"
              className="read-later-save-btn"
              onClick={saveCurrentPageForLater}
            >
              Save this page
            </button>
          </div>
          {readLaterItems.length === 0 ? (
            <p className="read-later-empty">No saved pages yet.</p>
          ) : (
            <div className="read-later-list">
              {readLaterItems.map(item => (
                <div key={item.id} className="read-later-item">
                  <div className="read-later-main">
                    <div className="read-later-title">{item.title}</div>
                    <div className="read-later-meta">
                      <span className="read-later-domain">
                        {getDomain(item.url)}
                      </span>
                    </div>
                  </div>
                  <div className="read-later-actions">
                    <button
                      type="button"
                      className="read-later-open"
                      onClick={() => openReadLaterItem(item)}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      className="read-later-remove"
                      onClick={() => removeReadLaterItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!state.enabled && (
          <div className="info-section">
            <p className="info-text">
              Click the toggle above to enable accessibility improvements on the current page.
            </p>
            <div className="info-highlight">
              <p className="info-highlight-text">
                Built for users with low vision, dyslexia, cognitive differences, and reading challenges
              </p>
            </div>
            <ul className="features-list">
              <li>✓ Better fonts and spacing</li>
              <li>✓ High contrast mode</li>
              <li>✓ Text simplification</li>
              <li>✓ Screen-reader enhancements</li>
              <li>✓ Reduced distractions</li>
            </ul>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Privacy-first • Built for accessibility • Works everywhere</p>
      </footer>

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveCustomSettings}
        currentSettings={{ ...PROFILES.custom, ...customSettings }}
      />
    </div>
  );
}

export default App;

