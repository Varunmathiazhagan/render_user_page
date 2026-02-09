/**
 * NLP Utilities for the KSP Yarns Chatbot
 * Advanced natural language processing functions for improved text matching
 */

// Stopwords - common words that don't add significant meaning
const stopwords = [
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under',
  'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
  'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'i', 'me', 'my', 
  'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they',
  'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
  'those', 'do', 'does', 'did', 'doing', 'have', 'has', 'had', 'having', 'would', 'could', 'should',
  'ought', 'i\'m', 'you\'re', 'he\'s', 'she\'s', 'it\'s', 'we\'re', 'they\'re', 'i\'ve', 'you\'ve',
  'we\'ve', 'they\'ve', 'i\'d', 'you\'d', 'he\'d', 'she\'d', 'we\'d', 'they\'d', 'i\'ll', 'you\'ll',
  'he\'ll', 'she\'ll', 'we\'ll', 'they\'ll', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 'hasn\'t',
  'haven\'t', 'hadn\'t', 'doesn\'t', 'don\'t', 'didn\'t', 'won\'t', 'wouldn\'t', 'shan\'t', 'shouldn\'t',
  'can\'t', 'cannot', 'couldn\'t', 'mustn\'t', 'let\'s', 'that\'s', 'who\'s', 'what\'s', 'here\'s',
  'there\'s', 'when\'s', 'where\'s', 'why\'s', 'how\'s'
];

// Comprehensive synonym mapping for better matching
const synonyms = {
  'buy': ['purchase', 'order', 'get', 'acquire', 'procure', 'shop'],
  'price': ['cost', 'rate', 'pricing', 'fee', 'charge', 'quote', 'value'],
  'cheap': ['affordable', 'budget', 'economical', 'inexpensive', 'low-cost'],
  'expensive': ['costly', 'premium', 'high-end', 'pricey'],
  'good': ['quality', 'excellent', 'great', 'superior', 'fine', 'best'],
  'bad': ['poor', 'inferior', 'defective', 'faulty', 'substandard'],
  'fast': ['quick', 'rapid', 'speedy', 'express', 'urgent', 'swift'],
  'slow': ['delayed', 'late', 'prolonged'],
  'help': ['assist', 'support', 'aid', 'guide', 'service'],
  'contact': ['reach', 'call', 'email', 'message', 'connect', 'speak'],
  'ship': ['deliver', 'send', 'dispatch', 'transport', 'courier'],
  'return': ['refund', 'exchange', 'replace', 'give back', 'send back'],
  'cancel': ['stop', 'abort', 'terminate', 'end', 'revoke'],
  'yarn': ['thread', 'fiber', 'fibre', 'string', 'textile'],
  'cotton': ['natural fiber', 'plant fiber'],
  'polyester': ['synthetic', 'poly', 'pet fiber'],
  'blend': ['mix', 'combination', 'composite', 'hybrid'],
  'eco': ['sustainable', 'green', 'environmental', 'eco-friendly', 'organic'],
  'recycle': ['recycled', 'reuse', 'repurpose', 'upcycle'],
  'thick': ['coarse', 'heavy', 'bulky', 'dense'],
  'thin': ['fine', 'light', 'delicate', 'lightweight'],
  'strong': ['durable', 'sturdy', 'tough', 'resilient', 'robust'],
  'soft': ['smooth', 'gentle', 'tender', 'comfortable'],
  'color': ['colour', 'shade', 'dye', 'hue', 'tint', 'tone'],
  'info': ['information', 'details', 'data', 'specs', 'specifications'],
  'company': ['business', 'firm', 'organization', 'enterprise', 'manufacturer'],
  'work': ['operate', 'function', 'run', 'perform'],
  'make': ['produce', 'manufacture', 'create', 'fabricate'],
  'use': ['utilize', 'apply', 'employ', 'purpose', 'application'],
  'sample': ['swatch', 'test', 'trial', 'demo', 'specimen'],
  'quantity': ['amount', 'volume', 'number', 'bulk', 'lot'],
  'discount': ['offer', 'deal', 'sale', 'reduction', 'savings', 'promotion']
};

