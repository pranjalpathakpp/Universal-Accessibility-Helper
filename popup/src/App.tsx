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
  translateEnabled: boolean;
  targetLanguage: string;
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
    translateEnabled: false,
    targetLanguage: 'en'
  });
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
      if (response) {
        setState({
          enabled: response.enabled || false,
          profileId: response.profileId || 'lowVision'
        });
      }
      setLoading(false);
    });

    // Load quick settings
    chrome.storage.sync.get(['quickSettings'], (result: { [key: string]: any }) => {
      if (result.quickSettings) {
        setQuickSettings(prev => ({ 
          ...prev, 
          ...result.quickSettings,
          translateEnabled: result.quickSettings.translateEnabled || false,
          targetLanguage: result.quickSettings.targetLanguage || 'en'
        }));
      }
    });

    // Load font size multiplier
    chrome.storage.sync.get(['fontSizeMultiplier'], (result: { [key: string]: any }) => {
      if (result.fontSizeMultiplier) {
        setFontSizeMultiplier(result.fontSizeMultiplier);
      }
    });

    // Load and track usage count
    chrome.storage.local.get(['usageCount'], (result: { [key: string]: any }) => {
      const count = result.usageCount || 0;
      setUsageCount(count);
    });
  }, []);

  const handleToggle = useCallback(() => {
    setLoading(true);
    chrome.runtime.sendMessage({
      action: 'toggle',
      profileId: state.profileId,
      quickSettings: quickSettings,
      fontSizeMultiplier: fontSizeMultiplier
    }, (response) => {
      if (response) {
        setState(prev => ({
          ...prev,
          enabled: response.enabled
        }));
        
        // Track usage when enabled
        if (response.enabled) {
          chrome.storage.local.get(['usageCount'], (result: { [key: string]: any }) => {
            const newCount = (result.usageCount || 0) + 1;
            chrome.storage.local.set({ usageCount: newCount }, () => {
              setUsageCount(newCount);
            });
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
    chrome.runtime.sendMessage({
      action: 'setProfile',
      profileId: profileId
    }, (response) => {
      if (response) {
        setState(prev => ({
          ...prev,
          profileId: profileId
        }));
      }
      setLoading(false);
    });
  };

  const handleSaveCustomSettings = (settings: Partial<AccessibilityProfile>) => {
    setCustomSettings(settings);
    setLoading(true);
    
    chrome.storage.sync.set({ customSettings: settings }, () => {
      chrome.runtime.sendMessage({
        action: 'setProfile',
        profileId: 'custom',
        customSettings: settings
      }, (response) => {
        if (response) {
          setState(prev => ({
            ...prev,
            profileId: 'custom'
          }));
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

  const handleQuickSettingChange = useCallback((key: keyof QuickSettings, value: any) => {
    const newSettings = { ...quickSettings, [key]: value };
    setQuickSettings(newSettings);
    chrome.storage.sync.set({ quickSettings: newSettings }, () => {
      if (state.enabled) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'updateQuickSettings',
              quickSettings: newSettings
            }, () => {
              if (chrome.runtime.lastError) {
                console.error('[Popup] Error sending message:', chrome.runtime.lastError);
              }
            });
          }
        });
      }
    });
  }, [quickSettings, state.enabled]);

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
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleToggle, state.enabled, quickSettings.readingMode, handleQuickSettingChange]);

  if (loading && state.enabled === false) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    );
  }

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

