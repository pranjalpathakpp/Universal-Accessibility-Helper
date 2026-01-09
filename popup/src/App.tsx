import { useState, useEffect } from 'react';
import { PROFILES, type ProfileId, type AccessibilityProfile } from './profiles';
import { 
  FiEye, 
  FiBookOpen, 
  FiCpu, 
  FiSettings,
  FiCheck,
  FiZap
} from 'react-icons/fi';
import SettingsPanel from './SettingsPanel';
import './App.css';

interface ExtensionState {
  enabled: boolean;
  profileId: ProfileId;
}

function App() {
  const [state, setState] = useState<ExtensionState>({
    enabled: false,
    profileId: 'lowVision'
  });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [customSettings, setCustomSettings] = useState<Partial<AccessibilityProfile>>(PROFILES.custom);

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
  }, []);

  const handleToggle = () => {
    setLoading(true);
    chrome.runtime.sendMessage({
      action: 'toggle',
      profileId: state.profileId
    }, (response) => {
      if (response) {
        setState(prev => ({
          ...prev,
          enabled: response.enabled
        }));
      }
      setLoading(false);
    });
  };

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
    
    chrome.storage.sync.get(['customSettings'], (result) => {
      if (result.customSettings) {
        setCustomSettings(result.customSettings);
      }
    });
  }, []);

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
        <div className="header-icon">
          <FiZap size={24} />
        </div>
        <h1>Accessibility Helper</h1>
        <p className="subtitle">Universal web accessibility</p>
      </header>

      <main className="main">
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
        )}

        {!state.enabled && (
          <div className="info-section">
            <p className="info-text">
              Click the toggle above to enable accessibility improvements on the current page.
            </p>
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
        <p>Privacy-first • Works everywhere</p>
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

