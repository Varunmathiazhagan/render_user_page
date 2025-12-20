/**
 * NLP Utilities for the KSP Yarns Chatbot
 * Lightweight natural language processing functions for improved text matching
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

// Simple stemmer - converts words to their root form
const stemWord = (word) => {
  word = word.toLowerCase();
  
  // Handle common suffixes
  if (word.endsWith('ing')) {
    // dancing -> danc
    return word.slice(0, -3);
  } else if (word.endsWith('ly')) {
    // quickly -> quick
    return word.slice(0, -2);
  } else if (word.endsWith('ies')) {
    // companies -> compani
    return word.slice(0, -3) + 'y';
  } else if (word.endsWith('es')) {
    // boxes -> box
    return word.slice(0, -2);
  } else if (word.endsWith('s') && !word.endsWith('ss')) {
    // cats -> cat, but not pass -> pas
    return word.slice(0, -1);
  } else if (word.endsWith('ed') && word.length > 4) {
    // jumped -> jump
    return word.slice(0, -2);
  }
  
  return word;
};

// Tokenize text into words, remove stopwords, and apply stemming
export const preprocessText = (text) => {
  if (!text) return [];
  
  // Convert to lowercase and remove special characters
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');
  
  // Tokenize into words
  const tokens = cleanText.split(/\s+/).filter(token => token.length > 1);
  
  // Remove stopwords and apply stemming
  return tokens
    .filter(token => !stopwords.includes(token))
    .map(token => stemWord(token));
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

// Function to detect intent from user input with confidence scoring
export const detectIntent = (text) => {
  const lowerText = text.toLowerCase();
  
  // Enhanced intent patterns with priority scoring
  const intentPatterns = {
    greeting: {
      patterns: [
        /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|sup)\b/i,
      ],
      priority: 10
    },
    farewell: {
      patterns: [
        /^(bye|goodbye|see you|farewell|have a good day|talk to you later|catch you later)\b/i
      ],
      priority: 10
    },
    information: {
      patterns: [
        /^(what|how|which|where|when|why|who)\b/i,
        /tell me (about|more)|can you explain|i need to know|i want to know|i'm looking for|looking for/i,
        /about your company|about ksp|company details|company information/i,
        /do you (have|offer|provide|sell|make)/i
      ],
      priority: 8
    },
    purchase: {
      patterns: [
        /\b(buy|purchase|order|ordering|checkout|cart|payment|pay for)\b/i,
        /\b(price|pricing|cost|costs|how much|rate|rates|quote)\b/i,
        /i want to (buy|purchase|order|get)/i,
        /place an order|make an order/i
      ],
      priority: 9
    },
    complaint: {
      patterns: [
        /complaint|complain|issue|problem|trouble|difficulty/i,
        /not (happy|satisfied|working|good)|dissatisfied|disappointed/i,
        /poor|bad|terrible|awful|horrible|worst/i,
        /damaged|defective|broken|wrong|incorrect|missing/i
      ],
      priority: 9
    },
    gratitude: {
      patterns: [
        /\b(thanks|thank you|thx|ty|appreciate|grateful|helpful)\b/i
      ],
      priority: 10
    },
    cancellation: {
      patterns: [
        /\b(cancel|cancellation|refund|return|stop)\b/i,
        /(don't|do not) want|changed my mind|no longer (need|want)/i
      ],
      priority: 9
    },
    confirmation: {
      patterns: [
        /^(confirm|verify|check|validate|yes|yep|yeah|sure|right|correct|ok|okay)\b/i
      ],
      priority: 7
    },
    negation: {
      patterns: [
        /^(no|nope|nah|not really|don't think so|negative)\b/i
      ],
      priority: 7
    },
    comparison: {
      patterns: [
        /\b(difference|compare|comparison|versus|vs|better|best|prefer)\b/i,
        /which (one|is|are) (better|best|recommended)/i
      ],
      priority: 8
    },
    specification: {
      patterns: [
        /\b(specification|specs|details|technical|parameters|properties)\b/i,
        /\b(count|counts|thickness|strength|quality|grade)\b/i
      ],
      priority: 8
    }
  };
  
  // Score each intent
  let bestIntent = { name: 'general', score: 0 };
  
  for (const [intent, config] of Object.entries(intentPatterns)) {
    let score = 0;
    for (const pattern of config.patterns) {
      if (pattern.test(lowerText)) {
        score = config.priority;
        break;
      }
    }
    
    if (score > bestIntent.score) {
      bestIntent = { name: intent, score: score };
    }
  }
  
  return bestIntent.name;
};

// Generate contextual responses based on conversation history
export const generateContextualResponse = (query, matchedResponse, conversationContext) => {
  const entities = extractEntities(query);
  
  // If we have a specific response, customize it based on context
  if (matchedResponse) {
    let customizedResponse = matchedResponse;
    
    // Add yarn type specificity if detected
    if (entities.yarnTypes.length > 0) {
      if (customizedResponse.includes('yarns') || customizedResponse.includes('products')) {
        const yarnTypeStr = entities.yarnTypes.join(' and ');
        customizedResponse = customizedResponse.replace(
          /\b(our yarns|our products|yarns)\b/i,
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
    
    // Add certification context if mentioned
    if (entities.certifications.length > 0) {
      const certStr = entities.certifications.join(', ').toUpperCase();
      if (!customizedResponse.toLowerCase().includes(certStr.toLowerCase())) {
        customizedResponse += ` Our products carry ${certStr} certifications.`;
      }
    }
    
    // Add personalization if we know the user name
    if (conversationContext.userName && Math.random() > 0.7) {
      if (customizedResponse.includes('.')) {
        customizedResponse = customizedResponse.replace(
          /\.\s/,
          `, ${conversationContext.userName}. `
        );
      }
    }
    
    // Add follow-up suggestion based on context
    if (conversationContext.lastTopic && conversationContext.messageCount > 3) {
      if (customizedResponse.includes('?')) {
        // Already has a question, don't add more
      } else if (Math.random() > 0.6) {
        customizedResponse += " Would you like to know more about this?";
      }
    }
    
    return customizedResponse;
  }
  
  return null;
};

// Calculate relevance score for better matching
export const calculateRelevanceScore = (query, topic, keywords) => {
  const queryTokens = preprocessText(query);
  const keywordTokens = keywords.flatMap(kw => preprocessText(kw));
  
  // Direct keyword match bonus
  let keywordMatchScore = 0;
  queryTokens.forEach(token => {
    if (keywordTokens.includes(token)) {
      keywordMatchScore += 0.15;
    }
  });
  
  // Topic similarity
  const topicSimilarity = calculateSimilarity(query, topic);
  
  // Combined score
  return Math.min(1.0, topicSimilarity + keywordMatchScore);
};
