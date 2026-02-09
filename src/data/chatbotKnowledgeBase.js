import { preprocessText, correctSpelling, analyzeSentiment, fuzzyMatchWord, levenshteinDistance } from '../utils/nlpUtils';

// Helper function to use outside of React components
const t = (text, namespace) => {
  // Simple implementation that just returns the text
  // In a real app, this would use the actual translation logic
  return text;
};

// Enhanced fuzzy matching with Levenshtein distance
export const fuzzyMatch = (text, keyword) => {
  if (!text || !keyword) return false;
  
  // Convert both to lowercase for case-insensitive matching
  const textLower = text.toLowerCase();
  const keywordLower = keyword.toLowerCase();
  
  // Direct match
  if (textLower.includes(keywordLower)) return true;
  
  // Use fuzzy word matching for individual words
  const textWords = textLower.split(/\s+/);
  const keywordWords = keywordLower.split(/\s+/);
  
  for (const textWord of textWords) {
    for (const keywordWord of keywordWords) {
      if (fuzzyMatchWord(textWord, keywordWord, 0.3)) {
        return true;
      }
    }
  }
  
  return false;
};

// Intelligent response variations to avoid repetition
const responseVariations = {
  greetings: [
    "Hello! How can I assist you today?",
    "Hi there! What can I help you with?",
    "Welcome! I'm here to help with any questions.",
    "Greetings! How may I be of service?",
  ],
  acknowledgments: [
    "I understand.",
    "Got it!",
    "I see what you mean.",
    "Thanks for clarifying.",
  ],
  transitions: [
    "Additionally,",
    "Furthermore,",
    "Also worth noting,",
    "On that note,",
  ],
  followUps: [
    "Is there anything else you'd like to know?",
    "What else can I help you with?",
    "Do you have any other questions?",
    "Would you like more information on anything?",
  ]
};

// Get a random variation
export const getVariation = (type) => {
  const variations = responseVariations[type];
  if (!variations) return '';
  return variations[Math.floor(Math.random() * variations.length)];
};

// Smart response builder that adapts to conversation context
export const buildSmartResponse = (baseResponse, context = {}) => {
  let response = baseResponse;
  
  // Add greeting variation for new conversations
  if (context.isFirstMessage && !response.toLowerCase().startsWith('hello')) {
    response = getVariation('greetings').split('!')[0] + '! ' + response;
  }
  
  // Add follow-up for engaged users
  if (context.messageCount > 5 && Math.random() > 0.7 && !response.endsWith('?')) {
    response += ' ' + getVariation('followUps');
  }
  
  return response;
};

// Conversational patterns for more natural responses
export const conversationalPatterns = {
  // Handle "yes" and "no" responses based on last topic
  confirmation: {
    patterns: [/^(yes|yeah|yep|sure|ok|okay|yup|affirmative)$/i],
    handler: (context) => {
      const lastTopic = context.lastTopic;
      const responses = {
        'products': t("Great! Which specific yarn type interests you - cotton, polyester, or blended yarns?", "chatbot"),
        'samples': t("Perfect! To request samples, please email us at kspyarnskarur@gmail.com with your requirements and shipping address.", "chatbot"),
        'order_placement': t("Excellent! You can place orders through our website, email (kspyarnskarur@gmail.com), or call us at +91 9994955782.", "chatbot"),
        'price': t("I'd be happy to help with pricing! Please share the yarn type, count, and quantity you need for an accurate quote.", "chatbot"),
        'default': t("Great! How can I help you further?", "chatbot")
      };
      return responses[lastTopic] || responses['default'];
    }
  },
  negation: {
    patterns: [/^(no|nope|nah|not really|never mind)$/i],
    handler: (context) => {
      return t("No problem! Is there something else I can help you with?", "chatbot");
    }
  }
};

// Comparison templates for yarn types
export const yarnComparisons = {
  'cotton_vs_polyester': {
    cotton: ['Natural fiber', 'Breathable', 'Soft texture', 'Biodegradable', 'Good moisture absorption', 'Better for sensitive skin'],
    polyester: ['Synthetic fiber', 'Durable', 'Wrinkle-resistant', 'Quick-drying', 'Color-fast', 'More affordable'],
    recommendation: t("Cotton is ideal for comfort wear and sensitive skin, while polyester excels in durability and performance wear. Consider poly-cotton blends for the best of both worlds!", "chatbot")
  },
  'ring_vs_openend': {
    ringSpun: ['Higher strength', 'Softer feel', 'Premium quality', 'Fine count capability', 'Less hairiness', 'Better for fine fabrics'],
    openEnd: ['Cost-effective', 'Good uniformity', 'Faster production', 'Medium to coarse counts', 'Good abrasion resistance', 'Ideal for denim'],
    recommendation: t("Ring-spun yarn is best for premium applications requiring softness and strength, while open-end yarn is ideal for cost-effective bulk production.", "chatbot")
  },
  'organic_vs_recycled': {
    organic: ['Grown without pesticides', 'GOTS certified', 'Premium quality', 'Environmentally friendly', 'Traceability'],
    recycled: ['Made from post-consumer waste', 'GRS certified', 'Reduces landfill', 'Lower water usage', 'Cost-effective sustainability'],
    recommendation: t("Both options are excellent for eco-conscious projects. Organic cotton offers purity, while recycled cotton maximizes resource efficiency.", "chatbot")
  }
};

// Generate comparison response
export const generateComparisonResponse = (item1, item2) => {
  const comparisonKey = `${item1}_vs_${item2}`;
  const reverseKey = `${item2}_vs_${item1}`;
  
  const comparison = yarnComparisons[comparisonKey] || yarnComparisons[reverseKey];
  
  if (comparison) {
    const keys = Object.keys(comparison).filter(k => k !== 'recommendation');
    let response = `Here's a comparison:\n\n`;
    
    keys.forEach((key, index) => {
      const displayName = key.replace(/([A-Z])/g, ' $1').trim();
      response += `**${displayName}:**\n`;
      comparison[key].forEach(point => {
        response += `• ${point}\n`;
      });
      if (index < keys.length - 1) response += '\n';
    });
    
    response += `\n${comparison.recommendation}`;
    return response;
  }
  
  return null;
};

// FAQ database for common questions with quick answers
export const frequentlyAskedQuestions = {
  'moq': {
    question: "What is your minimum order quantity?",
    answer: t("Our minimum order quantity (MOQ) varies by yarn type:\n• Cotton yarns: 500 kg per count\n• Polyester yarns: 1000 kg per count\n• Specialty yarns: 300 kg per count\n• Samples: Available in smaller quantities\n\nFor smaller orders, please contact us for special arrangements.", "chatbot")
  },
  'lead_time': {
    question: "What is your lead time?",
    answer: t("Standard lead times:\n• Stock items: 3-5 days\n• Regular orders: 2-3 weeks\n• Custom/bulk orders: 4-6 weeks\n• Custom color development: Add 1-2 weeks\n\nExpress production available for urgent requirements.", "chatbot")
  },
  'payment_terms': {
    question: "What are your payment terms?",
    answer: t("We offer flexible payment options:\n• New customers: 50% advance, 50% before dispatch\n• Regular customers: LC, TT, or credit terms\n• International: Letter of Credit or advance payment\n• Bulk orders: Negotiable terms available\n\nAll payments secured through verified banking channels.", "chatbot")
  },
  'international_shipping': {
    question: "Do you ship internationally?",
    answer: t("Yes! We ship worldwide with:\n• FOB/CIF/CFR terms available\n• Export to 40+ countries\n• Door-to-door delivery options\n• All export documentation handled\n• Container loading supervision\n\nMajor export markets: USA, EU, Middle East, and Southeast Asia.", "chatbot")
  },
  'quality_guarantee': {
    question: "Do you offer quality guarantees?",
    answer: t("Absolutely! Our quality commitment includes:\n• 100% quality inspection before dispatch\n• Uster test reports with every shipment\n• Claims accepted within 30 days\n• Free replacement for genuine quality issues\n• Consistent quality across batches\n\nAll products backed by ISO 9001 quality management.", "chatbot")
  }
};

