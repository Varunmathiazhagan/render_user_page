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
  
  // Create term frequency vectors
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

// Calculate semantic similarity between two texts
export const calculateSimilarity = (textA, textB) => {
  // Preprocess both texts
  const tokensA = preprocessText(textA);
  const tokensB = preprocessText(textB);
  
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  
  // Calculate cosine similarity
  return cosineSimilarity(tokensA, tokensB);
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
    numbers: [],
    dates: [],
    locations: []
  };
  
  if (!text) return entities;
  
  // Extract numbers (including those with units)
  const numberPattern = /\b\d+(\.\d+)?\s*(kg|g|mm|cm|m|inch|inches|yards|counts|ne)?\b/gi;
  const numberMatches = text.match(numberPattern) || [];
  entities.numbers = numberMatches.map(match => match.trim());
  
  // Extract dates
  const datePattern = /\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*(?:\s+\d{2,4})?)\b/gi;
  entities.dates = text.match(datePattern) || [];
  
  // Extract common yarn types/products
  const yarnTypes = ['cotton', 'polyester', 'blend', 'recycled', 'organic', 'vortex', 'ring spun', 'open end', 'oe yarn'];
  yarnTypes.forEach(type => {
    if (text.toLowerCase().includes(type)) {
      entities.products.push(type);
    }
  });
  
  // Extract locations
  const locations = ['india', 'karur', 'tamil nadu', 'sukkaliyur'];
  locations.forEach(location => {
    if (text.toLowerCase().includes(location)) {
      entities.locations.push(location);
    }
  });
  
  return entities;
};

// Function to detect intent from user input
export const detectIntent = (text) => {
  const lowerText = text.toLowerCase();
  
  // Common intent patterns
  const intentPatterns = {
    greeting: [
      /^hi\b|^hello\b|^hey\b|^greetings\b|^good morning\b|^good afternoon\b|^good evening\b/i,
    ],
    farewell: [
      /^bye\b|^goodbye\b|^see you\b|^farewell\b|^have a good day\b/i
    ],
    information: [
      /what|how|which|where|when|why|who|tell me about|can you explain|i need to know|i want to know/i,
      /about your company|about ksp yarns|company details|company information/i // Added pattern
    ],
    purchase: [
      /buy|purchase|order|shop|get|acquire|cost|price|how much|how many/i
    ],
    complaint: [
      /complaint|issue|problem|not happy|dissatisfied|poor|bad|terrible|awful|damaged|wrong/i
    ],
    gratitude: [
      /thanks|thank you|appreciate|grateful|helpful/i
    ],
    cancellation: [
      /cancel|refund|return|stop|don't want|changed my mind/i
    ],
    confirmation: [
      /confirm|verify|check|sure|right|correct|ok|yes|yep|yeah/i
    ],
    negation: [
      /no|nope|not|don't|none|never|negative/i
    ]
  };
  
  // Check for each intent
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(lowerText)) {
        return intent;
      }
    }
  }
  
  return 'general';
};

// Generate contextual responses based on conversation history
export const generateContextualResponse = (query, matchedResponse, conversationContext) => {
  // Removed unused intent variable
  const entities = extractEntities(query);
  
  // If we have a specific response, customize it based on context
  if (matchedResponse) {
    // Add product specificity if detected
    if (entities.products.length > 0 && matchedResponse.includes('products')) {
      return matchedResponse.replace(
        'our products', 
        `our ${entities.products.join(', ')} products`
      );
    }
    
    // Add personalization if we know the user name
    if (conversationContext.userName && Math.random() > 0.7) {
      if (matchedResponse.includes('.')) {
        return matchedResponse.replace(
          '. ', 
          `. ${conversationContext.userName}, `
        );
      }
    }
    
    return matchedResponse;
  }
  
  return null;
};
