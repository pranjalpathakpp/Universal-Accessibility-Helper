/**
 * Background Service Worker
 * Manages extension state and preferences
 */

import { type ProfileId } from '../utils/profiles';

// Initialize default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    enabled: false,
    profileId: 'lowVision' as ProfileId
  });
});

// Handle extension icon click (optional - can open popup)
chrome.action.onClicked.addListener((tab) => {
  // Popup handles the UI, but we can add logic here if needed
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggle') {
    chrome.storage.sync.get(['enabled', 'profileId'], (result) => {
      const newEnabled = !result.enabled;
      const profileId = message.profileId || result.profileId || 'lowVision';
      
      chrome.storage.sync.set({
        enabled: newEnabled,
        profileId: profileId
      }, () => {
        // Notify all tabs to apply/remove accessibility
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            if (tab.id && tab.url && 
                !tab.url.startsWith('chrome://') && 
                !tab.url.startsWith('chrome-extension://') &&
                !tab.url.startsWith('edge://')) {
              // Send message to content script
              chrome.tabs.sendMessage(tab.id, {
                action: newEnabled ? 'enable' : 'disable',
                profileId: profileId
              }).catch((error) => {
                // Content script might not be loaded yet
                // This is OK - it will apply on next page load or when script loads
                console.log('[A11y Background] Could not send message to tab:', tab.id, error);
              });
            }
          });
        });
        
        sendResponse({ success: true, enabled: newEnabled });
      });
    });
    
    return true; // Keep channel open
  }
  
  if (message.action === 'setProfile') {
    const updateData: any = { profileId: message.profileId };
    
    // If custom profile with custom settings, save them
    if (message.profileId === 'custom' && message.customSettings) {
      updateData.customSettings = message.customSettings;
    }
    
    chrome.storage.sync.set(updateData, () => {
      // Apply to all tabs if enabled
      chrome.storage.sync.get(['enabled'], (result) => {
        if (result.enabled) {
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              if (tab.id) {
                chrome.tabs.sendMessage(tab.id, {
                  action: 'enable',
                  profileId: message.profileId,
                  customSettings: message.customSettings
                }).catch(() => {});
              }
            });
          });
        }
      });
      
      sendResponse({ success: true });
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
});

