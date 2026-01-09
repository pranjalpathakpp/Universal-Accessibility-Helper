import { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import type { AccessibilityProfile } from './profiles';
import './SettingsPanel.css';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: Partial<AccessibilityProfile>) => void;
  currentSettings: AccessibilityProfile;
}

export default function SettingsPanel({ isOpen, onClose, onSave, currentSettings }: SettingsPanelProps) {
  const [settings, setSettings] = useState<Partial<AccessibilityProfile>>(currentSettings);

  useEffect(() => {
    // Load saved custom settings
    chrome.storage.sync.get(['customSettings'], (result) => {
      if (result.customSettings) {
        setSettings({ ...currentSettings, ...result.customSettings });
      } else {
        setSettings(currentSettings);
      }
    });
  }, [currentSettings, isOpen]);

  const handleChange = (key: keyof AccessibilityProfile, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save to storage
    chrome.storage.sync.set({ customSettings: settings }, () => {
      onSave(settings);
      onClose();
    });
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Custom Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="settings-content">
          {/* Font Size */}
          <div className="setting-group">
            <label>
              Font Size: <span className="value">{settings.fontSize?.toFixed(1)}x</span>
            </label>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.1"
              value={settings.fontSize || 1.0}
              onChange={(e) => handleChange('fontSize', parseFloat(e.target.value))}
            />
            <div className="range-labels">
              <span>Smaller</span>
              <span>Larger</span>
            </div>
          </div>

          {/* Line Height */}
          <div className="setting-group">
            <label>
              Line Height: <span className="value">{settings.lineHeight?.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min="1.2"
              max="2.5"
              step="0.1"
              value={settings.lineHeight || 1.5}
              onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
            />
            <div className="range-labels">
              <span>Tight</span>
              <span>Spacious</span>
            </div>
          </div>

          {/* Letter Spacing */}
          <div className="setting-group">
            <label>
              Letter Spacing: <span className="value">{settings.letterSpacing?.toFixed(2)}em</span>
            </label>
            <input
              type="range"
              min="0"
              max="0.2"
              step="0.01"
              value={settings.letterSpacing || 0}
              onChange={(e) => handleChange('letterSpacing', parseFloat(e.target.value))}
            />
            <div className="range-labels">
              <span>Normal</span>
              <span>Wide</span>
            </div>
          </div>

          {/* Word Spacing */}
          <div className="setting-group">
            <label>
              Word Spacing: <span className="value">{settings.wordSpacing?.toFixed(2)}em</span>
            </label>
            <input
              type="range"
              min="0"
              max="0.3"
              step="0.01"
              value={settings.wordSpacing || 0}
              onChange={(e) => handleChange('wordSpacing', parseFloat(e.target.value))}
            />
            <div className="range-labels">
              <span>Normal</span>
              <span>Wide</span>
            </div>
          </div>

          {/* Contrast */}
          <div className="setting-group">
            <label>Contrast Level</label>
            <select
              value={settings.contrast || 'normal'}
              onChange={(e) => handleChange('contrast', e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="veryHigh">Very High</option>
            </select>
          </div>

          {/* Feature Toggles */}
          <div className="setting-group">
            <label className="section-label">Features</label>
            
            <div className="toggle-item">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.simplifyText || false}
                  onChange={(e) => handleChange('simplifyText', e.target.checked)}
                />
                <span>Simplify Text</span>
              </label>
              <p className="toggle-desc">Replace complex words with simpler ones</p>
            </div>

            <div className="toggle-item">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.enhanceAria || false}
                  onChange={(e) => handleChange('enhanceAria', e.target.checked)}
                />
                <span>Enhance ARIA</span>
              </label>
              <p className="toggle-desc">Add screen-reader hints</p>
            </div>

            <div className="toggle-item">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.reduceCognitiveLoad || false}
                  onChange={(e) => handleChange('reduceCognitiveLoad', e.target.checked)}
                />
                <span>Reduce Cognitive Load</span>
              </label>
              <p className="toggle-desc">Disable auto-play, reduce clutter</p>
            </div>

            <div className="toggle-item">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.removeBackgroundImages || false}
                  onChange={(e) => handleChange('removeBackgroundImages', e.target.checked)}
                />
                <span>Remove Background Images</span>
              </label>
              <p className="toggle-desc">Hide background images for clarity</p>
            </div>

            <div className="toggle-item">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.disableAnimations || false}
                  onChange={(e) => handleChange('disableAnimations', e.target.checked)}
                />
                <span>Disable Animations</span>
              </label>
              <p className="toggle-desc">Stop moving elements</p>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="save-btn" onClick={handleSave}>
            <FiSave size={16} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

