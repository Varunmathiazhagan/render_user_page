import { preprocessText } from '../utils/nlpUtils';

// Helper function to use outside of React components
const t = (text, namespace) => {
  // Simple implementation that just returns the text
  // In a real app, this would use the actual translation logic
  return text;
};

// Helper function for fuzzy matching to handle typos
export const fuzzyMatch = (text, keyword) => {
  if (!text || !keyword) return false;
  
  // Convert both to lowercase for case-insensitive matching
  const textLower = text.toLowerCase();
  const keywordLower = keyword.toLowerCase();
  
  // Direct match
  if (textLower.includes(keywordLower)) return true;
  
  // Common misspellings
  const commonMisspellings = {
    'cancel': ['cancle', 'cancell', 'canel', 'cncel', 'cacnel'],
    'order': ['oredr', 'ordr', 'oder', 'ordder'],
    'refund': ['refnd', 'refudn', 'rfund', 'refaund'],
    'return': ['retrun', 'retrn', 'reutrn', 'retunr']
  };
  
  // Check if the keyword has common misspellings
  for (const [word, misspellings] of Object.entries(commonMisspellings)) {
    if (keywordLower.includes(word) || misspellings.some(misspelled => keywordLower.includes(misspelled))) {
      // Check if any of the misspellings are in the text
      if (textLower.includes(word)) return true;
      if (misspellings.some(misspelled => textLower.includes(misspelled))) return true;
    }
  }
  
  // Levenshtein distance for words that are very similar
  // Simplified implementation - words with small edit distances are considered matches
  if (keywordLower.length > 3 && textLower.includes(keywordLower.substring(0, 3))) {
    return true;
  }
  
  return false;
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
    address: "4-130 Gandhi Nagar, Karur Sukkaliyur, Tamil Nadu, India",
    email: "kspyarnskarur@gmail.com",
    phone: "+91 9994955782",
    hours: "Monday to Saturday: 9 AM to 6 PM IST",
    socialMedia: ["Facebook", "Instagram", "LinkedIn"]
  }
};

// Enhanced knowledge base with data from all pages
export const knowledgeBase = {
  'product': {
    keywords: ['yarn', 'product', 'collection', 'buy', 'purchase', 'material', 'catalog', 'type', 'variety', 'stock', 'available', 'offer'],
    text: "We offer a variety of high-quality yarns including recycled, OE, ring spun, and vortex yarns. Our product categories include cotton yarns (Ne 4 to Ne 80), polyester yarns (Ne 10 to Ne 60), blended yarns (Ne 6 to Ne 50), and specialty yarns. Cotton variants include organic, recycled, combed, and carded. Polyester options include virgin, recycled, and textured. Our production technologies include Ring Spinning, Open-End Spinning, and Vortex Spinning.",
    response: t("We offer a variety of high-quality yarns including recycled, OE, ring spun, and vortex yarns. You can browse our full collection on the Products page. Our specialties include cotton, polyester, and blended yarns in various counts and qualities.", "chatbot"),
    followUpQuestions: [
      t("What are your bestselling yarns?", "chatbot"),
      t("Do you offer organic yarns?", "chatbot"),
      t("What yarn counts do you offer?", "chatbot")
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
    response: t("You can reach our team at kspyarnskarur@gmail.com or call us at +91 9994955782. Our offices are located at 4-130 Gandhi Nagar, Karur Sukkaliyur. Our customer service team is available Monday to Saturday from 9 AM to 6 PM IST.", "chatbot"),
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
    keywords: ['eco', 'sustainable', 'environment', 'green', 'recycled', 'planet', 'organic', 'carbon', 'footprint', 'responsible', 'ethical', 'conservation'],
    response: t("Sustainability is at the core of our values. We use eco-friendly manufacturing processes and offer a range of recycled and organic yarn options. Our factory employs water conservation methods, solar power, and waste reduction practices. We're certified by global sustainability standards and continuously work to improve our environmental impact.", "chatbot"),
    followUpQuestions: [
      t("What sustainability certifications do you have?", "chatbot"),
      t("How do you recycle yarns?", "chatbot"),
      t("What's your carbon footprint reduction strategy?", "chatbot")
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
    keywords: ['place order', 'place an order', 'buy', 'purchase', 'checkout', 'ordering', 'how to order', 'make order', 'ordering process', 'how can i order', 'how do i place'],
    response: t("Placing an order with us is easy! You can order through our website by selecting your desired yarns, adding them to your cart, and proceeding to checkout. For bulk or custom orders, you can also email us at kspyarnskarur@gmail.com or call us at +91 9994955782. Our team will guide you through the ordering process and provide you with a detailed quote. We require minimum order quantities for certain yarn types, so please check product specifications or contact us for details.", "chatbot"),
    followUpQuestions: [
      t("What payment methods do you accept?", "chatbot"),
      t("What's your minimum order quantity?", "chatbot"),
      t("How long will delivery take?", "chatbot")
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
    response: t("Our main facility and office is located at 4-130 Gandhi Nagar, Karur Sukkaliyur, Tamil Nadu, India. We welcome factory visits by appointment. Please contact us at kspyarnskarur@gmail.com to schedule a visit. We also have distribution centers in major textile hubs across India and representative offices in select international locations.", "chatbot")
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
    keywords: ['quality', 'standard', 'testing', 'check', 'control', 'assurance', 'inspection', 'consistency', 'defect'],
    response: t("Quality is our priority. We implement a comprehensive quality management system with testing at every production stage. Our yarns undergo rigorous tests for count, strength, elongation, evenness, imperfections, and hairiness. We use advanced testing equipment including Uster technologies and follow international testing standards.", "chatbot"),
    followUpQuestions: [
      t("What quality tests do you perform?", "chatbot"),
      t("Do you follow international quality standards?", "chatbot"),
      t("How do you ensure batch consistency?", "chatbot")
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
    text: "Our main facility and office is located at 4-130 Gandhi Nagar, Karur Sukkaliyur, Tamil Nadu, India. You can contact us via email at kspyarnskarur@gmail.com or call us at +91 9994955782. Our business hours are Monday to Saturday from 9 AM to 6 PM IST. We're also active on social media platforms including Facebook, Instagram, and LinkedIn.",
    response: t("You can reach our team at kspyarnskarur@gmail.com or call us at +91 9994955782. Our offices are located at 4-130 Gandhi Nagar, Karur Sukkaliyur. Our customer service team is available Monday to Saturday from 9 AM to 6 PM IST.", "chatbot"),
    followUpQuestions: [
      t("What are your business hours?", "chatbot"),
      t("Do you have a customer support chat?", "chatbot"),
      t("How can I schedule a meeting?", "chatbot")
    ],
    page: 'contact'
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