// Match FAQ questions
export const matchFAQ = (query) => {
  const lowerQuery = query.toLowerCase();
  
  const faqMatches = {
    'moq': ['minimum order', 'moq', 'min order', 'smallest order', 'minimum quantity', 'how much minimum'],
    'lead_time': ['lead time', 'how long', 'delivery time', 'production time', 'when can', 'how soon'],
    'payment_terms': ['payment term', 'payment method', 'how to pay', 'payment option', 'credit', 'advance'],
    'international_shipping': ['international', 'export', 'ship abroad', 'overseas', 'foreign', 'ship to'],
    'quality_guarantee': ['guarantee', 'warranty', 'quality assure', 'defect', 'claim', 'replace']
  };
  
  for (const [faqKey, keywords] of Object.entries(faqMatches)) {
    if (keywords.some(kw => lowerQuery.includes(kw))) {
      return frequentlyAskedQuestions[faqKey];
    }
  }
  
  return null;
};

// Page-specific content from the website
export const pageContent = {
  home: {
    title: "KSP Yarns - Sustainable Yarn Manufacturer",
    description: "Leading manufacturer of high-quality yarns including cotton, polyester, and blended yarns with a focus on sustainability and innovation.",
    keyFeatures: [
      "Premium quality yarns for various textile applications",
      "Sustainable manufacturing processes",
      "Competitive pricing and bulk discounts",
      "Global shipping capabilities"
    ]
  },
  products: {
    categories: [
      {
        name: "Cotton Yarns",
        variants: ["Organic Cotton", "Recycled Cotton", "Combed Cotton", "Carded Cotton"],
        counts: "Ne 4 to Ne 80",
        applications: "Apparel, home textiles, industrial applications"
      },
      {
        name: "Polyester Yarns",
        variants: ["Virgin Polyester", "Recycled Polyester", "Textured Polyester"],
        counts: "Ne 10 to Ne 60",
        applications: "Technical textiles, sportswear, industrial fabrics"
      },
      {
        name: "Blended Yarns",
        variants: ["Poly-Cotton Blends", "Cotton-Viscose Blends", "Specialty Blends"],
        counts: "Ne 6 to Ne 50",
        applications: "Versatile applications across apparel and home textiles"
      },
      {
        name: "Specialty Yarns",
        variants: ["Mélange Yarns", "Slub Yarns", "Fancy Yarns", "Core-Spun Yarns"],
        applications: "Fashion apparel, premium textiles"
      }
    ],
    technologies: ["Ring Spinning", "Open-End Spinning", "Vortex Spinning"],
    certifications: ["GOTS", "GRS", "OEKO-TEX Standard 100", "ISO 9001", "ISO 14001"]
  },
  about: {
    history: "Founded in 2005, KSP Yarns began as a small yarn trading business and has grown into a leading manufacturer with state-of-the-art facilities.",
    mission: "To provide premium quality yarns while embracing sustainable practices and continuous innovation.",
    vision: "To become the global leader in sustainable yarn manufacturing through technological excellence and customer-centric approach.",
    values: ["Quality", "Sustainability", "Innovation", "Integrity", "Customer Satisfaction"],
    milestones: [
      "2005: Founded in Karur, Tamil Nadu",
      "2008: First manufacturing facility established",
      "2012: ISO 9001 certification achieved",
      "2015: Launched recycled yarn product line",
      "2018: Expanded to international markets",
      "2020: GOTS and GRS certifications obtained",
      "2022: New state-of-the-art facility inaugurated"
    ]
  },
  sustainability: {
    initiatives: [
      "Solar-powered manufacturing facilities",
      "Water recycling and conservation systems",
      "Zero-waste manufacturing processes",
      "Organic and recycled raw material sourcing",
      "Energy-efficient machinery and equipment"
    ],
    certifications: [
      "Global Organic Textile Standard (GOTS)",
      "Global Recycled Standard (GRS)",
      "ISO 14001 Environmental Management System",
      "OEKO-TEX Standard 100"
    ],
    goals: [
      "Carbon neutrality by 2030",
      "100% renewable energy usage",
      "Zero landfill waste by 2025",
      "Reduce water consumption by 50% by 2028"
    ]
  },
  contact: {
    address: "124/4 Gandhi Nagar, Sukkaliyur, Karur, Tamil Nadu, India",
    email: "kspyarnskarur@gmail.com",
    phone: "+91 9994955782",
    hours: "Monday to Friday: 9 AM to 6 PM IST, Saturday: 9 AM to 2 PM IST",
    socialMedia: ["Facebook", "Instagram", "LinkedIn"]
  }
};