// Common spelling mistakes and their corrections
const spellingCorrections = {
  'cancle': 'cancel', 'cancell': 'cancel', 'canel': 'cancel', 'cncel': 'cancel',
  'cacnel': 'cancel', 'cancellation': 'cancel', 'cancle': 'cancel',
  'oredr': 'order', 'ordr': 'order', 'oder': 'order', 'ordder': 'order', 'oerder': 'order',
  'refnd': 'refund', 'refudn': 'refund', 'rfund': 'refund', 'refaund': 'refund',
  'retrun': 'return', 'retrn': 'return', 'reutrn': 'return', 'retunr': 'return',
  'shiping': 'shipping', 'shippping': 'shipping', 'shpping': 'shipping',
  'delivry': 'delivery', 'deliverry': 'delivery', 'delvery': 'delivery',
  'pric': 'price', 'prise': 'price', 'pirce': 'price',
  'prodict': 'product', 'prodct': 'product', 'proudct': 'product',
  'cottan': 'cotton', 'coton': 'cotton', 'cottton': 'cotton',
  'poylester': 'polyester', 'polyster': 'polyester', 'polester': 'polyester',
  'qualty': 'quality', 'qulity': 'quality', 'qualiy': 'quality',
  'certifcate': 'certificate', 'certifiate': 'certificate', 'certificat': 'certificate',
  'sustainble': 'sustainable', 'sustainabel': 'sustainable', 'sustainibility': 'sustainability',
  'recyceld': 'recycled', 'recyclled': 'recycled', 'recyled': 'recycled',
  'orgainc': 'organic', 'orgnaic': 'organic', 'orgnic': 'organic',
  'yran': 'yarn', 'yarrn': 'yarn', 'yern': 'yarn',
  'conatct': 'contact', 'contct': 'contact', 'conact': 'contact',
  'adress': 'address', 'addres': 'address', 'addrss': 'address',
  'pament': 'payment', 'paymnt': 'payment', 'payemnt': 'payment',
  'accont': 'account', 'acount': 'account', 'acconut': 'account',
  'specifcation': 'specification', 'specfication': 'specification',
  'manufacturr': 'manufacturer', 'manifacturer': 'manufacturer',
  'thnks': 'thanks', 'thanx': 'thanks', 'thx': 'thanks',
  'plz': 'please', 'pls': 'please', 'pleas': 'please',
  'msg': 'message', 'messge': 'message',
  'qty': 'quantity', 'quantiy': 'quantity', 'quantitiy': 'quantity',
  'wht': 'what', 'whats': 'what is', 'whts': 'what is',
  'hw': 'how', 'hwo': 'how',
  'ur': 'your', 'u': 'you', 'r': 'are',
  'bcoz': 'because', 'coz': 'because', 'bcz': 'because',
  'abt': 'about', 'bt': 'but',
  'n': 'and', 'nd': 'and'
};

// Sentiment indicators for understanding user mood
const sentimentIndicators = {
  positive: ['great', 'good', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 
             'love', 'happy', 'pleased', 'satisfied', 'thanks', 'thank', 'appreciate', 
             'helpful', 'awesome', 'best', 'nice', 'brilliant', 'superb'],
  negative: ['bad', 'poor', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'angry',
             'disappointed', 'frustrated', 'annoyed', 'upset', 'unhappy', 'dissatisfied',
             'problem', 'issue', 'wrong', 'broken', 'defective', 'complaint', 'fail'],
  urgent: ['urgent', 'immediately', 'asap', 'emergency', 'critical', 'now', 'quickly',
           'fast', 'hurry', 'rush', 'priority', 'important']
};

// Correct spelling in text
export const correctSpelling = (text) => {
  if (!text) return text;
  let corrected = text.toLowerCase();
  
  // Replace each misspelled word
  for (const [wrong, right] of Object.entries(spellingCorrections)) {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
    corrected = corrected.replace(regex, right);
  }
  
  return corrected;
};

// Expand text with synonyms for better matching
export const expandWithSynonyms = (tokens) => {
  const expanded = [...tokens];
  
  tokens.forEach(token => {
    // Check if token is a key in synonyms
    if (synonyms[token]) {
      expanded.push(...synonyms[token]);
    }
    // Check if token is a value in synonyms
    for (const [key, values] of Object.entries(synonyms)) {
      if (values.includes(token) && !expanded.includes(key)) {
        expanded.push(key);
      }
    }
  });
  
  return [...new Set(expanded)]; // Remove duplicates
};

// Analyze sentiment of text
export const analyzeSentiment = (text) => {
  if (!text) return { score: 0, label: 'neutral', isUrgent: false };
  
  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  let isUrgent = false;
  
  sentimentIndicators.positive.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  sentimentIndicators.negative.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  sentimentIndicators.urgent.forEach(word => {
    if (lowerText.includes(word)) isUrgent = true;
  });
  
  const score = positiveCount - negativeCount;
  let label = 'neutral';
  if (score > 0) label = 'positive';
  else if (score < 0) label = 'negative';
  
  return { score, label, isUrgent, positiveCount, negativeCount };
};

