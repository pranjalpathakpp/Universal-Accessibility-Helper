/**
 * Cognitive Load Reduction
 * Removes distractions and simplifies page structure
 */

/**
 * Disable auto-playing media
 */
export function disableAutoPlay(): void {
  const videos = document.querySelectorAll<HTMLVideoElement>('video[autoplay]');
  videos.forEach(video => {
    video.removeAttribute('autoplay');
    video.pause();
  });
  
  const audios = document.querySelectorAll<HTMLAudioElement>('audio[autoplay]');
  audios.forEach(audio => {
    audio.removeAttribute('autoplay');
    audio.pause();
  });
  
  // Disable iframes with autoplay
  const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
  iframes.forEach(iframe => {
    const src = iframe.src;
    if (src.includes('autoplay=1') || src.includes('autoplay=true')) {
      iframe.src = src.replace(/autoplay=[^&]+/g, 'autoplay=0');
    }
  });
}

/**
 * Collapse large sections (optional - can be toggled)
 */
export function collapseLargeSections(): void {
  const sections = document.querySelectorAll('section, div.section, div.content-block');
  
  sections.forEach(section => {
    const element = section as HTMLElement;
    const height = element.offsetHeight;
    
    // If section is very tall (> 2000px), make it collapsible
    if (height > 2000 && !element.hasAttribute('data-a11y-collapsed')) {
      element.setAttribute('data-a11y-collapsed', 'false');
      element.style.maxHeight = '1000px';
      element.style.overflow = 'hidden';
      element.style.position = 'relative';
      
      // Add expand button
      const expandBtn = document.createElement('button');
      expandBtn.textContent = 'Show more';
      expandBtn.className = 'a11y-expand-section';
      expandBtn.style.cssText = `
        display: block;
        margin: 10px auto;
        padding: 10px 20px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      `;
      
      expandBtn.addEventListener('click', () => {
        const isCollapsed = element.getAttribute('data-a11y-collapsed') === 'true';
        if (isCollapsed) {
          element.style.maxHeight = 'none';
          expandBtn.textContent = 'Show less';
          element.setAttribute('data-a11y-collapsed', 'false');
        } else {
          element.style.maxHeight = '1000px';
          expandBtn.textContent = 'Show more';
          element.setAttribute('data-a11y-collapsed', 'true');
        }
      });
      
      element.appendChild(expandBtn);
    }
  });
}

/**
 * Highlight key sentences (first sentence of paragraphs)
 */
export function highlightKeySentences(): void {
  const paragraphs = document.querySelectorAll('p');
  
  paragraphs.forEach(p => {
    if (p.hasAttribute('data-a11y-highlighted')) return;
    
    const text = p.textContent || '';
    const firstSentence = text.split(/[.!?]/)[0];
    
    if (firstSentence.length > 20 && firstSentence.length < 200) {
      const span = document.createElement('span');
      span.textContent = firstSentence;
      span.className = 'a11y-key-sentence';
      span.style.cssText = `
        font-weight: 600;
        background: rgba(255, 255, 0, 0.2);
        padding: 2px 4px;
        border-radius: 2px;
      `;
      
      // Replace first sentence in paragraph
      const rest = text.substring(firstSentence.length);
      p.innerHTML = span.outerHTML + rest;
      p.setAttribute('data-a11y-highlighted', 'true');
    }
  });
}

/**
 * Reduce visual clutter (more conservative approach)
 */
export function reduceClutter(): void {
  // Only hide clearly decorative elements, be more conservative
  const decorativeSelectors = [
    '[role="presentation"][aria-hidden="true"]', // Only if both attributes
    '.advertisement:not([role="main"]):not([role="article"])', // Ads but not main content
    '[class*="ad-"]:not([class*="admin"]):not([class*="add"])', // Ad classes but not admin/add
  ];
  
  decorativeSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const htmlEl = el as HTMLElement;
        // Only hide if it's clearly not important content
        const isInMainContent = htmlEl.closest('main, article, [role="main"], [role="article"]');
        if (!isInMainContent && !htmlEl.hasAttribute('data-a11y-hidden')) {
          htmlEl.setAttribute('data-a11y-hidden', 'true');
          htmlEl.style.display = 'none';
        }
      });
    } catch (e) {
      // Ignore
    }
  });
}

/**
 * Apply all cognitive load reduction features
 */
export function applyCognitiveReduction(): void {
  disableAutoPlay();
  reduceClutter();
  // Note: collapseLargeSections and highlightKeySentences are optional
  // and can be enabled per profile
}

/**
 * Remove cognitive load reductions
 */
export function removeCognitiveReduction(): void {
  // Restore hidden elements
  const hidden = document.querySelectorAll('[data-a11y-hidden="true"]');
  hidden.forEach(el => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.display = '';
    htmlEl.style.removeProperty('display');
    htmlEl.removeAttribute('data-a11y-hidden');
  });
  
  // Remove collapsed sections
  const collapsed = document.querySelectorAll('[data-a11y-collapsed]');
  collapsed.forEach(el => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.maxHeight = '';
    htmlEl.style.overflow = '';
    htmlEl.style.position = '';
    htmlEl.style.removeProperty('max-height');
    htmlEl.style.removeProperty('overflow');
    htmlEl.style.removeProperty('position');
    htmlEl.removeAttribute('data-a11y-collapsed');
    
    const expandBtn = htmlEl.querySelector('.a11y-expand-section');
    if (expandBtn) {
      expandBtn.remove();
    }
  });
  
  // Remove highlights and restore original text
  const highlighted = document.querySelectorAll('[data-a11y-highlighted]');
  highlighted.forEach(el => {
    const originalText = el.getAttribute('data-a11y-original-text');
    if (originalText) {
      el.textContent = originalText;
      el.removeAttribute('data-a11y-original-text');
    }
    el.removeAttribute('data-a11y-highlighted');
    
    // Remove highlight spans
    const highlightSpans = el.querySelectorAll('.a11y-key-sentence');
    highlightSpans.forEach(span => span.remove());
  });
  
  // Restore auto-play videos/audio
  const videos = document.querySelectorAll<HTMLVideoElement>('video');
  videos.forEach(video => {
    // Don't restore autoplay if it wasn't there originally
    // Just ensure it's not paused if it should play
  });
}