// Enhanced knowledge base with data from all pages
export const knowledgeBase = {
  'product': {
    keywords: ['yarn', 'product', 'collection', 'buy', 'purchase', 'material', 'catalog', 'type', 'variety', 'stock', 'available', 'offer', 'sell', 'provide', 'manufacture'],
    text: "We offer a comprehensive range of high-quality yarns including recycled, OE (Open-End), ring spun, and vortex yarns. Our product categories include: 1) Cotton yarns from Ne 4 to Ne 80 with variants like organic cotton, recycled cotton, combed cotton, and carded cotton. 2) Polyester yarns from Ne 10 to Ne 60 including virgin polyester, recycled polyester (GRS certified), and textured polyester. 3) Blended yarns from Ne 6 to Ne 50 such as poly-cotton blends (65/35, 50/50, 60/40 ratios), cotton-viscose blends, and specialty blends. 4) Specialty yarns including mélange yarns, slub yarns, fancy yarns, and core-spun yarns. Our production technologies include Ring Spinning for premium quality, Open-End Spinning for cost-effectiveness, and Vortex Spinning for low hairiness and superior performance.",
    response: t("We offer a comprehensive range of high-quality yarns including:\n\n• Cotton Yarns (Ne 4-80): Organic, recycled, combed, and carded variants\n• Polyester Yarns (Ne 10-60): Virgin, recycled (GRS certified), and textured\n• Blended Yarns (Ne 6-50): Poly-cotton, cotton-viscose, and specialty blends\n• Specialty Yarns: Mélange, slub, fancy, and core-spun varieties\n\nWe use advanced spinning technologies including Ring Spinning, Open-End Spinning, and Vortex Spinning to ensure superior quality. All our products are certified and meet international standards.", "chatbot"),
    followUpQuestions: [
      t("What are your bestselling yarns?", "chatbot"),
      t("Tell me about your cotton yarns", "chatbot"),
      t("What certifications do your products have?", "chatbot")
    ],
    page: 'products'
  },
  'price': {
    keywords: ['price', 'cost', 'how much', 'pricing', 'discount', 'affordable', 'expensive', 'budget', 'quote', 'offer', 'deal'],
    response: t("Our pricing varies based on yarn type, quantity, and specifications. For detailed pricing, please visit our Products page or contact our sales team. We offer competitive rates for bulk orders and regular customers may qualify for special discounts.", "chatbot"),
    followUpQuestions: [
      t("Do you offer bulk discounts?", "chatbot"),
      t("What's your minimum order quantity?", "chatbot"),
      t("How can I get a price quote?", "chatbot")
    ]
  },
  'shipping': {
    keywords: ['ship', 'delivery', 'receive', 'shipping', 'time', 'when', 'arrive', 'transit', 'courier', 'track', 'package', 'send'],
    response: t("We offer standard shipping (3-5 business days) and express shipping (1-2 business days). International shipping is also available for most locations. Once your order is processed, you'll receive a tracking number to monitor your shipment in real-time.", "chatbot"),
    followUpQuestions: [
      t("Do you ship internationally?", "chatbot"),
      t("How can I track my order?", "chatbot"),
      t("What are your shipping rates?", "chatbot")
    ]
  },
  'return': {
    keywords: ['return', 'refund', 'cancel', 'exchange', 'money back', 'policy', 'damaged', 'wrong', 'unsatisfied', 'quality issue'],
    response: t("We offer a 30-day return policy for unopened products. Please contact our customer service with your order number to initiate a return. For quality issues or damaged items, please provide photos for our quality assurance team to assess.", "chatbot"),
    followUpQuestions: [
      t("How do I return a damaged product?", "chatbot"),
      t("Can I exchange my order?", "chatbot"),
      t("What's your refund process?", "chatbot")
    ]
  },
  'contact': {
    keywords: ['contact', 'email', 'phone', 'call', 'support', 'talk', 'reach', 'service', 'help', 'assistance', 'representative', 'chat'],
    response: t("You can reach our team at kspyarnskarur@gmail.com or call us at +91 9994955782. Our offices are located at 124/4 Gandhi Nagar, Sukkaliyur, Karur. Our customer service team is available Monday to Friday from 9 AM to 6 PM IST and Saturday from 9 AM to 2 PM IST.", "chatbot"),
    followUpQuestions: [
      t("What are your business hours?", "chatbot"),
      t("Do you have a customer support chat?", "chatbot"),
      t("How can I schedule a meeting?", "chatbot")
    ],
    page: 'contact'
  },
  'account': {
    keywords: ['account', 'login', 'password', 'sign up', 'register', 'profile', 'forgot', 'reset', 'credentials', 'email', 'personal information'],
    response: t("You can create an account or login from the user icon in the top navigation bar. This will allow you to track orders, save favorite products, and expedite checkout. If you've forgotten your password, use the 'Forgot Password' link on the login page.", "chatbot"),
    followUpQuestions: [
      t("How do I reset my password?", "chatbot"),
      t("What are the benefits of creating an account?", "chatbot"),
      t("Is my personal information secure?", "chatbot")
    ]
  },
  'sustainability': {
    keywords: ['eco', 'sustainable', 'environment', 'green', 'recycled', 'planet', 'organic', 'carbon', 'footprint', 'responsible', 'ethical', 'conservation', 'eco-friendly', 'renewable'],
    text: "Sustainability is central to KSP Yarns' operations. Our comprehensive environmental initiatives include: 1) Solar-powered manufacturing facilities reducing carbon emissions, 2) Advanced water recycling and conservation systems achieving 60% water reuse, 3) Zero-waste manufacturing with complete waste recycling and reuse, 4) Sourcing organic and recycled raw materials from certified suppliers, 5) Energy-efficient machinery reducing power consumption by 40%. We hold prestigious certifications: GOTS (Global Organic Textile Standard) for organic products, GRS (Global Recycled Standard) for recycled content verification, ISO 14001 for Environmental Management, and OEKO-TEX Standard 100 for harmful substance testing. Our ambitious sustainability goals include achieving carbon neutrality by 2030, 100% renewable energy usage, zero landfill waste by 2025, and 50% reduction in water consumption by 2028.",
    response: t("Sustainability is at the core of KSP Yarns' operations:\n\nEnvironmental Initiatives:\n• Solar-powered manufacturing facilities\n• 60% water recycling and conservation\n• Zero-waste manufacturing processes\n• Organic and recycled raw materials\n• 40% reduction in energy consumption\n\nCertifications:\n• GOTS (Global Organic Textile Standard)\n• GRS (Global Recycled Standard)\n• ISO 14001 (Environmental Management)\n• OEKO-TEX Standard 100\n\nFuture Goals:\n• Carbon neutrality by 2030\n• 100% renewable energy usage\n• Zero landfill waste by 2025\n• 50% water consumption reduction by 2028\n\nWe're committed to sustainable textile manufacturing without compromising quality.", "chatbot"),
    followUpQuestions: [
      t("Tell me about your recycled yarns", "chatbot"),
      t("What is GOTS certification?", "chatbot"),
      t("How do you reduce water usage?", "chatbot")
    ],
    page: 'sustainability'
  },
  'company': {
    keywords: ['company', 'about', 'history', 'background', 'founded', 'who are you', 'ksp', 'mission', 'vision', 'values', 'team', 'establishment', 'tell me about your company'], // Added keyword
    response: t("KSP Yarns was established in 2005 with a mission to provide premium quality yarns while embracing sustainable practices. We've grown from a small local supplier to an international yarn manufacturer known for quality, innovation, and environmental responsibility. Our team includes experienced textile engineers and quality control experts committed to excellence.", "chatbot"),
    followUpQuestions: [
      t("Who founded KSP Yarns?", "chatbot"),
      t("What is your company's mission?", "chatbot"),
      t("How many employees do you have?", "chatbot")
    ],
    page: 'about'
  },
  'wholesale': {
    keywords: ['wholesale', 'bulk', 'large order', 'business', 'quantity', 'distributor', 'reseller', 'commercial', 'partner', 'collaboration', 'b2b'],
    response: t("We offer competitive wholesale pricing for bulk orders. Our minimum order quantity varies by product type. Please contact our business development team at kspyarnskarur@gmail.com with details of your requirements for a customized quote. We offer special terms for long-term business relationships.", "chatbot"),
    followUpQuestions: [
      t("What are your wholesale terms?", "chatbot"),
      t("Do you offer partnership programs?", "chatbot"),
      t("Can I become a distributor?", "chatbot")
    ]
  },
  'specifications': {
    keywords: ['specification', 'technical', 'details', 'count', 'thickness', 'strength', 'quality', 'parameters', 'characteristics', 'property', 'standard'],
    response: t("Our yarns come in various specifications including different counts (Ne), twist levels, and strength parameters. Each product page lists detailed specifications. For customized specifications, please contact our technical team. We can provide lab reports and quality certificates upon request.", "chatbot"),
    followUpQuestions: [
      t("What yarn counts do you offer?", "chatbot"),
      t("Can you provide technical data sheets?", "chatbot"),
      t("What testing standards do you follow?", "chatbot")
    ]
  },
  'care': {
    keywords: ['care', 'wash', 'maintain', 'instruc', 'clean', 'storage', 'preserve', 'handle', 'quality', 'longevity', 'deteriorate'],
    response: t("For optimal yarn storage, keep in a cool, dry place away from direct sunlight. Most yarns should be stored in their original packaging or airtight containers to prevent dust accumulation and moisture damage. Different yarn types may have specific care requirements which are provided with your purchase. For detailed care instructions for a specific product, please refer to the product information sheet.", "chatbot")
  },
  'order': {
    keywords: ['order', 'status', 'track', 'placed', 'processing', 'confirm', 'cancel', 'modify', 'change', 'update', 'timeline', 'progress'],
    response: t("You can track your order status by logging into your account and viewing 'Order History'. Alternatively, use the tracking number provided in your shipping confirmation email. If you need to modify an order, please contact customer service immediately as changes may only be possible before shipping. For order cancellations, please refer to our cancellation policy on the website.", "chatbot"),
    followUpQuestions: [
      t("How long does shipping take?", "chatbot"),
      t("Can I modify my order after placing it?", "chatbot"),
      t("What's your cancellation policy?", "chatbot")
    ]
  },
  'order_placement': {
    keywords: ['place order', 'place an order', 'buy', 'purchase', 'checkout', 'ordering', 'how to order', 'make order', 'ordering process', 'how can i order', 'how do i place', 'want to buy', 'want to purchase'],
    text: "To place an order with KSP Yarns, you have multiple convenient options: 1) Through our website - Browse our product catalog, select desired yarns with specifications, add to cart, and proceed to secure checkout. 2) Email orders - Send detailed requirements to kspyarnskarur@gmail.com including yarn type, count, quantity, and delivery address. 3) Phone orders - Call +91 9994955782 during business hours (Monday-Saturday, 9 AM-6 PM IST) to speak with our sales team. For bulk or custom orders, our team will provide detailed quotations, discuss specifications, arrange samples if needed, and guide you through the complete ordering process. Minimum order quantities vary by yarn type - please check specific product pages or contact us for MOQ details.",
    response: t("Placing an order with KSP Yarns is simple and convenient:\n\nOnline: Browse our website, select products, and checkout securely\nEmail: Send requirements to kspyarnskarur@gmail.com\nPhone: Call +91 9994955782 (Mon-Fri, 9 AM-6 PM IST; Sat, 9 AM-2 PM IST)\n\nFor bulk orders:\n• We provide detailed quotations\n• Sample cards available for quality evaluation\n• Custom specifications accepted\n• Flexible payment terms for B2B clients\n\nOur team will guide you through specifications, pricing, and delivery timelines. Minimum order quantities vary by product type.", "chatbot"),
    followUpQuestions: [
      t("What payment methods do you accept?", "chatbot"),
      t("What's your minimum order quantity?", "chatbot"),
      t("Can I get samples before ordering?", "chatbot")
    ]
  },
  'custom': {
    keywords: ['custom', 'personalize', 'specific', 'special', 'unique', 'tailor', 'bespoke', 'design', 'requirement', 'particular', 'exclusive'],
    response: t("We offer custom yarn development services tailored to your specific requirements. This includes customized blends, counts, colors, and finishing options. Custom orders typically require a minimum quantity and development time. Please contact our product development team with your specifications, and we'll work with you to create the perfect yarn for your needs.", "chatbot")
  },
  'certification': {
    keywords: ['certif', 'standard', 'quality', 'iso', 'compliance', 'test', 'audit', 'approval', 'regulation', 'authority', 'verified'],
    response: t("Our yarns meet international quality standards and are certified by organizations like OEKO-TEX, GOTS, and GRS for our organic and recycled products. We maintain ISO 9001 for quality management and ISO 14001 for environmental management systems. All our certificates are available upon request, and key certifications are displayed on our product pages.", "chatbot")
  },
  'payment': {
    keywords: ['payment', 'pay', 'method', 'credit', 'debit', 'card', 'bank', 'transfer', 'upi', 'online', 'transaction', 'secure', 'option'],
    response: t("We accept multiple payment methods including credit/debit cards, bank transfers, UPI, and international payment systems. All online transactions are secured with industry-standard encryption. For large orders, we also offer letter of credit and other B2B payment options. Contact our finance team for special payment arrangements or questions regarding transactions.", "chatbot")
  },
  'location': {
    keywords: ['location', 'factory', 'mill', 'office', 'address', 'visit', 'facility', 'headquarter', 'site', 'place', 'direction', 'map'],
    response: t("Our main facility and office is located at 124/4 Gandhi Nagar, Sukkaliyur, Karur, Tamil Nadu, India. We welcome factory visits by appointment. Please contact us at kspyarnskarur@gmail.com to schedule a visit. We also have distribution centers in major textile hubs across India and representative offices in select international locations.", "chatbot")
  },
  'trends': {
    keywords: ['trend', 'fashion', 'popular', 'latest', 'season', 'upcoming', 'modern', 'style', 'design', 'forecast', 'industry'],
    response: t("The current yarn trends include sustainable fibers, textured yarns, and natural dyes. We stay updated with global textile trends and regularly introduce new products aligned with market demands. Our R&D team works closely with fashion forecasters to anticipate upcoming trends in the textile industry.", "chatbot"),
    followUpQuestions: [
      t("What colors are trending this season?", "chatbot"),
      t("How do you predict yarn trends?", "chatbot"),
      t("Do you offer trendy specialty yarns?", "chatbot")
    ]
  },
  'samples': {
    keywords: ['sample', 'test', 'try', 'before', 'small', 'quantity', 'trial', 'evaluation', 'quality check'],
    response: t("We offer sample cards and small quantity samples for quality evaluation before bulk orders. Standard samples are available for a nominal fee which is credited towards your first order. For custom samples, please contact our sales team with your specific requirements and intended application.", "chatbot"),
    followUpQuestions: [
      t("How can I order a sample?", "chatbot"),
      t("Is there a fee for samples?", "chatbot"),
      t("How long does sample delivery take?", "chatbot")
    ]
  },
  'colors': {
    keywords: ['color', 'shade', 'dye', 'tone', 'hue', 'pantone', 'match', 'palette', 'range', 'options'],
    response: t("We offer yarns in a wide range of standard colors as well as custom color matching services. Our in-house dyeing facilities can match specific Pantone colors or your provided samples. We maintain color consistency across batches and offer color fastness guarantees for our dyed yarns.", "chatbot"),
    followUpQuestions: [
      t("Can you match specific Pantone colors?", "chatbot"),
      t("What's your color consistency policy?", "chatbot"),
      t("Do you offer natural dyed yarns?", "chatbot")
    ]
  },
  'production': {
    keywords: ['production', 'manufacturing', 'make', 'process', 'facility', 'machine', 'technology', 'equipment', 'capacity'],
    response: t("Our state-of-the-art manufacturing facilities use modern technology for yarn production. Our processes include blowroom, carding, drawing, roving, ring spinning, open-end spinning, and post-spinning processes. We have a monthly production capacity of approximately 500 tons and employ strict quality control at every stage of production.", "chatbot"),
    followUpQuestions: [
      t("What spinning technologies do you use?", "chatbot"),
      t("What's your production capacity?", "chatbot"),
      t("Can I visit your production facility?", "chatbot")
    ]
  },
  'quality': {
    keywords: ['quality', 'standard', 'testing', 'check', 'control', 'assurance', 'inspection', 'consistency', 'defect', 'qc', 'qa', 'test'],
    text: "Quality assurance is paramount at KSP Yarns. We implement a comprehensive multi-stage quality management system with rigorous testing at every production phase. Our quality control includes: 1) Raw material inspection and approval from certified suppliers, 2) In-process quality checks during blowroom, carding, drawing, roving, and spinning stages, 3) Final product testing using advanced Uster technologies for count accuracy (Â±2%), strength (minimum 85% CSP), elongation (5-8%), evenness (U% <12%), imperfections (IPI values within limits), and hairiness (H value monitoring). We use state-of-the-art testing equipment including Uster Tester 6, Tensorapid strength tester, and advanced moisture analyzers. Our quality team conducts batch consistency checks, color fastness testing (4-5 grade), and comprehensive reporting. We follow international testing standards including ASTM, ISO, and BS methods. Every batch is accompanied by quality certificates and test reports. We maintain 99.5% quality acceptance rate and offer quality guarantees with our products.",
    response: t("Quality is our top priority at KSP Yarns:\n\nðŸ”¬ Testing Standards:\n• Count accuracy: Â±2% tolerance\n• Strength: Minimum 85% CSP\n• Evenness: U% <12%\n• Comprehensive IPI testing\n• Color fastness: Grade 4-5\n\nðŸ­ Quality Control Process:\n• Raw material inspection\n• In-process monitoring at every stage\n• Advanced Uster technology testing\n• Batch consistency verification\n• Final product certification\n\nâœ… What We Test:\n• Count, strength, and elongation\n• Evenness and imperfections\n• Hairiness and twist\n• Moisture content\n• Color fastness\n\nWe follow ASTM, ISO, and BS international standards, achieving 99.5% quality acceptance. Every batch includes detailed test reports.", "chatbot"),
    followUpQuestions: [
      t("What testing equipment do you use?", "chatbot"),
      t("Can you provide quality certificates?", "chatbot"),
      t("What are your quality standards?", "chatbot")
    ]
  },
  'innovation': {
    keywords: ['innovation', 'research', 'development', 'new', 'technology', 'advance', 'future', 'improvement', 'r&d'],
    response: t("Innovation drives our business forward. Our R&D department continuously explores new yarn technologies, sustainable processing methods, and performance-enhancing treatments. We invest in research partnerships with textile institutions and regularly upgrade our manufacturing technology to stay at the forefront of yarn innovation.", "chatbot"),
    followUpQuestions: [
      t("What are your latest innovations?", "chatbot"),
      t("Do you develop custom yarn solutions?", "chatbot"),
      t("How much do you invest in R&D?", "chatbot")
    ]
  },
  'applications': {
    keywords: ['application', 'use', 'suitable', 'purpose', 'ideal', 'recommend', 'best for', 'intended', 'usage'],
    response: t("Our yarns are suitable for various applications including apparel, home textiles, technical textiles, and industrial uses. We can recommend specific yarn types based on your end product requirements. Each product in our catalog includes recommended applications to help you choose the right yarn for your project.", "chatbot"),
    followUpQuestions: [
      t("Which yarns are best for knitting?", "chatbot"),
      t("Do you have yarns for technical textiles?", "chatbot"),
      t("What yarns do you recommend for sportswear?", "chatbot")
    ]
  },
  'greeting': {
    keywords: ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy', 'sup', 'yo', 'hiya'],
    response: (context) => {
      // Make sure the context parameter is actually used
      const timeOfDay = getTimeOfDay();
      let greeting = '';
      
      // Use proper context checks
      if (context && context.userName) {
        greeting = t(`${timeOfDay}, ${context.userName}! Welcome back to KSP Yarns. How can I assist you today?`, "chatbot");
      } else if (context && context.messageCount > 5) {
        greeting = t(`${timeOfDay}! Great to see you again. What can I help you with today?`, "chatbot");
      } else {
        greeting = t(`${timeOfDay}! Welcome to KSP Yarns. How can I assist you today with our yarn products or services?`, "chatbot");
      }
      return greeting;
    },
    followUpQuestions: [
      t("What products do you offer?", "chatbot"),
      t("Can you tell me about your company?", "chatbot"),
      t("How can I place an order?", "chatbot")
    ]
  },
  'thanks': {
    keywords: ['thank', 'thanks', 'appreciate', 'grateful', 'helpful'],
    response: t("You're welcome! I'm happy I could help. Is there anything else you'd like to know about our yarns or services?", "chatbot"),
    followUpQuestions: [
      t("Tell me about your sustainability practices", "chatbot"),
      t("What are your bestselling products?", "chatbot"),
      t("How can I contact your team?", "chatbot")
    ]
  },
  'goodbye': {
    keywords: ['bye', 'goodbye', 'see you', 'farewell', 'end'],
    response: t("Thank you for chatting with KSP Yarns assistant. Feel free to return anytime you have questions. Have a great day!", "chatbot"),
    followUpQuestions: [
      t("Before I go, how can I place an order?", "chatbot"),
      t("Can I get a product catalog?", "chatbot"),
      t("What are your contact details?", "chatbot")
    ]
  },
  'general': {
    keywords: ['how are you', 'what\'s up', 'how\'s it going', 'whats happening', 'how do you work', 'who are you'],
    response: (context) => {
      if (context.recentTopics.includes('general')) {
        return t("I'm doing well, thanks for asking! I'm an AI assistant programmed to help you with information about KSP Yarns' products and services. Is there something specific you'd like to know about our yarns?", "chatbot");
      }
      return t("I'm KSP's AI assistant, designed to provide information about our yarns, services, and answer any questions you might have. I'm functioning perfectly and ready to assist you!", "chatbot");
    },
    followUpQuestions: [
      t("Tell me about your company", "chatbot"),
      t("What products do you specialize in?", "chatbot"),
      t("How can you help me today?", "chatbot")
    ]
  },
  'help': {
    keywords: ['help', 'assist', 'support', 'guide', 'explain', 'show me', 'how to use', 'what can you do'],
    response: t("I can help you with information about our products, ordering process, shipping details, company information, and more. You can ask me specific questions, and I'll do my best to assist you. You can also click on the suggested questions below for quick answers.", "chatbot"),
    followUpQuestions: [
      t("What products do you offer?", "chatbot"),
      t("How do I place an order?", "chatbot"),
      t("Tell me about your yarn quality", "chatbot")
    ]
  },
  'name': {
    keywords: ['your name', 'who are you', 'what are you called', 'what should I call you'],
    response: t("I'm KSP's AI assistant, designed to help you with information about our yarns and services. You can think of me as your personal guide to everything KSP Yarns offers. What would you like to know?", "chatbot"),
    followUpQuestions: [
      t("What can you help me with?", "chatbot"),
      t("Tell me about KSP Yarns", "chatbot"),
      t("What products do you offer?", "chatbot")
    ]
  },
  'cancellation': {
    keywords: ['cancel', 'cancle', 'cancell', 'canel', 'cancellation', 'stop order', 'don\'t want', 'oredr', 'ordr'],
    text: "To cancel an order, contact our customer service team as soon as possible at kspyarnskarur@gmail.com or call +91 9994955782. Orders can typically be cancelled if they haven't entered the shipping process. Please provide your order number and contact information. If your order has already shipped, you may need to follow our return process instead.",
    response: t("To cancel your order, please contact our customer service team as soon as possible at kspyarnskarur@gmail.com or call +91 9994955782. Orders can typically be cancelled if they haven't entered the shipping process. Please provide your order number and contact information. If your order has already shipped, you may need to follow our return process instead.", "chatbot"),
    followUpQuestions: [
      t("What's your return policy?", "chatbot"),
      t("How do I track my order status?", "chatbot"),
      t("Can I get a refund for cancelled orders?", "chatbot")
    ]
  },
  'cotton_yarns': {
    keywords: ['cotton', 'organic cotton', 'recycled cotton', 'combed cotton', 'carded cotton'],
    text: "Our cotton yarn range includes organic cotton, recycled cotton, combed cotton, and carded cotton variants. We offer counts from Ne 4 to Ne 80, suitable for apparel, home textiles, and industrial applications. All our cotton yarns meet international quality standards and are available with various certifications including GOTS for organic cotton.",
    response: t("Our cotton yarn range includes organic, recycled, combed, and carded variants from Ne 4 to Ne 80. These are perfect for apparel, home textiles, and various industrial applications. Our cotton yarns are known for their consistency, strength, and excellent dyeing properties. We also offer GOTS certified organic cotton yarns for eco-conscious projects.", "chatbot"),
    followUpQuestions: [
      t("What's the difference between combed and carded cotton?", "chatbot"),
      t("Are your organic cotton yarns certified?", "chatbot"),
      t("What are the most popular cotton yarn counts?", "chatbot")
    ],
    page: 'products'
  },
  'polyester_yarns': {
    keywords: ['polyester', 'virgin polyester', 'recycled polyester', 'textured polyester'],
    text: "Our polyester yarn collection includes virgin polyester, recycled polyester, and textured polyester options. Available in counts from Ne 10 to Ne 60, these yarns are ideal for technical textiles, sportswear, and industrial fabrics. Our recycled polyester yarns are GRS certified and offer the same performance as virgin polyester with reduced environmental impact.",
    response: t("We offer virgin polyester, recycled polyester, and textured polyester yarns in counts from Ne 10 to Ne 60. These are perfect for technical textiles, sportswear, and industrial applications. Our recycled polyester yarns carry GRS certification and provide excellent strength, abrasion resistance, and colorfastness while reducing environmental impact.", "chatbot"),
    followUpQuestions: [
      t("What are the benefits of recycled polyester?", "chatbot"),
      t("How does textured polyester differ from regular polyester?", "chatbot"),
      t("What applications are polyester yarns best suited for?", "chatbot")
    ],
    page: 'products'
  },
  'blended_yarns': {
    keywords: ['blend', 'blended', 'poly-cotton', 'cotton-viscose', 'specialty blend'],
    text: "Our blended yarn selection includes poly-cotton blends, cotton-viscose blends, and specialty blends in counts from Ne 6 to Ne 50. These yarns combine the best properties of different fibers for versatile applications across apparel and home textiles. Common blend ratios include 65/35, 50/50, and 60/40 polyester/cotton.",
    response: t("We manufacture various blended yarns including poly-cotton, cotton-viscose, and specialty blends in counts from Ne 6 to Ne 50. Our blends combine the strengths of different fibers - for example, our poly-cotton blends offer the comfort of cotton with the durability of polyester. Common blend ratios include 65/35, 50/50, and 60/40 polyester/cotton, perfect for apparel and home textiles.", "chatbot"),
    followUpQuestions: [
      t("What are the advantages of blended yarns?", "chatbot"),
      t("What's your most popular blend ratio?", "chatbot"),
      t("Can you create custom blends?", "chatbot")
    ],
    page: 'products'
  },
  'specialty_yarns': {
    keywords: ['specialty', 'melange', 'slub', 'fancy', 'core-spun'],
    text: "Our specialty yarn line features mélange yarns, slub yarns, fancy yarns, and core-spun yarns designed for fashion apparel and premium textiles. These yarns offer unique aesthetic and functional properties, creating distinctive fabrics with character and appeal. Our specialty yarns are produced using advanced technologies to ensure consistent quality.",
    response: t("Our specialty yarns include mélange, slub, fancy, and core-spun varieties designed for fashion-forward applications. Mélange yarns create heathered effects, slub yarns add texture, fancy yarns provide unique visual interest, and core-spun yarns offer special performance characteristics. These specialty products are perfect for premium fashion apparel and distinctive textile products.", "chatbot"),
    followUpQuestions: [
      t("How are mélange yarns different from regular yarns?", "chatbot"),
      t("What effects can I achieve with slub yarns?", "chatbot"),
      t("Do you offer custom specialty yarn development?", "chatbot")
    ],
    page: 'products'
  },
  'spinning_technologies': {
    keywords: ['spinning', 'technology', 'ring spinning', 'open-end', 'oe spinning', 'vortex spinning', 'manufacturing process'],
    text: "We employ multiple spinning technologies including Ring Spinning, Open-End Spinning, and Vortex Spinning. Ring spinning produces high-quality yarns with excellent strength and softness. Open-End spinning offers cost-effective production for coarser counts. Vortex spinning creates yarns with low hairiness and good abrasion resistance.",
    response: t("We utilize three primary spinning technologies: Ring Spinning produces premium yarns with excellent strength and softness, ideal for fine fabrics. Open-End (OE) Spinning is cost-effective for medium to coarse counts with good uniformity. Vortex Spinning creates yarns with minimal hairiness and superior abrasion resistance, perfect for performance fabrics. Each technology offers distinct advantages for different end applications.", "chatbot"),
    followUpQuestions: [
      t("Which spinning method produces the strongest yarns?", "chatbot"),
      t("What count ranges can you produce with each technology?", "chatbot"),
      t("How do I choose the right spinning method for my project?", "chatbot")
    ],
    page: 'products'
  },
  'certifications': {
    keywords: ['certif', 'standard', 'quality', 'iso', 'gots', 'grs', 'oeko-tex', 'compliance', 'test', 'audit', 'approval', 'regulation', 'authority', 'verified'],
    text: "Our yarns are certified by leading organizations including GOTS (for organic yarns), GRS (for recycled content), OEKO-TEX Standard 100 (for harmful substances testing), ISO 9001 (quality management), and ISO 14001 (environmental management). These certifications ensure our products meet international standards for quality, sustainability, and safety.",
    response: t("Our yarns meet international quality standards and are certified by organizations like OEKO-TEX, GOTS, and GRS for our organic and recycled products. We maintain ISO 9001 for quality management and ISO 14001 for environmental management systems. All our certificates are available upon request, and key certifications are displayed on our product pages.", "chatbot"),
    followUpQuestions: [
      t("What does the GOTS certification cover?", "chatbot"),
      t("How often are your facilities audited for certifications?", "chatbot"),
      t("Can you provide certification documentation with orders?", "chatbot")
    ],
    page: 'products'
  },
  'company_history': {
    keywords: ['history', 'background', 'journey', 'story', 'founded', 'establishment', 'beginning', 'started'],
    text: "Founded in 2005, KSP Yarns began as a small yarn trading business in Karur, Tamil Nadu. Over the years, we've grown into a leading manufacturer with state-of-the-art facilities. Key milestones include establishing our first manufacturing facility in 2008, achieving ISO 9001 certification in 2012, launching our recycled yarn line in 2015, expanding to international markets in 2018, obtaining GOTS and GRS certifications in 2020, and inaugurating our new state-of-the-art facility in 2022.",
    response: t("KSP Yarns was established in 2005 as a small trading business in Karur and has grown into a leading yarn manufacturer. Our journey includes establishing our first manufacturing facility in 2008, launching recycled yarns in 2015, expanding internationally in 2018, and opening our state-of-the-art facility in 2022. Throughout our history, we've maintained a commitment to quality, sustainability, and innovation in the textile industry.", "chatbot"),
    followUpQuestions: [
      t("Who founded KSP Yarns?", "chatbot"),
      t("How has your product range evolved over the years?", "chatbot"),
      t("What was your first international market?", "chatbot")
    ],
    page: 'about'
  },
  'mission_vision': {
    keywords: ['mission', 'vision', 'goals', 'aim', 'purpose', 'objective', 'aspiration'],
    text: "Our mission is to provide premium quality yarns while embracing sustainable practices and continuous innovation. Our vision is to become the global leader in sustainable yarn manufacturing through technological excellence and a customer-centric approach. Our core values include Quality, Sustainability, Innovation, Integrity, and Customer Satisfaction.",
    response: t("Our mission is to provide premium quality yarns while embracing sustainable practices and continuous innovation. Our vision is to become the global leader in sustainable yarn manufacturing through technological excellence and a customer-centric approach. These principles guide everything we do, from product development to customer service, as we strive to exceed expectations while minimizing environmental impact.", "chatbot"),
    followUpQuestions: [
      t("How do you implement your values in daily operations?", "chatbot"),
      t("What innovations are you currently working on?", "chatbot"),
      t("How do you measure customer satisfaction?", "chatbot")
    ],
    page: 'about'
  },
  'sustainability_initiatives': {
    keywords: ['sustainability', 'eco', 'environment', 'green', 'sustainable', 'initiative', 'program', 'conservation', 'responsible'],
    text: "Our sustainability initiatives include solar-powered manufacturing facilities, water recycling and conservation systems, zero-waste manufacturing processes, organic and recycled raw material sourcing, and energy-efficient machinery. We hold certifications including GOTS, GRS, ISO 14001, and OEKO-TEX Standard 100. Our goals include achieving carbon neutrality by 2030, 100% renewable energy usage, zero landfill waste by 2025, and reducing water consumption by 50% by 2028.",
    response: t("Sustainability is at the core of our values. We use eco-friendly manufacturing processes and offer a range of recycled and organic yarn options. Our factory employs water conservation methods, solar power, and waste reduction practices. We're certified by global sustainability standards and continuously work to improve our environmental impact.", "chatbot"),
    followUpQuestions: [
      t("What sustainability certifications do you have?", "chatbot"),
      t("How do you recycle yarns?", "chatbot"),
      t("What's your carbon footprint reduction strategy?", "chatbot")
    ],
    page: 'sustainability'
  },
  'contact_details': {
    keywords: ['contact', 'reach', 'email', 'phone', 'call', 'address', 'location', 'office', 'factory', 'headquarters'],
    text: "Our main facility and office is located at 124/4 Gandhi Nagar, Sukkaliyur, Karur, Tamil Nadu, India. You can contact us via email at kspyarnskarur@gmail.com or call us at +91 9994955782. Our business hours are Monday to Friday from 9 AM to 6 PM IST and Saturday from 9 AM to 2 PM IST. We're also active on social media platforms including Facebook, Instagram, and LinkedIn.",
    response: t("You can reach our team at kspyarnskarur@gmail.com or call us at +91 9994955782. Our office is located at 124/4 Gandhi Nagar, Sukkaliyur, Karur. Our customer service team is available Monday to Friday from 9 AM to 6 PM IST and Saturday from 9 AM to 2 PM IST.", "chatbot"),
    followUpQuestions: [
      t("What are your business hours?", "chatbot"),
      t("Do you have a customer support chat?", "chatbot"),
      t("How can I schedule a meeting?", "chatbot")
    ],
    page: 'contact'
  },
  // New enhanced entries for better coverage
  'moq': {
    keywords: ['moq', 'minimum order', 'minimum quantity', 'smallest order', 'least order', 'min order', 'small quantity'],
    text: "Our minimum order quantity varies by yarn type. Cotton yarns typically have an MOQ of 500 kg per count. Polyester yarns have an MOQ of 1000 kg per count. Specialty yarns have a lower MOQ of 300 kg per count. Samples are available in smaller quantities for evaluation purposes.",
    response: t("Our minimum order quantity (MOQ) varies by yarn type:\n\n• Cotton yarns: 500 kg per count\n• Polyester yarns: 1000 kg per count\n• Specialty yarns: 300 kg per count\n• Samples: Available in smaller quantities\n\nFor smaller quantities or special arrangements, please contact our sales team.", "chatbot"),
    followUpQuestions: [
      t("Can I order samples first?", "chatbot"),
      t("Do you offer bulk discounts?", "chatbot"),
      t("How do I place an order?", "chatbot")
    ]
  },
  'lead_time': {
    keywords: ['lead time', 'delivery time', 'how long', 'when ready', 'production time', 'turnaround', 'waiting time', 'how soon'],
    text: "Standard lead times vary based on order type. Stock items are available within 3-5 days. Regular orders take 2-3 weeks. Custom and bulk orders require 4-6 weeks. Custom color development adds 1-2 weeks to the timeline.",
    response: t("Our standard lead times are:\n\nâ±ï¸ Stock items: 3-5 business days\nðŸ“¦ Regular orders: 2-3 weeks\nðŸ­ Custom/bulk orders: 4-6 weeks\nðŸŽ¨ Custom colors: Add 1-2 weeks\n\nExpress production is available for urgent requirements at additional cost.", "chatbot"),
    followUpQuestions: [
      t("Can you expedite my order?", "chatbot"),
      t("What items do you have in stock?", "chatbot"),
      t("How do I track my order?", "chatbot")
    ]
  },
  'bulk_discount': {
    keywords: ['discount', 'bulk discount', 'volume discount', 'large order', 'wholesale price', 'special price', 'offer', 'deal'],
    text: "We offer competitive bulk discounts for large orders. Volume discounts typically start at orders of 5 tons and increase with quantity. Regular customers may qualify for annual contracts with preferential pricing. Contact our sales team for custom quotations.",
    response: t("Yes, we offer attractive bulk discounts! ðŸ’°\n\n• 5+ tons: 3-5% discount\n• 10+ tons: 5-8% discount\n• 25+ tons: 8-12% discount\n• Annual contracts: Custom pricing\n\nRegular customers enjoy additional benefits including priority production and credit terms. Contact us for a personalized quote!", "chatbot"),
    followUpQuestions: [
      t("How do I become a regular customer?", "chatbot"),
      t("What payment terms do you offer?", "chatbot"),
      t("Can I get a price quote?", "chatbot")
    ]
  },
  'comparison': {
    keywords: ['difference', 'compare', 'versus', 'vs', 'which is better', 'comparison', 'prefer', 'recommend', 'choose between'],
    text: "We offer various yarn types each with unique characteristics. Cotton provides comfort and breathability. Polyester offers durability and moisture-wicking. Ring-spun yarn is premium quality with excellent strength. Open-end yarn is cost-effective for bulk production. We can help you choose the right yarn for your specific application.",
    response: (context) => {
      if (context && context.lastTopic) {
        return t("I'd be happy to help you compare yarns! What specific types would you like to compare? For example:\n\n• Cotton vs Polyester\n• Ring-spun vs Open-end\n• Organic vs Recycled\n• Combed vs Carded cotton\n\nTell me which options you're considering and your intended use.", "chatbot");
      }
      return t("Great question! Our yarn types have distinct advantages:\n\nðŸŒ¿ Cotton: Natural, breathable, comfortable\nðŸ”· Polyester: Durable, quick-dry, affordable\nðŸŒ€ Blended: Best of both worlds\nâ™»ï¸ Recycled: Eco-friendly, sustainable\n\nWhich types would you like me to compare in detail?", "chatbot");
    },
    followUpQuestions: [
      t("Compare cotton and polyester yarns", "chatbot"),
      t("What's the difference between ring-spun and open-end?", "chatbot"),
      t("Which yarn is best for my application?", "chatbot")
    ]
  },
  'international': {
    keywords: ['international', 'export', 'overseas', 'abroad', 'foreign', 'ship to', 'global', 'worldwide', 'country'],
    text: "We export to over 40 countries worldwide including the USA, European Union, Middle East, and Southeast Asia. We offer FOB, CIF, and CFR shipping terms. All export documentation and compliance is handled by our experienced team.",
    response: t("Yes, we ship internationally to 40+ countries.\n\nShipping Terms: FOB, CIF, CFR available\nDocumentation: All export paperwork handled\nMajor Markets: USA, EU, Middle East, Southeast Asia\nDelivery: Door-to-door options available\n\nWe ensure quality packaging for long-distance shipping and provide container loading supervision.", "chatbot"),
    followUpQuestions: [
      t("What are your international shipping rates?", "chatbot"),
      t("Do you handle customs clearance?", "chatbot"),
      t("What payment terms for international orders?", "chatbot")
    ]
  },
  'working_hours': {
    keywords: ['hours', 'timing', 'open', 'close', 'working hours', 'business hours', 'available', 'schedule', 'when open'],
    text: "Our office and customer service are available Monday to Saturday from 9 AM to 6 PM IST (Indian Standard Time). Factory operations run 24/7 with shift schedules. For urgent matters outside business hours, you can email us and we'll respond on the next business day.",
    response: t("Our business hours are:\n\nOffice Hours: Monday to Friday, 9 AM - 6 PM IST; Saturday, 9 AM - 2 PM IST\nFactory: 24/7 operations\nEmail Support: Always available (response within 24 hours)\nPhone: During office hours\n\nFor urgent matters, email us at kspyarnskarur@gmail.com and we'll prioritize your request.", "chatbot"),
    followUpQuestions: [
      t("Can I schedule a factory visit?", "chatbot"),
      t("How do I reach customer support?", "chatbot"),
      t("What's your response time for emails?", "chatbot")
    ]
  },
  'packaging': {
    keywords: ['packaging', 'pack', 'wrap', 'container', 'box', 'cone', 'bobbin', 'bag', 'carton'],
    text: "We offer various packaging options including standard cones, paper cones, plastic cones, and customized packaging. Standard packaging includes PP bags and corrugated cartons. Palletization is available for container shipments. Custom labeling and branding options available for regular customers.",
    response: t("We offer flexible packaging options:\n\nðŸ“¦ Cone Types: Paper cones, plastic cones, dyeing tubes\nðŸŽ Packaging: PP bags, corrugated cartons\nðŸ“ Palletization: Available for container loads\nðŸ·ï¸ Labeling: Custom labels and branding available\n\nPackaging is designed for safe transit and easy handling. Let us know your preferences!", "chatbot"),
    followUpQuestions: [
      t("What cone sizes are available?", "chatbot"),
      t("Can you provide custom packaging?", "chatbot"),
      t("What is your packing list format?", "chatbot")
    ]
  },
  'testing_reports': {
    keywords: ['test report', 'lab report', 'quality report', 'uster', 'certificate', 'coa', 'coc', 'documentation'],
    text: "We provide comprehensive quality documentation including Uster test reports, strength test results, count certificates, and compliance certificates. All reports follow international testing standards. GOTS and GRS transaction certificates available for certified products.",
    response: t("We provide complete quality documentation:\n\nðŸ“‹ Test Reports:\n• Uster evenness reports\n• Strength and elongation\n• Count verification\n• Twist test results\n\nðŸ“œ Certificates:\n• Certificate of Analysis (COA)\n• Certificate of Conformity\n• GOTS/GRS Transaction Certificates\n• Mill test reports\n\nAll documentation provided with shipment. Additional tests available on request.", "chatbot"),
    followUpQuestions: [
      t("Can you send sample test reports?", "chatbot"),
      t("What testing equipment do you use?", "chatbot"),
      t("Do you follow international testing standards?", "chatbot")
    ]
  },
  'factory_visit': {
    keywords: ['visit', 'tour', 'see factory', 'come to', 'meet', 'in person', 'facility tour', 'show around'],
    text: "We welcome factory visits by appointment. Visitors can see our manufacturing process, quality control labs, and meet our team. Please schedule at least one week in advance. We can arrange pickup from Karur railway station or nearby airports.",
    response: t("We welcome factory visits! ðŸ­\n\nðŸ“ Location: Karur, Tamil Nadu, India\nðŸ“… Scheduling: At least 1 week advance notice\nðŸš— Transport: Pickup from Karur station available\n\nDuring your visit, you can:\n• Tour our manufacturing facility\n• See quality control processes\n• Meet our technical team\n• Discuss custom requirements\n\nTo schedule, email kspyarnskarur@gmail.com with your preferred dates.", "chatbot"),
    followUpQuestions: [
      t("How do I schedule a factory visit?", "chatbot"),
      t("What's the nearest airport to your factory?", "chatbot"),
      t("Can you arrange hotel accommodation?", "chatbot")
    ]
  }
};

// Generate extended knowledge base with preprocessed text for NLP matching
export const extendedKnowledgeBase = Object.entries(knowledgeBase).map(([topic, data]) => {
  // Combine keywords and text for better matching
  const combinedText = [
    ...(data.keywords || []), 
    data.text || '',
    data.response || ''
  ].join(' ');
  
  // Preprocess the combined text for better matching
  const processedTokens = preprocessText(combinedText);
  
  return {
    ...data,
    topic,
    processedTokens,
    originalText: combinedText
  };
});

// Helper function for greeting responses
function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return t("Good morning", "chatbot");
  if (hour < 18) return t("Good afternoon", "chatbot");
  return t("Good evening", "chatbot");
}