// Calculate Levenshtein distance for fuzzy matching
export const levenshteinDistance = (str1, str2) => {
  const m = str1.length;
  const n = str2.length;
  
  if (m === 0) return n;
  if (n === 0) return m;
  
  const matrix = Array(m + 1).fill(null).map(() => Array(n + 1).fill(null));
  
  for (let i = 0; i <= m; i++) matrix[i][0] = i;
  for (let j = 0; j <= n; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[m][n];
};

// Fuzzy match with Levenshtein distance
export const fuzzyMatchWord = (word1, word2, threshold = 0.3) => {
  if (!word1 || !word2) return false;
  
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();
  
  if (w1 === w2) return true;
  if (w1.includes(w2) || w2.includes(w1)) return true;
  
  const distance = levenshteinDistance(w1, w2);
  const maxLength = Math.max(w1.length, w2.length);
  const similarity = 1 - (distance / maxLength);
  
  return similarity >= (1 - threshold);
};

// Enhanced stemmer - converts words to their root form with more rules
const stemWord = (word) => {
  if (!word || word.length < 3) return word;
  word = word.toLowerCase();
  
  // Irregular words mapping
  const irregulars = {
    'bought': 'buy', 'bought': 'buy', 'purchasing': 'purchase',
    'shipping': 'ship', 'shipped': 'ship', 'ships': 'ship',
    'ordering': 'order', 'ordered': 'order', 'orders': 'order',
    'cancelled': 'cancel', 'cancelling': 'cancel', 'cancels': 'cancel',
    'returned': 'return', 'returning': 'return', 'returns': 'return',
    'refunded': 'refund', 'refunding': 'refund', 'refunds': 'refund',
    'manufactured': 'manufacture', 'manufacturing': 'manufacture',
    'certified': 'certify', 'certifying': 'certify', 'certifies': 'certify',
    'produced': 'produce', 'producing': 'produce', 'produces': 'produce',
    'delivered': 'deliver', 'delivering': 'deliver', 'delivers': 'deliver',
    'contacted': 'contact', 'contacting': 'contact', 'contacts': 'contact',
    'running': 'run', 'ran': 'run',
    'better': 'good', 'best': 'good',
    'worse': 'bad', 'worst': 'bad',
    'companies': 'company', 'factories': 'factory',
    'yarns': 'yarn', 'threads': 'thread', 'fibers': 'fiber', 'fibres': 'fiber',
    'qualities': 'quality', 'quantities': 'quantity'
  };
  
  if (irregulars[word]) return irregulars[word];
  
  // Handle common suffixes with better rules
  if (word.endsWith('ation') && word.length > 6) {
    // certification -> certif
    return word.slice(0, -5);
  } else if (word.endsWith('ment') && word.length > 6) {
    // shipment -> ship
    return word.slice(0, -4);
  } else if (word.endsWith('ness') && word.length > 5) {
    // softness -> soft
    return word.slice(0, -4);
  } else if (word.endsWith('able') || word.endsWith('ible')) {
    // sustainable -> sustain
    return word.slice(0, -4);
  } else if (word.endsWith('ity') && word.length > 5) {
    // quality -> qual
    return word.slice(0, -3);
  } else if (word.endsWith('ive') && word.length > 5) {
    // productive -> product
    return word.slice(0, -3);
  } else if (word.endsWith('ful') && word.length > 5) {
    // helpful -> help
    return word.slice(0, -3);
  } else if (word.endsWith('less') && word.length > 6) {
    // careless -> care
    return word.slice(0, -4);
  } else if (word.endsWith('ing') && word.length > 4) {
    // If ends with double consonant + ing, keep one consonant
    const base = word.slice(0, -3);
    if (base.length > 1 && base[base.length - 1] === base[base.length - 2]) {
      return base.slice(0, -1);
    }
    return base;
  } else if (word.endsWith('ly') && word.length > 4) {
    return word.slice(0, -2);
  } else if (word.endsWith('ies') && word.length > 4) {
    return word.slice(0, -3) + 'y';
  } else if (word.endsWith('es') && word.length > 4) {
    // Special case: boxes -> box, but not processes -> process
    if (word.endsWith('ches') || word.endsWith('shes') || word.endsWith('sses') || word.endsWith('xes') || word.endsWith('zes')) {
      return word.slice(0, -2);
    }
    return word.slice(0, -1);
  } else if (word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us') && !word.endsWith('is') && word.length > 3) {
    return word.slice(0, -1);
  } else if (word.endsWith('ed') && word.length > 4) {
    // If ends with double consonant + ed, keep one consonant
    const base = word.slice(0, -2);
    if (base.length > 1 && base[base.length - 1] === base[base.length - 2]) {
      return base.slice(0, -1);
    }
    // Handle -ied -> -y
    if (word.endsWith('ied')) {
      return word.slice(0, -3) + 'y';
    }
    return base;
  } else if (word.endsWith('er') && word.length > 4) {
    return word.slice(0, -2);
  } else if (word.endsWith('est') && word.length > 5) {
    return word.slice(0, -3);
  }
  
  return word;
};

// Tokenize text into words, remove stopwords, and apply stemming
export const preprocessText = (text, options = {}) => {
  if (!text) return [];
  
  const { expandSynonyms = false, correctSpellings = true } = options;
  
  // Apply spelling correction first
  let processedText = correctSpellings ? correctSpelling(text) : text.toLowerCase();
  
  // Remove special characters but keep hyphens in compound words
  const cleanText = processedText.replace(/[^\w\s-]/g, ' ').replace(/-/g, ' ');
  
  // Tokenize into words
  let tokens = cleanText.split(/\s+/).filter(token => token.length > 1);
  
  // Remove stopwords and apply stemming
  tokens = tokens
    .filter(token => !stopwords.includes(token))
    .map(token => stemWord(token));
  
  // Optionally expand with synonyms for better matching
  if (expandSynonyms) {
    tokens = expandWithSynonyms(tokens);
  }
  
  return tokens;
};

// Advanced text preprocessing with more options
export const advancedPreprocess = (text) => {
  if (!text) return { tokens: [], corrected: '', sentiment: null };
  
  const corrected = correctSpelling(text);
  const sentiment = analyzeSentiment(text);
  const tokens = preprocessText(corrected, { expandSynonyms: true, correctSpellings: false });
  
  return { tokens, corrected, sentiment };
};

// Calculate TF (Term Frequency) for a term in a document
const calculateTF = (term, document) => {
  const termFrequency = document.filter(word => word === term).length;
  return termFrequency / document.length;
};

// Calculate cosine similarity between two documents (vectors)
const cosineSimilarity = (docA, docB) => {
  const termsA = [...new Set(docA)];
  const termsB = [...new Set(docB)];
  const allTerms = [...new Set([...termsA, ...termsB])];
  
  // Create term frequency vectors with TF-IDF weighting
  const vectorA = allTerms.map(term => calculateTF(term, docA));
  const vectorB = allTerms.map(term => calculateTF(term, docB));
  
  // Calculate dot product
  let dotProduct = 0;
  for (let i = 0; i < allTerms.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
  }
  
  // Calculate magnitudes
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));
  
  // Handle edge case
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  // Return cosine similarity
  return dotProduct / (magnitudeA * magnitudeB);
};

