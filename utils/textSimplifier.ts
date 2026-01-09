/**
 * Text Simplification Engine
 * Rule-based text simplification without AI (MVP approach)
 */

// Complex word dictionary (simplified → complex)
const SIMPLE_WORDS: Record<string, string[]> = {
  'use': ['utilize', 'employ', 'leverage'],
  'help': ['assist', 'facilitate', 'enable'],
  'show': ['demonstrate', 'illustrate', 'exhibit'],
  'start': ['commence', 'initiate', 'begin'],
  'end': ['terminate', 'conclude', 'finalize'],
  'make': ['create', 'generate', 'produce'],
  'get': ['obtain', 'acquire', 'retrieve'],
  'need': ['require', 'necessitate'],
  'want': ['desire', 'wish'],
  'try': ['attempt', 'endeavor'],
  'big': ['large', 'substantial', 'considerable'],
  'small': ['minute', 'minimal', 'negligible'],
  'fast': ['rapid', 'swift', 'expeditious'],
  'slow': ['gradual', 'leisurely'],
  'easy': ['simple', 'straightforward', 'uncomplicated'],
  'hard': ['difficult', 'challenging', 'complex'],
  'good': ['excellent', 'superior', 'optimal'],
  'bad': ['poor', 'inadequate', 'substandard'],
  'important': ['significant', 'crucial', 'vital'],
  'change': ['modify', 'alter', 'transform'],
  'fix': ['repair', 'resolve', 'rectify'],
  'tell': ['inform', 'notify', 'communicate'],
  'ask': ['inquire', 'request', 'solicit'],
  'think': ['consider', 'contemplate', 'reflect'],
  'know': ['understand', 'comprehend', 'recognize']
};

// Create reverse lookup (complex → simple)
const COMPLEX_TO_SIMPLE: Record<string, string> = {};
Object.entries(SIMPLE_WORDS).forEach(([simple, complexList]) => {
  complexList.forEach(complex => {
    COMPLEX_TO_SIMPLE[complex.toLowerCase()] = simple;
  });
});

/**
 * Check if an element should be simplified
 */
function shouldSimplifyElement(element: Element): boolean {
  // Skip code blocks, scripts, styles
  const tagName = element.tagName.toLowerCase();
  if (['script', 'style', 'code', 'pre', 'noscript'].includes(tagName)) {
    return false;
  }
  
  // Skip if already processed
  if (element.hasAttribute('data-a11y-simplified')) {
    return false;
  }
  
  // Skip navigation and forms (usually need exact text)
  if (element.closest('nav, form, header, footer')) {
    return false;
  }
  
  return true;
}

/**
 * Split long sentences into shorter ones
 */
function splitLongSentences(text: string, maxLength: number = 20): string {
  const sentences = text.split(/([.!?]+\s+)/);
  const result: string[] = [];
  
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i];
    const punctuation = sentences[i + 1] || '';
    
    if (!sentence) continue;
    
    const words = sentence.trim().split(/\s+/);
    
    if (words.length <= maxLength) {
      result.push(sentence.trim() + punctuation);
    } else {
      // Split into chunks
      let currentChunk: string[] = [];
      for (const word of words) {
        currentChunk.push(word);
        if (currentChunk.length >= maxLength) {
          result.push(currentChunk.join(' ') + '.');
          currentChunk = [];
        }
      }
      if (currentChunk.length > 0) {
        result.push(currentChunk.join(' ') + punctuation);
      }
    }
  }
  
  return result.join(' ');
}

/**
 * Replace complex words with simpler alternatives
 */
function simplifyWords(text: string): string {
  const words = text.split(/(\s+|[.,!?;:])/);
  
  return words.map(word => {
    const lowerWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
    const simple = COMPLEX_TO_SIMPLE[lowerWord];
    
    if (simple && lowerWord.length > 0) {
      // Preserve capitalization
      if (word[0] === word[0].toUpperCase()) {
        return simple.charAt(0).toUpperCase() + simple.slice(1);
      }
      return simple;
    }
    
    return word;
  }).join('');
}

/**
 * Simplify text content
 */
function simplifyText(text: string): string {
  if (!text || text.trim().length === 0) {
    return text;
  }
  
  // Step 1: Replace complex words
  let simplified = simplifyWords(text);
  
  // Step 2: Split long sentences
  simplified = splitLongSentences(simplified, 20);
  
  return simplified;
}

/**
 * Simplify all text nodes in an element
 */
export function simplifyElementText(element: Element): void {
  if (!shouldSimplifyElement(element)) {
    return;
  }
  
  // Mark as processed
  element.setAttribute('data-a11y-simplified', 'true');
  
  // Process text nodes
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        
        // Skip if parent is code, script, style, etc.
        const tagName = parent.tagName.toLowerCase();
        if (['script', 'style', 'code', 'pre', 'noscript'].includes(tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Only process if text is meaningful (not just whitespace)
        if (node.textContent && node.textContent.trim().length > 0) {
          return NodeFilter.FILTER_ACCEPT;
        }
        
        return NodeFilter.FILTER_REJECT;
      }
    }
  );
  
  const textNodes: Text[] = [];
  let node;
  while ((node = walker.nextNode())) {
    if (node instanceof Text) {
      textNodes.push(node);
    }
  }
  
  // Store original element text before any modifications
  if (!element.hasAttribute('data-a11y-original-text')) {
    const originalElementText = element.textContent || '';
    element.setAttribute('data-a11y-original-text', originalElementText);
  }
  
  // Simplify each text node
  textNodes.forEach(textNode => {
    const original = textNode.textContent || '';
    
    // Skip if already processed or no meaningful text
    if (!original.trim() || original.length < 3) {
      return;
    }
    
    const simplified = simplifyText(original);
    
    if (simplified !== original) {
      textNode.textContent = simplified;
    }
  });
}

/**
 * Simplify text on the entire page
 */
export function simplifyPageText(): void {
  // Target main content areas
  const selectors = [
    'article',
    'main',
    '[role="main"]',
    '.content',
    '.post',
    '.article',
    'p',
    'li'
  ];
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      simplifyElementText(element);
    });
  });
}

