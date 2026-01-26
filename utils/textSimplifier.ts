const SIMPLE_WORDS: Record<string, string[]> = {
  'use': ['utilize', 'employ', 'leverage', 'harness'],
  'help': ['assist', 'facilitate', 'enable', 'aid', 'support'],
  'find': ['locate', 'discover', 'identify'],
  'show': ['demonstrate', 'illustrate', 'exhibit', 'display', 'present'],
  'start': ['commence', 'initiate', 'begin', 'launch'],
  'end': ['terminate', 'conclude', 'finalize', 'finish', 'complete'],
  'make': ['create', 'generate', 'produce', 'construct', 'build'],
  'get': ['obtain', 'acquire', 'retrieve', 'receive', 'fetch'],
  'need': ['require', 'necessitate', 'demand'],
  'want': ['desire', 'wish', 'prefer'],
  'try': ['attempt', 'endeavor', 'strive'],
  'big': ['large', 'substantial', 'considerable', 'massive', 'huge'],
  'small': ['minute', 'minimal', 'negligible', 'tiny', 'little'],
  'fast': ['rapid', 'swift', 'expeditious', 'quick', 'speedy'],
  'slow': ['gradual', 'leisurely', 'sluggish'],
  'easy': ['simple', 'straightforward', 'uncomplicated', 'effortless'],
  'hard': ['difficult', 'challenging', 'complex', 'tough'],
  'good': ['excellent', 'superior', 'optimal', 'great', 'fine'],
  'bad': ['poor', 'inadequate', 'substandard', 'terrible'],
  'important': ['significant', 'crucial', 'vital', 'essential', 'key'],
  'change': ['modify', 'alter', 'transform', 'adjust'],
  'fix': ['repair', 'resolve', 'rectify', 'correct'],
  'tell': ['inform', 'notify', 'communicate', 'explain'],
  'ask': ['inquire', 'request', 'solicit', 'question'],
  'think': ['consider', 'contemplate', 'reflect', 'ponder'],
  'know': ['understand', 'comprehend', 'recognize', 'realize'],
  'give': ['provide', 'supply', 'offer', 'deliver'],
  'take': ['accept', 'receive', 'acquire'],
  'come': ['arrive', 'approach', 'reach'],
  'go': ['depart', 'leave', 'exit'],
  'see': ['view', 'observe', 'notice', 'perceive'],
  'say': ['state', 'declare', 'express', 'mention'],
  'do': ['perform', 'execute', 'accomplish', 'complete'],
  'have': ['possess', 'own', 'contain'],
  'keep': ['maintain', 'preserve', 'retain'],
  'let': ['allow', 'permit', 'enable'],
  'put': ['place', 'position', 'set'],
  'set': ['establish', 'configure', 'arrange'],
  'run': ['operate', 'execute', 'function'],
  'work': ['function', 'operate', 'perform'],
  'call': ['contact', 'phone', 'reach'],
  'look': ['examine', 'inspect', 'view'],
  'feel': ['sense', 'perceive', 'experience'],
  'seem': ['appear', 'look'],
  'leave': ['depart', 'exit', 'go'],
  'bring': ['carry', 'transport', 'deliver'],
  'happen': ['occur', 'take place', 'transpire'],
  'write': ['compose', 'create', 'draft'],
  'sit': ['position', 'place'],
  'stand': ['remain', 'stay'],
  'lose': ['misplace', 'forfeit'],
  'talk': ['speak', 'discuss', 'converse'],
  'move': ['relocate', 'shift', 'transfer'],
  'live': ['reside', 'dwell', 'inhabit'],
  'believe': ['think', 'trust', 'accept'],
  'hold': ['grasp', 'keep', 'maintain']
};


const COMPLEX_TO_SIMPLE: Record<string, string> = {};
Object.entries(SIMPLE_WORDS).forEach(([simple, complexList]) => {
  complexList.forEach(complex => {
    COMPLEX_TO_SIMPLE[complex.toLowerCase()] = simple;
  });
});

function shouldSimplifyElement(element: Element): boolean {
  
  const tagName = element.tagName.toLowerCase();
  if (['script', 'style', 'code', 'pre', 'noscript'].includes(tagName)) {
    return false;
  }

  if (element.hasAttribute('data-a11y-simplified')) {
    return false;
  }

  if (element.closest('nav, form, header, footer')) {
    return false;
  }
  
  return true;
}

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

function simplifyWords(text: string): string {
  const words = text.split(/(\s+|[.,!?;:])/);
  
  return words.map(word => {
    const lowerWord = word.toLowerCase().replace(/[.,!?;:]/g, '');
    const simple = COMPLEX_TO_SIMPLE[lowerWord];
    
    if (simple && lowerWord.length > 0) {
      
      if (word[0] === word[0].toUpperCase()) {
        return simple.charAt(0).toUpperCase() + simple.slice(1);
      }
      return simple;
    }
    
    return word;
  }).join('');
}

function simplifyText(text: string): string {
  if (!text || text.trim().length === 0) {
    return text;
  }
  
  let simplified = simplifyWords(text);
 
  simplified = splitLongSentences(simplified, 20);
  
  return simplified;
}

export function simplifyElementText(element: Element): void {
  if (!shouldSimplifyElement(element)) {
    return;
  }
  
  element.setAttribute('data-a11y-simplified', 'true');

  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        
        
        const tagName = parent.tagName.toLowerCase();
        if (['script', 'style', 'code', 'pre', 'noscript'].includes(tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        
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
 
  if (!element.hasAttribute('data-a11y-original-text')) {
    const originalElementText = element.textContent || '';
    element.setAttribute('data-a11y-original-text', originalElementText);
  }
  
  
  textNodes.forEach(textNode => {
    const original = textNode.textContent || '';
 
    if (!original.trim() || original.length < 3) {
      return;
    }
    
    const simplified = simplifyText(original);
    
    if (simplified !== original) {
      textNode.textContent = simplified;
    }
  });
}

export function simplifyPageText(): void {
  
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