// Calculate Jaccard similarity for additional matching
const jaccardSimilarity = (setA, setB) => {
  const intersection = setA.filter(item => setB.includes(item));
  const union = [...new Set([...setA, ...setB])];
  
  if (union.length === 0) return 0;
  return intersection.length / union.length;
};

// Calculate semantic similarity between two texts
export const calculateSimilarity = (textA, textB) => {
  // Preprocess both texts
  const tokensA = preprocessText(textA);
  const tokensB = preprocessText(textB);
  
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  
  // Calculate both cosine and Jaccard similarities
  const cosineSim = cosineSimilarity(tokensA, tokensB);
  const jaccardSim = jaccardSimilarity(tokensA, tokensB);
  
  // Weighted combination (cosine is more important for semantic similarity)
  return (cosineSim * 0.7) + (jaccardSim * 0.3);
};

// Find the best match in a set of documents for a query
export const findBestMatch = (query, documents, threshold = 0.2) => {
  if (!query || !documents || documents.length === 0) return null;
  
  const processedQuery = preprocessText(query);
  
  // Calculate similarity scores for each document
  const scores = documents.map(doc => ({
    document: doc,
    similarity: calculateSimilarity(processedQuery, doc.text || doc.keywords?.join(' ') || '')
  }));
  
  // Sort by similarity score (descending)
  scores.sort((a, b) => b.similarity - a.similarity);
  
  // Return the best match if it meets the threshold
  return scores[0].similarity >= threshold ? scores[0].document : null;
};

// Extract entities from text (e.g., product names, numbers, dates)
export const extractEntities = (text) => {
  const entities = {
    products: [],
    yarnTypes: [],
    counts: [],
    numbers: [],
    dates: [],
    locations: [],
    colors: [],
    certifications: []
  };
  
  if (!text) return entities;
  
  // Extract yarn counts (Ne patterns)
  const countPattern = /\b(ne|count)\s*(\d+)\s*(to|-)?\s*(\d+)?\b/gi;
  const countMatches = text.match(countPattern) || [];
  entities.counts = countMatches.map(match => match.trim());
  
  // Extract numbers (including those with units)
  const numberPattern = /\b\d+(\.\d+)?\s*(kg|g|ton|tons|mm|cm|m|inch|inches|yards|counts?)?\b/gi;
  const numberMatches = text.match(numberPattern) || [];
  entities.numbers = numberMatches.map(match => match.trim());
  
  // Extract dates
  const datePattern = /\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:\s+\d{2,4})?)\b/gi;
  entities.dates = text.match(datePattern) || [];
  
  // Extract yarn types with more specificity
  const yarnTypes = [
    'cotton', 'polyester', 'blended', 'blend', 'recycled', 'organic', 
    'vortex', 'ring spun', 'ring-spun', 'open end', 'open-end', 'oe yarn',
    'combed cotton', 'carded cotton', 'melange', 'mélange', 'slub',
    'fancy yarn', 'core-spun', 'textured', 'virgin polyester',
    'poly-cotton', 'cotton-viscose', 'viscose'
  ];
  yarnTypes.forEach(type => {
    if (text.toLowerCase().includes(type)) {
      entities.yarnTypes.push(type);
    }
  });
  
  // Extract product categories
  const products = ['yarn', 'yarns', 'thread', 'fiber', 'fibre', 'textile'];
  products.forEach(product => {
    if (text.toLowerCase().includes(product)) {
      entities.products.push(product);
    }
  });
  
  // Extract locations
  const locations = ['india', 'karur', 'tamil nadu', 'sukkaliyur', 'gandhi nagar'];
  locations.forEach(location => {
    if (text.toLowerCase().includes(location)) {
      entities.locations.push(location);
    }
  });
  
  // Extract colors
  const colors = [
    'white', 'black', 'red', 'blue', 'green', 'yellow', 'pink', 'grey', 'gray',
    'brown', 'orange', 'purple', 'maroon', 'navy', 'lavender', 'rose'
  ];
  colors.forEach(color => {
    if (text.toLowerCase().includes(color)) {
      entities.colors.push(color);
    }
  });
  
  // Extract certifications
  const certifications = ['gots', 'grs', 'oeko-tex', 'iso', 'iso 9001', 'iso 14001'];
  certifications.forEach(cert => {
    if (text.toLowerCase().includes(cert)) {
      entities.certifications.push(cert);
    }
  });
  
  return entities;
};

