import { useState, useEffect } from 'react';
import { FiX, FiStar, FiShare2, FiHeart } from 'react-icons/fi';
import './ViralityPrompt.css';

interface ViralityPromptProps {
  usageCount: number;
  onDismiss: () => void;
}

export default function ViralityPrompt({ usageCount, onDismiss }: ViralityPromptProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show prompt after 3-4 uses
    if (usageCount >= 3 && usageCount <= 5) {
      const dismissed = localStorage.getItem('a11y-virality-dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    }
  }, [usageCount]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('a11y-virality-dismissed', 'true');
    onDismiss();
  };

  const handleRate = () => {
    // Open Chrome Web Store - user can search for the extension
    chrome.tabs.create({
      url: `https://chrome.google.com/webstore/search/universal%20accessibility%20helper`
    });
    handleDismiss();
  };

  const handleShare = () => {
    const shareText = "Check out this accessibility extension that helps make the web more accessible! Built for users with visual, cognitive, and reading needs. 🌍";
    const shareUrl = "https://chrome.google.com/webstore/search/universal%20accessibility%20helper";
    const fullText = `${shareText}\n\nFind it here: ${shareUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Universal Accessibility Helper',
        text: shareText,
        url: shareUrl
      }).catch(() => {
        // Fallback if share fails
        copyToClipboard(fullText);
      });
    } else {
      // Fallback: copy to clipboard
      copyToClipboard(fullText);
    }
    handleDismiss();
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        // Show temporary feedback
        const btn = document.querySelector('.virality-btn-secondary');
        if (btn) {
          const originalText = btn.textContent;
          (btn as HTMLElement).textContent = 'Copied!';
          setTimeout(() => {
            (btn as HTMLElement).textContent = originalText;
          }, 2000);
        }
      });
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="virality-prompt">
      <button className="virality-close" onClick={handleDismiss} aria-label="Close">
        <FiX size={14} />
      </button>
      <div className="virality-content">
        <div className="virality-icon">
          <FiHeart size={20} />
        </div>
        <div className="virality-text">
          <p className="virality-title">If this helped you, ⭐ rate us</p>
          <p className="virality-subtitle">Your support helps us reach more people who need accessibility tools</p>
        </div>
      </div>
      <div className="virality-actions">
        <button className="virality-btn virality-btn-primary" onClick={handleRate}>
          <FiStar size={16} />
          Rate Us
        </button>
        <button className="virality-btn virality-btn-secondary" onClick={handleShare}>
          <FiShare2 size={16} />
          Share
        </button>
      </div>
    </div>
  );
}