// Function to detect intent from user input with enhanced confidence scoring
export const detectIntent = (text) => {
  if (!text) return { name: 'general', confidence: 0, secondary: null };
  
  const lowerText = correctSpelling(text.toLowerCase());
  
  // Enhanced intent patterns with priority scoring and multiple match bonuses
  const intentPatterns = {
    greeting: {
      patterns: [
        /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|sup|hiya|yo)\b/i,
        /^(what'?s up|how are you|how'?s it going)/i
      ],
      priority: 10,
      keywords: ['hello', 'hi', 'hey', 'morning', 'afternoon', 'evening']
    },
    farewell: {
      patterns: [
        /^(bye|goodbye|see you|farewell|have a good day|talk to you later|catch you later|take care)\b/i,
        /\b(gotta go|got to go|leaving now|signing off)\b/i
      ],
      priority: 10,
      keywords: ['bye', 'goodbye', 'farewell', 'later']
    },
    information: {
      patterns: [
        /^(what|how|which|where|when|why|who|can you tell)\b/i,
        /tell me (about|more)|can you explain|i need to know|i want to know|i'm looking for|looking for/i,
        /about your company|about ksp|company details|company information/i,
        /do you (have|offer|provide|sell|make|manufacture)/i,
        /\b(learn|know|understand|find out|discover)\b.*\b(about|more)\b/i
      ],
      priority: 8,
      keywords: ['what', 'how', 'tell', 'explain', 'about', 'info', 'information', 'details']
    },
    purchase: {
      patterns: [
        /\b(buy|purchase|order|ordering|checkout|cart|payment|pay for|shop)\b/i,
        /\b(price|pricing|cost|costs|how much|rate|rates|quote|quotation|estimate)\b/i,
        /i want to (buy|purchase|order|get|place)/i,
        /place an order|make an order|submit order/i,
        /\b(moq|minimum order|bulk order|wholesale)\b/i,
        /add to cart|proceed to checkout/i
      ],
      priority: 9,
      keywords: ['buy', 'purchase', 'order', 'price', 'cost', 'quote', 'payment', 'checkout', 'moq']
    },
    complaint: {
      patterns: [
        /\b(complaint|complain|issue|problem|trouble|difficulty|concern)\b/i,
        /not (happy|satisfied|working|good|pleased)|dissatisfied|disappointed/i,
        /\b(poor|bad|terrible|awful|horrible|worst|unacceptable)\b/i,
        /\b(damaged|defective|broken|wrong|incorrect|missing|late|delayed)\b/i,
        /\b(frustrated|annoyed|upset|angry)\b/i,
        /what went wrong|something's wrong|doesn't work/i
      ],
      priority: 9,
      keywords: ['problem', 'issue', 'complaint', 'damaged', 'wrong', 'bad', 'frustrated']
    },
    gratitude: {
      patterns: [
        /\b(thanks|thank you|thx|ty|appreciate|grateful|helpful)\b/i,
        /\b(great help|very helpful|much appreciated|cheers)\b/i
      ],
      priority: 10,
      keywords: ['thanks', 'thank', 'appreciate', 'grateful', 'helpful']
    },
    cancellation: {
      patterns: [
        /\b(cancel|cancellation|refund|return|stop order)\b/i,
        /(don't|do not|dont) want|changed my mind|no longer (need|want)/i,
        /\b(exchange|send back|give back|money back)\b/i,
        /want (my money back|to cancel|to return)/i
      ],
      priority: 9,
      keywords: ['cancel', 'refund', 'return', 'exchange', 'money back']
    },
    confirmation: {
      patterns: [
        /^(confirm|verify|check|validate|yes|yep|yeah|sure|right|correct|ok|okay|affirmative|absolutely)\b/i,
        /^(that's right|exactly|precisely|indeed)\b/i,
        /sounds good|works for me|go ahead/i
      ],
      priority: 7,
      keywords: ['yes', 'confirm', 'correct', 'right', 'okay', 'sure']
    },
    negation: {
      patterns: [
        /^(no|nope|nah|not really|don't think so|negative|never)\b/i,
        /^(that's wrong|incorrect|not what i meant)\b/i,
        /not interested|don't need/i
      ],
      priority: 7,
      keywords: ['no', 'nope', 'not', 'never', 'wrong']
    },
    comparison: {
      patterns: [
        /\b(difference|compare|comparison|versus|vs|better|best|prefer)\b/i,
        /which (one|is|are) (better|best|recommended|preferred)/i,
        /\b(pros and cons|advantages|disadvantages)\b/i,
        /should i (choose|pick|select|go with)/i,
        /what's the difference|how does .* compare/i
      ],
      priority: 8,
      keywords: ['difference', 'compare', 'better', 'best', 'versus', 'prefer']
    },
    specification: {
      patterns: [
        /\b(specification|specs|details|technical|parameters|properties|features)\b/i,
        /\b(count|counts|thickness|strength|quality|grade|gsm|denier)\b/i,
        /\b(ne \d+|yarn count|thread count)\b/i,
        /what are the specs|technical details/i
      ],
      priority: 8,
      keywords: ['specification', 'specs', 'technical', 'count', 'quality', 'grade', 'strength']
    },
    shipping: {
      patterns: [
        /\b(ship|shipping|delivery|deliver|dispatch|courier|track|tracking)\b/i,
        /\b(when will|how long|estimated|eta|arrival)\b/i,
        /where is my (order|package|shipment)/i,
        /shipping (cost|rate|time|method)/i
      ],
      priority: 9,
      keywords: ['shipping', 'delivery', 'track', 'dispatch', 'courier', 'arrival']
    },
    sustainability: {
      patterns: [
        /\b(sustainable|sustainability|eco|eco-friendly|green|environment|organic)\b/i,
        /\b(recycled|recyclable|carbon|footprint|ethical)\b/i,
        /\b(gots|grs|oeko-tex|certified organic)\b/i
      ],
      priority: 8,
      keywords: ['sustainable', 'eco', 'organic', 'recycled', 'green', 'environment', 'gots', 'grs']
    },
    samples: {
      patterns: [
        /\b(sample|swatch|trial|test|demo|specimen)\b/i,
        /can i (see|get|try|have) (a |some )?(sample|swatch)/i,
        /before (ordering|buying|purchasing)/i
      ],
      priority: 8,
      keywords: ['sample', 'swatch', 'trial', 'test', 'demo']
    },
    contact: {
      patterns: [
        /\b(contact|reach|call|email|phone|speak|talk)\b/i,
        /how (can|do) i (contact|reach|call|email)/i,
        /\b(customer service|support|helpline|representative)\b/i,
        /want to (speak|talk) (to|with)/i
      ],
      priority: 8,
      keywords: ['contact', 'call', 'email', 'phone', 'support', 'reach']
    }
  };
  
  // Score each intent with multiple factors
  const intentScores = [];
  
  for (const [intent, config] of Object.entries(intentPatterns)) {
    let patternScore = 0;
    let patternMatches = 0;
    let keywordMatches = 0;
    
    // Check pattern matches
    for (const pattern of config.patterns) {
      if (pattern.test(lowerText)) {
        patternMatches++;
        patternScore = config.priority;
      }
    }
    
    // Check keyword matches for additional confidence
    if (config.keywords) {
      for (const keyword of config.keywords) {
        if (lowerText.includes(keyword)) {
          keywordMatches++;
        }
      }
    }
    
    // Calculate combined score
    const keywordBonus = Math.min(keywordMatches * 0.5, 2);
    const multiMatchBonus = patternMatches > 1 ? 1 : 0;
    const finalScore = patternScore + keywordBonus + multiMatchBonus;
    
    if (finalScore > 0) {
      intentScores.push({
        name: intent,
        score: finalScore,
        patternMatches,
        keywordMatches,
        confidence: Math.min(finalScore / 12, 1) // Normalize to 0-1
      });
    }
  }
  
  // Sort by score
  intentScores.sort((a, b) => b.score - a.score);
  
  // Return primary and secondary intent
  const primary = intentScores[0] || { name: 'general', score: 0, confidence: 0 };
  const secondary = intentScores[1] || null;
  
  return {
    name: primary.name,
    confidence: primary.confidence,
    secondary: secondary ? secondary.name : null,
    allIntents: intentScores.slice(0, 3)
  };
};

// Detect question type for better response formatting
export const detectQuestionType = (text) => {
  const lowerText = text.toLowerCase();
  
  if (/^(what|what's|whats)\b/i.test(lowerText)) return 'what';
  if (/^(how|how's|hows)\b/i.test(lowerText)) return 'how';
  if (/^(why)\b/i.test(lowerText)) return 'why';
  if (/^(when|when's)\b/i.test(lowerText)) return 'when';
  if (/^(where|where's)\b/i.test(lowerText)) return 'where';
  if (/^(who|who's)\b/i.test(lowerText)) return 'who';
  if (/^(which)\b/i.test(lowerText)) return 'which';
  if (/^(can|could|would|will|do|does|is|are|have|has)\b/i.test(lowerText)) return 'yes-no';
  if (/\?$/.test(text.trim())) return 'general-question';
  
  return 'statement';
};

// Generate contextual responses based on conversation history with enhanced personalization
export const generateContextualResponse = (query, matchedResponse, conversationContext) => {
  if (!matchedResponse) return null;
  
  const entities = extractEntities(query);
  const sentiment = analyzeSentiment(query);
  const questionType = detectQuestionType(query);
  let customizedResponse = matchedResponse;
  
  // Add empathy for negative sentiment
  if (sentiment.label === 'negative') {
    const empathyPhrases = [
      "I understand your concern. ",
      "I'm sorry to hear that. ",
      "I appreciate you bringing this to our attention. "
    ];
    const randomPhrase = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
    customizedResponse = randomPhrase + customizedResponse;
  }
  
  // Add urgency acknowledgment
  if (sentiment.isUrgent) {
    customizedResponse = "I understand this is urgent. " + customizedResponse;
  }
  
  // Add yarn type specificity if detected
  if (entities.yarnTypes.length > 0) {
    const yarnTypeStr = entities.yarnTypes.join(' and ');
    if (!customizedResponse.toLowerCase().includes(entities.yarnTypes[0].toLowerCase())) {
      customizedResponse = customizedResponse.replace(
        /\b(our yarns|our products|yarns|products)\b/i,
        `our ${yarnTypeStr} $1`
      );
    }
  }
  
  // Add count specificity if detected
  if (entities.counts.length > 0) {
    const countStr = entities.counts.join(', ');
    if (!customizedResponse.includes(countStr)) {
      customizedResponse += ` We offer these in various counts including ${countStr}.`;
    }
  }
  
  // Add color context if mentioned
  if (entities.colors.length > 0) {
    const colorStr = entities.colors.join(', ');
    if (!customizedResponse.toLowerCase().includes('color')) {
      customizedResponse += ` We offer various color options including ${colorStr}.`;
    }
  }
  
  // Add certification context if mentioned
  if (entities.certifications.length > 0) {
    const certStr = entities.certifications.join(', ').toUpperCase();
    if (!customizedResponse.toLowerCase().includes(certStr.toLowerCase())) {
      customizedResponse += ` Our products carry ${certStr} certifications.`;
    }
  }
  
  // Add personalization if we know the user name
  if (conversationContext.userName) {
    // Add name occasionally for personalization
    if (Math.random() > 0.6 && customizedResponse.includes('.')) {
      customizedResponse = customizedResponse.replace(
        /\.\s/,
        `, ${conversationContext.userName}. `
      );
    }
  }
  
  // Handle returning visitors
  if (conversationContext.messageCount > 10 && !customizedResponse.includes('returning')) {
    // Acknowledge repeat interaction occasionally
    if (Math.random() > 0.8) {
      customizedResponse = "Great to continue our conversation! " + customizedResponse;
    }
  }
  
  // Add follow-up suggestion based on question type and context
  if (!customizedResponse.endsWith('?') && conversationContext.lastTopic) {
    const followUpSuggestions = {
      'products': " Would you like to know about pricing or samples?",
      'price': " Would you like information about bulk discounts or placing an order?",
      'shipping': " Would you like to track an existing order?",
      'quality': " Would you like to see our certifications or request samples?",
      'sustainability': " Would you like to know about our recycled yarn options?"
    };
    
    if (followUpSuggestions[conversationContext.lastTopic] && Math.random() > 0.7) {
      customizedResponse += followUpSuggestions[conversationContext.lastTopic];
    }
  }
  
  // Add response based on question type
  if (questionType === 'yes-no' && !customizedResponse.startsWith('Yes') && !customizedResponse.startsWith('No')) {
    // Try to provide a clear yes/no at the start for yes-no questions
    if (/\b(can|could|do|does|is|are|will|would)\b.*\?/i.test(query)) {
      // Check if the response implies yes
      if (/\b(offer|provide|have|available|yes|certainly|absolutely)\b/i.test(customizedResponse)) {
        customizedResponse = "Yes! " + customizedResponse;
      }
    }
  }
  
  return customizedResponse;
};

// Enhanced relevance score calculation with multiple factors
export const calculateRelevanceScore = (query, topic, keywords) => {
  if (!query || !topic) return 0;
  
  // Correct spelling and get tokens
  const correctedQuery = correctSpelling(query);
  const queryTokens = preprocessText(correctedQuery, { expandSynonyms: true });
  const keywordTokens = keywords.flatMap(kw => preprocessText(kw, { expandSynonyms: false }));
  const topicTokens = preprocessText(topic, { expandSynonyms: false });
  
  // Direct keyword match bonus (weighted by position - earlier matches are better)
  let keywordMatchScore = 0;
  let exactMatchBonus = 0;
  
  queryTokens.forEach((token, index) => {
    const positionWeight = 1 - (index * 0.05); // Earlier words weighted more
    
    if (keywordTokens.includes(token)) {
      keywordMatchScore += 0.15 * Math.max(positionWeight, 0.5);
    }
    
    // Exact match in keywords (not stemmed)
    keywords.forEach(kw => {
      if (kw.toLowerCase() === token.toLowerCase()) {
        exactMatchBonus += 0.2;
      }
    });
  });
  
  // Fuzzy matching for typos
  let fuzzyMatchScore = 0;
  queryTokens.forEach(queryToken => {
    keywordTokens.forEach(keywordToken => {
      if (fuzzyMatchWord(queryToken, keywordToken, 0.25)) {
        fuzzyMatchScore += 0.1;
      }
    });
  });
  
  // Topic similarity with synonym expansion
  const expandedQueryTokens = expandWithSynonyms(queryTokens);
  let topicMatchScore = 0;
  expandedQueryTokens.forEach(token => {
    if (topicTokens.some(t => t === token || fuzzyMatchWord(t, token, 0.25))) {
      topicMatchScore += 0.1;
    }
  });
  
  // Cosine similarity for overall semantic match
  const semanticSimilarity = calculateSimilarity(correctedQuery, topic);
  
  // Combined score with weights
  const combinedScore = 
    (semanticSimilarity * 0.3) + 
    (keywordMatchScore * 0.25) + 
    (fuzzyMatchScore * 0.15) + 
    (topicMatchScore * 0.2) + 
    (exactMatchBonus * 0.1);
  
  return Math.min(1.0, combinedScore);
};

// Smart response selector that considers conversation flow
export const selectBestResponse = (scores, conversationContext) => {
  if (!scores || scores.length === 0) return null;
  
  // Adjust scores based on conversation context
  const adjustedScores = scores.map(item => {
    let adjustment = 0;
    
    // Boost topics related to recent conversation
    if (conversationContext.recentTopics && conversationContext.recentTopics.includes(item.topic)) {
      // Small boost for topic continuity
      adjustment += 0.05;
    }
    
    // Slight penalty for repeating the exact same topic
    if (conversationContext.lastTopic === item.topic) {
      adjustment -= 0.02;
    }
    
    return {
      ...item,
      adjustedScore: item.score + adjustment
    };
  });
  
  // Sort by adjusted score
  adjustedScores.sort((a, b) => b.adjustedScore - a.adjustedScore);
  
  return adjustedScores[0];
};

// Generate clarifying question when confidence is low
export const generateClarifyingQuestion = (query, possibleTopics, entities) => {
  const questions = [];
  
  if (possibleTopics.length > 1) {
    const topicNames = possibleTopics.slice(0, 3).map(t => t.topic.replace(/_/g, ' ')).join(', ');
    questions.push(`I found information about ${topicNames}. Which one interests you most?`);
  }
  
  if (entities.yarnTypes.length === 0) {
    questions.push("What type of yarn are you interested in? We offer cotton, polyester, blended, and specialty yarns.");
  }
  
  if (entities.products.length > 0 && entities.counts.length === 0) {
    questions.push("What yarn count (Ne) are you looking for?");
  }
  
  // Return the most relevant clarifying question
  return questions.length > 0 ? questions[0] : null;
};

// Conversation memory utilities
export const updateConversationMemory = (context, newInfo) => {
  return {
    ...context,
    messageCount: (context.messageCount || 0) + 1,
    lastTopic: newInfo.topic || context.lastTopic,
    recentTopics: newInfo.topic 
      ? [newInfo.topic, ...(context.recentTopics || []).slice(0, 4)]
      : context.recentTopics,
    userName: newInfo.userName || context.userName,
    preferences: {
      ...(context.preferences || {}),
      ...(newInfo.preferences || {})
    },
    lastInteraction: new Date().toISOString()
  };
};

// Extract user preferences from conversation
export const extractPreferences = (text, existingPreferences = {}) => {
  const preferences = { ...existingPreferences };
  const lowerText = text.toLowerCase();
  
  // Yarn type preferences
  const yarnTypes = ['cotton', 'polyester', 'blend', 'organic', 'recycled'];
  yarnTypes.forEach(type => {
    if (lowerText.includes(type)) {
      preferences.preferredYarnType = type;
    }
  });
  
  // Usage preferences
  if (/\b(apparel|clothing|garment|fashion)\b/i.test(lowerText)) {
    preferences.usage = 'apparel';
  } else if (/\b(home textile|furnishing|upholstery)\b/i.test(lowerText)) {
    preferences.usage = 'home-textile';
  } else if (/\b(industrial|technical)\b/i.test(lowerText)) {
    preferences.usage = 'industrial';
  }
  
  // Sustainability preference
  if (/\b(eco|sustainable|organic|recycled|green)\b/i.test(lowerText)) {
    preferences.sustainabilityFocused = true;
  }
  
  // Price sensitivity
  if (/\b(cheap|affordable|budget|economical)\b/i.test(lowerText)) {
    preferences.priceConscious = true;
  } else if (/\b(premium|quality|best|high-end)\b/i.test(lowerText)) {
    preferences.qualityFocused = true;
  }
  
  return preferences;
};
