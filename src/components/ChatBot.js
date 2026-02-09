import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaComments, FaTimes, FaPaperPlane, FaSpinner, FaLightbulb, FaMicrophone, 
         FaThumbsUp, FaThumbsDown, FaRegSmile, FaRegCopy, FaVolumeUp } from 'react-icons/fa';
import { useTranslation } from '../utils/TranslationContext';
import { knowledgeBase, extendedKnowledgeBase, buildSmartResponse, getVariation, matchFAQ, generateComparisonResponse } from '../data/chatbotKnowledgeBase';
import { preprocessText, calculateSimilarity, detectIntent, extractEntities, 
         generateContextualResponse, calculateRelevanceScore, analyzeSentiment,
         correctSpelling, advancedPreprocess, detectQuestionType, 
         generateClarifyingQuestion, extractPreferences, updateConversationMemory } from '../utils/nlpUtils';

const ChatBot = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  // Start with greeting visible by default
  const [showGreeting, setShowGreeting] = useState(false);
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('kspChatHistory');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        const uniqueMessages = Array.from(
          new Map(parsedMessages.map(msg => [msg.id, msg])).values()
        );
        
        return uniqueMessages.map(msg => {
          try {
            const timestamp = msg.timestamp ? new Date(msg.timestamp) : new Date();
            if (isNaN(timestamp.getTime())) {
              throw new Error('Invalid timestamp');
            }
            return { ...msg, timestamp };
          } catch (err) {
            console.warn('Invalid timestamp for message, using current time instead');
            return { ...msg, timestamp: new Date() };
          }
        });
      } catch (error) {
        console.error('Error parsing chat history:', error);
        return [{ 
          id: 1, 
          text: t("Hello! I'm KSP's AI assistant. How can I help you today?", "chatbot"), 
          sender: 'bot', 
          timestamp: new Date(),
          feedback: null,
          reaction: null
        }];
      }
    }
    return [{ 
      id: 1, 
      text: t("Hello! I'm KSP's AI assistant. How can I help you today?", "chatbot"), 
      sender: 'bot', 
      timestamp: new Date(),
      feedback: null,
      reaction: null
    }];
  });
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [conversationContext, setConversationContext] = useState(() => {
    const savedContext = localStorage.getItem('kspChatContext');
    return savedContext ? JSON.parse(savedContext) : {
      lastTopic: null,
      userName: null,
      recentTopics: [],
      messageCount: 0,
      preferences: {},
      conversationHistory: [],
      lastInteraction: null,
      sessionStarted: new Date().toISOString()
    };
  });
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    t("What products do you offer?", "chatbot"),
    t("How do I place an order?", "chatbot"),
    t("Tell me about your sustainability practices", "chatbot"),
  ]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [visibleDateMarker, setVisibleDateMarker] = useState(null);
  const [isCopying, setIsCopying] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const audioRef = useRef(new Audio('/sounds/message-received.mp3'));

  // Define scrollToBottom before using it in useEffect
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const uniqueMessages = Array.from(
        new Map(messages.map(msg => [msg.id, msg])).values()
      );
      localStorage.setItem('kspChatHistory', JSON.stringify(uniqueMessages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('kspChatContext', JSON.stringify(conversationContext));
  }, [conversationContext]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (messages.length > 1) {
      setConversationContext(prev => ({
        ...prev,
        messageCount: messages.length
      }));
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      const container = chatContainerRef.current;
      
      const handleScroll = () => {
        const dateMarkers = container.querySelectorAll('[data-date-marker]');
        
        if (dateMarkers.length === 0) return;
        
        let visibleMarker = null;
        
        for (const marker of dateMarkers) {
          const rect = marker.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          if (rect.top >= containerRect.top && rect.bottom <= containerRect.bottom) {
            visibleMarker = marker.getAttribute('data-date-marker');
            break;
          }
        }
        
        setVisibleDateMarker(visibleMarker);
      };
      
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen]);

  useEffect(() => {
    if (messages.length > 1 && messages[messages.length - 1].sender === 'bot') {
      audioRef.current.play().catch(() => {});
    }
  }, [messages]);

  // Show greeting only on first visit
  useEffect(() => {
    const greetingShown = localStorage.getItem('kspGreetingShown');
    if (greetingShown) {
      setShowGreeting(false);
      return;
    }

    const showTimer = setTimeout(() => setShowGreeting(true), 1000);
    const hideTimer = setTimeout(() => {
      setShowGreeting(false);
      localStorage.setItem('kspGreetingShown', 'true');
    }, 9000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []); // Empty dependency array means this runs once on mount

  const toggleChat = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  const handleInputChange = useCallback((e) => {
    setNewMessage(e.target.value);
    setIsUserTyping(true);
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      setIsUserTyping(false);
    }, 1000);
    setTypingTimeout(timeout);
  }, [typingTimeout]);

  // Move these function definitions above their usage
  const extractUserName = useCallback((message) => {
    const namePatterns = [
      /my name is (\w+)/i,
      /i am (\w+)/i,
      /i'm (\w+)/i,
      /call me (\w+)/i,
      /(\w+) here/i
    ];
    
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].charAt(0).toUpperCase() + match[1].slice(1);
      }
    }
    return null;
  }, []);

  const isNewVisitorGreeting = useCallback((message) => {
    const newVisitorPatterns = [
      /first time/i,
      /new here/i,
      /never (been|visited|ordered) before/i,
      /new customer/i
    ];
    
    return newVisitorPatterns.some(pattern => pattern.test(message));
  }, []);

  const updateConversationContext = useCallback((topic, additionalContext = {}) => {
    setConversationContext(prev => {
      const recentTopics = [topic, ...prev.recentTopics.slice(0, 4)];
      const now = new Date().toISOString();
      
      // Track conversation history for better context
      const conversationHistory = [
        ...(prev.conversationHistory || []).slice(-10),
        { topic, timestamp: now, ...additionalContext }
      ];
      
      return {
        ...prev,
        lastTopic: topic,
        recentTopics: recentTopics.filter((v, i, a) => a.indexOf(v) === i),
        messageCount: (prev.messageCount || 0) + 1,
        conversationHistory,
        lastInteraction: now,
        ...additionalContext
      };
    });
  }, []);

  // Now findBotResponse can use these functions in its dependency array
  const findBotResponse = useCallback((userMessage) => {
    const normalizedMessage = userMessage.toLowerCase();
    
    // Advanced preprocessing with spelling correction and sentiment
    const { corrected: correctedMessage, sentiment } = advancedPreprocess(userMessage);
    
    // Extract user name if mentioned
    const possibleName = extractUserName(userMessage);
    if (possibleName) {
      setConversationContext(prev => ({
        ...prev,
        userName: possibleName
      }));
    }
    
    // Extract user intent with enhanced detection (now returns object with confidence)
    const intentResult = detectIntent(userMessage);
    const userIntent = typeof intentResult === 'object' ? intentResult.name : intentResult;
    const intentConfidence = typeof intentResult === 'object' ? intentResult.confidence : 0.5;
    
    // Extract entities for better understanding
    const entities = extractEntities(correctedMessage);
    
    // Extract and save user preferences
    const preferences = extractPreferences(userMessage, conversationContext.preferences);
    if (Object.keys(preferences).length > 0) {
      setConversationContext(prev => ({
        ...prev,
        preferences: { ...prev.preferences, ...preferences }
      }));
    }

    // Pre-process the user message for NLP matching
    const processedUserMessage = preprocessText(correctedMessage, { expandSynonyms: true }).join(' ');
    
    // Check for FAQ matches first (common questions with quick answers)
    const faqMatch = matchFAQ(correctedMessage);
    if (faqMatch) {
      updateConversationContext('faq');
      setSuggestedQuestions([
        t("What products do you offer?", "chatbot"),
        t("How do I place an order?", "chatbot"),
        t("Tell me about your company", "chatbot")
      ]);
      return faqMatch.answer;
    }
    
    // Check for comparison queries
    const comparisonPatterns = [
      { regex: /\b(cotton)\b.*\b(polyester|poly)\b/i, items: ['cotton', 'polyester'] },
      { regex: /\b(polyester|poly)\b.*\b(cotton)\b/i, items: ['cotton', 'polyester'] },
      { regex: /\b(ring)\s*(spun|spinning)?\b.*\b(open\s*end|oe)\b/i, items: ['ring', 'openend'] },
      { regex: /\b(open\s*end|oe)\b.*\b(ring)\s*(spun|spinning)?\b/i, items: ['ring', 'openend'] },
      { regex: /\b(organic)\b.*\b(recycled)\b/i, items: ['organic', 'recycled'] },
      { regex: /\b(recycled)\b.*\b(organic)\b/i, items: ['organic', 'recycled'] },
    ];
    
    for (const pattern of comparisonPatterns) {
      if (pattern.regex.test(correctedMessage)) {
        const comparisonResponse = generateComparisonResponse(pattern.items[0], pattern.items[1]);
        if (comparisonResponse) {
          updateConversationContext('comparison');
          setSuggestedQuestions([
            t("Which yarn do you recommend for my project?", "chatbot"),
            t("Can I get samples of both?", "chatbot"),
            t("What are the prices for these yarns?", "chatbot")
          ]);
          return comparisonResponse;
        }
      }
    }
    
    // Handle basic intents first with higher priority (only if high confidence)
    if (userIntent === 'greeting' && intentConfidence > 0.6) {
      updateConversationContext('greeting');
      
      if (typeof knowledgeBase.greeting.response === 'function') {
        const response = knowledgeBase.greeting.response(conversationContext);
        setSuggestedQuestions(knowledgeBase.greeting.followUpQuestions || []);
        return buildSmartResponse(response, { isFirstMessage: conversationContext.messageCount < 2 });
      }
      
      setSuggestedQuestions(knowledgeBase.greeting.followUpQuestions || []);
      return buildSmartResponse(knowledgeBase.greeting.response, { isFirstMessage: conversationContext.messageCount < 2 });
    }
    
    if (userIntent === 'farewell' && intentConfidence > 0.6) {
      updateConversationContext('goodbye');
      setSuggestedQuestions(knowledgeBase.goodbye.followUpQuestions || []);
      return knowledgeBase.goodbye.response;
    }
    
    if (userIntent === 'gratitude' && intentConfidence > 0.6) {
      updateConversationContext('thanks');
      setSuggestedQuestions(knowledgeBase.thanks.followUpQuestions || []);
      // Add variation to gratitude responses
      const thankResponses = [
        knowledgeBase.thanks.response,
        t("You're welcome! Let me know if you need anything else.", "chatbot"),
        t("Happy to help! Feel free to ask more questions.", "chatbot"),
        t("My pleasure! Is there anything else you'd like to know?", "chatbot")
      ];
      return thankResponses[Math.floor(Math.random() * thankResponses.length)];
    }
    
    // Handle complaints with empathy
    if (userIntent === 'complaint' && intentConfidence > 0.5) {
      updateConversationContext('complaint');
      const empathyResponse = t("I'm sorry to hear you're experiencing issues. Let me help you resolve this. ", "chatbot");
      
      if (sentiment.label === 'negative') {
        setSuggestedQuestions([
          t("I need to speak with customer service", "chatbot"),
          t("How do I request a refund?", "chatbot"),
          t("What's your return policy?", "chatbot")
        ]);
        return empathyResponse + t("Could you please tell me more about the issue? You can also contact our support team at kspyarnskarur@gmail.com or +91 9994955782 for immediate assistance.", "chatbot");
      }
    }
    
    // Enhanced matching with multiple scoring methods
    const scoringResults = (extendedKnowledgeBase || []).map(entry => {
      // Method 1: Semantic similarity with corrected text
      const semanticScore = calculateSimilarity(correctedMessage, entry.originalText);
      
      // Method 2: Enhanced relevance score (includes keyword matching and fuzzy matching)
      const relevanceScore = calculateRelevanceScore(
        correctedMessage, 
        entry.originalText, 
        entry.keywords || []
      );
      
      // Method 3: Entity matching bonus
      let entityBonus = 0;
      if (entities.yarnTypes.length > 0) {
        const hasYarnType = entry.keywords?.some(kw => 
          entities.yarnTypes.some(yt => kw.toLowerCase().includes(yt.toLowerCase()))
        );
        if (hasYarnType) entityBonus = 0.25;
      }
      
      if (entities.certifications.length > 0) {
        const hasCertification = entry.keywords?.some(kw => 
          entities.certifications.some(cert => kw.toLowerCase().includes(cert.toLowerCase()))
        );
        if (hasCertification) entityBonus += 0.2;
      }
      
      if (entities.colors.length > 0) {
        if (entry.topic === 'colors') entityBonus += 0.15;
      }
      
      // Method 4: Intent-based bonus
      let intentBonus = 0;
      if (userIntent === 'purchase' && (entry.topic.includes('order') || entry.topic.includes('price'))) {
        intentBonus = 0.2;
      } else if (userIntent === 'information' && entry.topic.includes('company')) {
        intentBonus = 0.15;
      } else if (userIntent === 'specification' && (entry.topic.includes('specification') || entry.topic.includes('quality'))) {
        intentBonus = 0.25;
      } else if (userIntent === 'comparison' && entry.topic.includes('yarn')) {
        intentBonus = 0.15;
      } else if (userIntent === 'shipping' && entry.topic.includes('shipping')) {
        intentBonus = 0.25;
      } else if (userIntent === 'sustainability' && (entry.topic.includes('sustainability') || entry.topic.includes('eco'))) {
        intentBonus = 0.25;
      } else if (userIntent === 'samples' && entry.topic.includes('sample')) {
        intentBonus = 0.25;
      } else if (userIntent === 'contact' && entry.topic.includes('contact')) {
        intentBonus = 0.25;
      } else if (userIntent === 'cancellation' && (entry.topic.includes('cancel') || entry.topic.includes('return'))) {
        intentBonus = 0.25;
      }
      
      // Method 5: Context continuity bonus
      let contextBonus = 0;
      if (conversationContext.lastTopic && conversationContext.lastTopic === entry.topic) {
        contextBonus = 0.05; // Small boost for topic continuity
      }
      
      // Method 6: User preference matching
      let preferenceBonus = 0;
      if (conversationContext.preferences) {
        if (conversationContext.preferences.sustainabilityFocused && 
            (entry.topic.includes('sustainability') || entry.topic.includes('recycled') || entry.topic.includes('organic'))) {
          preferenceBonus = 0.1;
        }
        if (conversationContext.preferences.preferredYarnType && 
            entry.keywords?.some(kw => kw.includes(conversationContext.preferences.preferredYarnType))) {
          preferenceBonus += 0.1;
        }
      }
      
      // Combined weighted score
      const finalScore = (semanticScore * 0.3) + (relevanceScore * 0.35) + 
                        entityBonus + intentBonus + contextBonus + preferenceBonus;
      
      return {
        topic: entry.topic,
        score: finalScore,
        semanticScore,
        relevanceScore,
        entityBonus,
        intentBonus
      };
    });
    
    // Sort by final score (highest first)
    scoringResults.sort((a, b) => b.score - a.score);

    if (scoringResults.length > 0) {
      // Use adaptive threshold based on top scores
      const topScore = scoringResults[0].score;
      const secondScore = scoringResults[1]?.score || 0;
      const scoreGap = topScore - secondScore;
      const adaptiveThreshold = scoreGap > 0.15 ? 0.18 : 0.25;

      if (topScore > adaptiveThreshold) {
        const bestTopic = scoringResults[0].topic;
        updateConversationContext(bestTopic);
        
        // Find the matched topic in the knowledge base
        const matchedEntry = knowledgeBase[bestTopic];
        
        if (!matchedEntry) {
          return t("I'm not sure I have information about that. Could you please ask something else?", "chatbot");
        }
        
        // Generate a contextual response based on the matched entry
        setSuggestedQuestions(matchedEntry.followUpQuestions || []);
        
        if (typeof matchedEntry.response === 'function') {
          const baseResponse = matchedEntry.response(conversationContext);
          return buildSmartResponse(baseResponse, { messageCount: conversationContext.messageCount });
        }
        
        // Generate personalized response using the enhanced context
        const contextualResponse = generateContextualResponse(
          correctedMessage, 
          matchedEntry.response, 
          conversationContext
        );
        
        return buildSmartResponse(contextualResponse || matchedEntry.response, { messageCount: conversationContext.messageCount });
      }

      // Medium confidence - provide clarification
      if (topScore > 0.10) {
        const likelyTopic = scoringResults[0].topic;
        const tentativeEntry = knowledgeBase[likelyTopic];
        
        // Generate clarifying question
        const clarifyingQuestion = generateClarifyingQuestion(userMessage, scoringResults.slice(0, 3), entities);
        
        if (clarifyingQuestion) {
          setSuggestedQuestions(tentativeEntry?.followUpQuestions || []);
          return clarifyingQuestion;
        }
        
        const topicHint = tentativeEntry?.response ? tentativeEntry.response.split('.')[0] : likelyTopic.replace(/_/g, ' ');
        setSuggestedQuestions(tentativeEntry?.followUpQuestions || []);
        return t(
          `I think you're asking about ${likelyTopic.replace(/_/g, ' ')}. ${topicHint || ''} Could you please provide more details like yarn type, count, or quantity so I can give you a more precise answer?`,
          "chatbot"
        );
      }
    }
    
    // Handle specific cases that might not match well with similarity
    
    // Special handling for cancellation-related queries with fuzzy matching
    if (/canc|cncl|cansl|ordr|orer|oredr|refun/i.test(normalizedMessage)) {
      updateConversationContext('cancellation');
      setSuggestedQuestions(knowledgeBase.cancellation.followUpQuestions || []);
      return knowledgeBase.cancellation.response;
    }
    
    // New visitor greeting
    if (isNewVisitorGreeting(userMessage)) {
      updateConversationContext('greeting');
      return t("Welcome to KSP Yarns! We're a leading manufacturer of high-quality yarns with a focus on sustainability. How can I help you today?", "chatbot");
    }
    
    // Enhanced fallback with smart suggestions based on detected intent and entities
    let fallbackSuggestions = [];
    if (userIntent === 'purchase') {
      fallbackSuggestions = [
        t("How do I place an order?", "chatbot"),
        t("What are your prices?", "chatbot"),
        t("What's your minimum order quantity?", "chatbot")
      ];
    } else if (userIntent === 'information') {
      fallbackSuggestions = [
        t("Tell me about your company", "chatbot"),
        t("What products do you offer?", "chatbot"),
        t("What certifications do you have?", "chatbot")
      ];
    } else if (userIntent === 'specification') {
      fallbackSuggestions = [
        t("What yarn counts do you offer?", "chatbot"),
        t("Can you provide technical data sheets?", "chatbot"),
        t("Do you have GOTS or GRS certified yarns?", "chatbot")
      ];
    } else if (userIntent === 'shipping') {
      fallbackSuggestions = [
        t("What are your shipping options?", "chatbot"),
        t("How long does delivery take?", "chatbot"),
        t("Do you ship internationally?", "chatbot")
      ];
    } else if (userIntent === 'sustainability') {
      fallbackSuggestions = [
        t("Tell me about your recycled yarns", "chatbot"),
        t("What sustainability certifications do you have?", "chatbot"),
        t("Do you offer organic cotton yarns?", "chatbot")
      ];
    } else {
      // Default suggestions with variation
      fallbackSuggestions = [
        t("What products do you offer?", "chatbot"),
        t("How do I place an order?", "chatbot"),
        t("Tell me about your sustainability practices", "chatbot")
      ];
    }
    
    setSuggestedQuestions(fallbackSuggestions);

    // Smart fallback based on detected entities
    if (entities.yarnTypes.length > 0 || entities.counts.length > 0) {
      const yarnMention = entities.yarnTypes.join(', ');
      const countMention = entities.counts.join(', ');
      return t(
        `I see you're interested in ${yarnMention || 'specific'} yarns${countMention ? ` (counts: ${countMention})` : ''}. To give you the best information, please let me know:\n• Required yarn count (Ne)\n• Quantity needed\n• Delivery destination\n• Any specific certifications (GOTS, GRS, etc.)\n\nI can then provide detailed pricing and availability.`,
        "chatbot"
      );
    }
    
    // Context-aware fallback
    if (conversationContext.lastTopic) {
      const relatedSuggestion = knowledgeBase[conversationContext.lastTopic]?.followUpQuestions?.[0] || '';
      if (relatedSuggestion) {
        return t(
          `I'm not quite sure what you're asking. Were you still interested in ${conversationContext.lastTopic.replace(/_/g, ' ')}? Or try asking about:\n• Our yarn products and specifications\n• Pricing and bulk orders\n• Shipping and delivery\n• Quality certifications`,
          "chatbot"
        );
      }
    }

    return t("I'd be happy to help! Could you please specify what you're looking for? I can assist with:\n\n• 🧵 Yarn products (cotton, polyester, blends)\n• 💰 Pricing and ordering\n• 🚚 Shipping information\n• 📋 Quality certifications\n• 🌱 Sustainability practices\n\nJust let me know your requirements!", "chatbot");
  }, [conversationContext, extractUserName, isNewVisitorGreeting, t, updateConversationContext]);

  // Define handleSendMessage before it's used in handleKeyDown
  const handleSendMessage = useCallback(() => {
    if (!newMessage || newMessage.trim() === '') return;
    
    const messageId = Date.now();
    const userMessageText = newMessage.trim();
    const newMessageObject = {
      id: messageId,
      text: userMessageText,
      sender: 'user',
      timestamp: new Date(),
      feedback: null,
      reaction: null
    };
    
    const isDuplicate = messages.some(msg => 
      msg.sender === 'user' && 
      msg.text === userMessageText && 
      (new Date().getTime() - new Date(msg.timestamp).getTime()) < 2000
    );
    
    if (!isDuplicate) {
      setMessages(prevMessages => [...prevMessages, newMessageObject]);
    }
    
    setNewMessage('');
    setIsTyping(true);
    
    // Optimized response time - reduced minimum delay
    setTimeout(() => {
      let responseText;
      try {
        responseText = findBotResponse(userMessageText) || "I'm sorry, I couldn't process that request.";
        
        const lastBotMessage = messages.filter(msg => msg.sender === 'bot').pop();
        if (lastBotMessage && lastBotMessage.text === responseText) {
          if (responseText.includes("Good") && responseText.includes("Welcome to KSP Yarns")) {
            responseText = t("I see you're trying to ask something. Could you please be more specific? I can help with our products, ordering process, sustainability practices, and more.", "chatbot");
          } else {
            responseText += " " + t("Was there something specific about this you'd like to know?", "chatbot");
          }
        }
      } catch (error) {
        console.error("Error generating bot response:", error);
        responseText = "Sorry, I encountered an error. Please try again.";
      }
      
      const botResponse = {
        id: messageId + 1,
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        feedback: null,
        reaction: null
      };
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setIsTyping(false);
    }, 500 + Math.random() * 500); // Reduced response time for better responsiveness
  }, [findBotResponse, newMessage, messages, t]); // Added 't' dependency

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const getMessageGroups = useCallback(() => {
    const groups = [];
    let currentGroup = { date: null, messages: [] };

    messages.forEach(message => {
      try {
        const messageTimestamp = message.timestamp instanceof Date ? 
          message.timestamp : new Date(message.timestamp);
          
        if (isNaN(messageTimestamp.getTime())) {
          console.error('Invalid timestamp for message:', message);
          return;
        }
        
        const messageDate = messageTimestamp.toLocaleDateString();
        
        if (!currentGroup.date) {
          currentGroup.date = messageDate;
        } else if (currentGroup.date !== messageDate) {
          groups.push({ ...currentGroup });
          currentGroup = { date: messageDate, messages: [] };
        }
        
        currentGroup.messages.push(message);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
    if (currentGroup.date && currentGroup.messages.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  }, [messages]);

  const handleSuggestedQuestion = useCallback((question) => {
    if (!question) return;
    
    const messageId = Date.now();
    
    const isDuplicate = messages.some(msg => 
      msg.sender === 'user' && 
      msg.text === question && 
      (new Date().getTime() - new Date(msg.timestamp).getTime()) < 2000
    );
    
    if (isDuplicate) return;
    
    const userMessage = {
      id: messageId,
      text: question,
      sender: 'user',
      timestamp: new Date(),
      feedback: null,
      reaction: null
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsTyping(true);
    
    setTimeout(() => {
      let responseText;
      try {
        responseText = findBotResponse(question) || "I'm sorry, I couldn't process that request.";
        
        const lastBotMessage = messages.filter(msg => msg.sender === 'bot').pop();
        if (lastBotMessage && lastBotMessage.text === responseText) {
          responseText = `${responseText.split('.')[0]}. ${t("Let me provide more details on this topic.", "chatbot")} ${
            responseText.split('.').slice(1).join('.')
          }`;
        }
      } catch (error) {
        console.error("Error generating bot response:", error);
        responseText = "Sorry, I encountered an error. Please try again.";
      }
      
      const botResponse = {
        id: messageId + 1,
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        feedback: null,
        reaction: null
      };
      
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  }, [findBotResponse, messages, t]);

  const formatTimestamp = useCallback((timestamp) => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.error("Invalid timestamp:", timestamp);
        return "";
      }
      return new Intl.DateTimeFormat('default', {
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "";
    }
  }, []);

  const formatDateMarker = useCallback((date) => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    
    if (date === today) return t("Today", "chatbot");
    if (date === yesterday) return t("Yesterday", "chatbot");
    return date;
  }, [t]);

  const startListening = useCallback(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      alert(t("Speech recognition is not supported in your browser.", "chatbot"));
    }
  }, [t]);

  const handleMessageFeedback = useCallback((messageId, feedbackType) => {
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === messageId 
          ? { ...message, feedback: feedbackType }
          : message
      )
    );
  }, []);
  
  const handleReactionClick = useCallback((messageId) => {
    setShowEmojiPicker(showEmojiPicker === messageId ? null : messageId);
  }, [showEmojiPicker]);
  
  const addReaction = useCallback((messageId, reactionType) => {
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === messageId 
          ? { ...message, reaction: reactionType }
          : message
      )
    );
    setShowEmojiPicker(null);
  }, []);
  
  const exportChatHistory = useCallback(() => {
    const chatHistory = messages.map(msg => {
      const sender = msg.sender === 'bot' ? 'KSP Assistant' : 'You';
      const time = new Date(msg.timestamp).toLocaleString();
      return `${time} - ${sender}: ${msg.text}`;
    }).join('\n\n');
    
    const blob = new Blob([chatHistory], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ksp-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [messages]); // Removed 't' dependency

  const clearChatHistory = useCallback(() => {
    if (window.confirm(t("Are you sure you want to clear the chat history?", "chatbot"))) {
      const newId = Date.now();
      setMessages([{
        id: newId,
        text: t("Hello! I'm KSP's AI assistant. How can I help you today?", "chatbot"), 
        sender: 'bot', 
        timestamp: new Date(),
        feedback: null,
        reaction: null
      }]);
      
      setConversationContext({
        lastTopic: null,
        userName: null,
        recentTopics: [],
        messageCount: 0
      });
      
      localStorage.removeItem('kspChatHistory');
      localStorage.removeItem('kspChatContext');
    }
  }, [t]); // Added 't' dependency

  useEffect(() => {
    setSuggestedQuestions([
      t("What products do you offer?", "chatbot"),
      t("How do I place an order?", "chatbot"),
      t("Tell me about your sustainability practices", "chatbot"),
    ]);
  }, [t]);

  const copyToClipboard = useCallback((text) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
    });
  }, []);

  const speakMessage = useCallback((text) => {
    if (!text) return;
    
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert(t("Text-to-speech is not supported in your browser.", "chatbot"));
    }
  }, [t]);

  const reactions = useMemo(() => ['👍', '👎', '❤️', '😊', '😮'], []);

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-blue-800 
                   text-white p-4 rounded-full shadow-lg hover:shadow-xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        aria-label={isOpen ? t("Close chat", "chatbot") : t("Open chat", "chatbot")}
      >
        {isOpen ? (
          <FaTimes className="text-xl" />
        ) : (
          <FaComments className="text-xl" />
        )}
      </motion.button>

      {/* Enhanced Robot greeting animation - more visible */}
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.5 }}
            transition={{ 
              type: "spring", 
              damping: 8,
              stiffness: 100,
              duration: 0.8
            }}
            className="fixed bottom-24 right-12 z-50 max-w-xs"
            style={{ pointerEvents: 'none' }} // Make sure it doesn't block interaction
          >
            {/* Thread connecting robot to bubble - made thicker and more visible */}
            <motion.div 
              className="absolute bottom-0 left-8 w-2 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"
              initial={{ height: 0 }}
              animate={{ height: 60 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            />
            
            {/* Message bubble - larger and more colorful */}
            <div className="relative">
              <motion.div 
                className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6 rounded-xl rounded-bl-none shadow-xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center space-x-2 mb-3">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 1, repeat: 3, repeatDelay: 0.5 }}
                  >
                    <FaRobot className="text-2xl" />
                  </motion.div>
                  <span className="font-bold text-xl">KSP Assistant</span>
                </div>
                <motion.p 
                  className="text-md font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {t("Hi there! 👋 I'm your KSP Assistant! How can I help you today?", "chatbot")}
                </motion.p>
                
                {/* Animated arrow/indicator to chat button - larger and more obvious */}
                <motion.div
                  className="absolute right-2 bottom-[-30px]"
                  initial={{ x: 0 }}
                  animate={{ x: [0, 15, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <div className="text-blue-600 text-3xl font-bold">
                    ↓
                  </div>
                </motion.div>
              </motion.div>
              
              {/* Animated robot icon - larger and more animated */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, y: [0, -12, 0] }}
                transition={{ 
                  scale: { delay: 0.2, duration: 0.5 },
                  y: { repeat: Infinity, duration: 1.5, repeatType: "reverse" }
                }}
                className="absolute -left-10 -bottom-10 bg-gradient-to-r from-blue-700 to-blue-500 p-5 rounded-full text-white text-2xl shadow-lg border-4 border-white"
              >
                <motion.div
                  animate={{ rotateZ: [0, 15, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                >
                  <FaRobot />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 h-[500px] max-h-[80vh]
                       bg-white text-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200
                       flex flex-col"
            role="dialog"
            aria-labelledby="chat-title"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4">
              <div className="flex items-center">
                <div className="bg-white/20 p-2 rounded-full mr-3">
                  <FaRobot className="text-xl" />
                </div>
                <div>
                  <h3 className="font-bold" id="chat-title">{t("KSP Assistant", "chatbot")}</h3>
                  <p className="text-xs text-blue-100">{t("Online | AI Powered", "chatbot")}</p>
                </div>
                <div className="ml-auto flex">
                  <button 
                    onClick={exportChatHistory}
                    className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors mr-2"
                    aria-label={t("Export chat history", "chatbot")}
                    title={t("Export chat history", "chatbot")}
                  >
                    <FaVolumeUp className="text-sm" />
                  </button>
                  <button 
                    onClick={clearChatHistory}
                    className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors mr-2"
                    aria-label={t("Clear chat", "chatbot")}
                    title={t("Clear chat", "chatbot")}
                  >
                    <FaTimes className="text-sm" />
                  </button>
                  <button 
                    onClick={toggleChat}
                    className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                    aria-label={t("Close chat", "chatbot")}
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
              </div>
            </div>

            {visibleDateMarker && (
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs shadow-md">
                  {formatDateMarker(visibleDateMarker)}
                </div>
              </div>
            )}

            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 bg-gray-50"
              role="log"
              aria-live="polite"
            >
              {getMessageGroups().map((group, groupIndex) => (
                <div key={groupIndex}>
                  <div 
                    className="flex justify-center my-3"
                    data-date-marker={group.date}
                  >
                    <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs">
                      {formatDateMarker(group.date)}
                    </div>
                  </div>
                  
                  {group.messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      role="article"
                      aria-label={`${message.sender === 'user' ? 'Your message' : 'Assistant message'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white text-gray-800 rounded-tl-none shadow-md border border-gray-100'
                        } relative group`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.text ? 
                            message.text.split(/\b((?:https?:\/\/|www\.)[^\s]+\.[^\s]+)\b/).map((part, i) => {
                              if (part && part.match && part.match(/^(https?:\/\/|www\.)/)) {
                                return (
                                  <a 
                                    key={i} 
                                    href={part.startsWith('www.') ? `https://${part}` : part} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-300 hover:underline"
                                  >
                                    {part}
                                  </a>
                                );
                              } else {
                                return part || '';
                              }
                            })
                          : ''}
                        </p>
                        
                        <div className="flex justify-between items-center mt-1">
                          <span className={`text-xs ${
                            message.sender === 'user' 
                              ? 'text-blue-100' 
                              : 'text-gray-500'
                          }`}>
                            {formatTimestamp(message.timestamp)}
                          </span>
                          
                          {message.reaction && (
                            <span className="ml-2 text-xs">
                              {message.reaction}
                            </span>
                          )}
                        </div>
                        
                        <div className={`absolute ${message.sender === 'user' ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} 
                                       top-1/2 -translate-y-1/2 bg-white rounded-lg shadow-md border border-gray-100 p-1
                                       flex items-center opacity-0 group-hover:opacity-100 transition-opacity`}>
                          
                          {message.sender === 'bot' && (
                            <>
                              <button
                                onClick={() => handleMessageFeedback(message.id, 'helpful')}
                                className={`p-1 rounded-full ${message.feedback === 'helpful' ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-600'}`}
                                aria-label={t("Mark as helpful", "chatbot")}
                                title={t("Helpful", "chatbot")}
                              >
                                <FaThumbsUp size={12} />
                              </button>
                              <button
                                onClick={() => handleMessageFeedback(message.id, 'unhelpful')}
                                className={`p-1 rounded-full ${message.feedback === 'unhelpful' ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-600'}`}
                                aria-label={t("Mark as unhelpful", "chatbot")}
                                title={t("Not helpful", "chatbot")}
                              >
                                <FaThumbsDown size={12} />
                              </button>
                            </>
                          )}
                          
                          {message.sender === 'bot' && (
                            <button
                              onClick={() => copyToClipboard(message.text)}
                              className="p-1 rounded-full text-gray-400 hover:text-blue-600"
                              aria-label={t("Copy message", "chatbot")}
                              title={isCopying ? t("Copied!", "chatbot") : t("Copy to clipboard", "chatbot")}
                            >
                              <FaRegCopy size={12} />
                            </button>
                          )}
                          
                          <button
                            onClick={() => speakMessage(message.text)}
                            className="p-1 rounded-full text-gray-400 hover:text-blue-600"
                            aria-label={t("Speak message", "chatbot")}
                            title={t("Read aloud", "chatbot")}
                          >
                            <FaVolumeUp size={12} />
                          </button>
                          
                          <button
                            onClick={() => handleReactionClick(message.id)}
                            className="p-1 rounded-full text-gray-400 hover:text-blue-600"
                            aria-label={t("Add reaction", "chatbot")}
                            title={t("Add reaction", "chatbot")}
                          >
                            <FaRegSmile size={12} />
                          </button>
                          
                          {showEmojiPicker === message.id && (
                            <div className="absolute top-full mt-1 bg-white shadow-lg rounded-lg border border-gray-200 p-1 z-10">
                              <div className="flex">
                                {reactions.map((emoji, i) => (
                                  <button
                                    key={i}
                                    onClick={() => addReaction(message.id, emoji)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-4"
                  aria-live="polite"
                  aria-label={t("Bot is typing", "chatbot")}
                >
                  <div className="bg-white text-gray-600 shadow-md border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2">
                    <div className="flex space-x-2">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, repeatDelay: 0.2 }}
                        className="w-2 h-2 bg-blue-600 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2, repeatDelay: 0.2 }}
                        className="w-2 h-2 bg-blue-600 rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4, repeatDelay: 0.2 }}
                        className="w-2 h-2 bg-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {isUserTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end mb-4"
                  aria-live="polite"
                  aria-label={t("You are typing", "chatbot")}
                >
                  <div className="bg-blue-100 text-blue-600 rounded-2xl rounded-tr-none px-3 py-1 text-xs">
                    {t("typing...", "chatbot")}
                  </div>
                </motion.div>
              )}

              {!isTyping && messages.length > 0 && messages[messages.length - 1].sender === 'bot' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 mt-2"
                >
                  <div className="flex items-center mb-2">
                    <FaLightbulb className="text-yellow-500 mr-2" />
                    <span className="text-xs text-gray-500">
                      {t("Suggested questions:", "chatbot")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="bg-blue-50 text-blue-700 border border-blue-100 text-xs py-1 px-3 rounded-full hover:bg-blue-100"
                      >
                        {question}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t bg-white border-gray-200">
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t("Type your message...", "chatbot")}
                  className="w-full p-3 pr-20 bg-gray-100 text-gray-800 placeholder-gray-500 border-gray-200 
                           border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  style={{ 
                    minHeight: '48px',
                    maxHeight: '120px',
                    height: Math.min(120, Math.max(48, newMessage && newMessage.split ? newMessage.split('\n').length * 24 : 48)) + 'px'
                  }}
                  aria-label={t("Message input", "chatbot")}
                />
                
                <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={startListening}
                    className={`p-2 rounded-full ${
                      isListening 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    disabled={isTyping}
                    aria-label={isListening ? t("Stop listening", "chatbot") : t("Start voice input", "chatbot")}
                    title={isListening ? t("Stop listening", "chatbot") : t("Voice input", "chatbot")}
                  >
                    <FaMicrophone className={isListening ? 'animate-pulse' : ''} />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendMessage}
                    className={`p-2 rounded-full ${
                      newMessage.trim() === '' 
                        ? 'bg-blue-300 text-white cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={newMessage.trim() === '' || isTyping}
                    aria-label={t("Send message", "chatbot")}
                    title={t("Send message", "chatbot")}
                  >
                    {isTyping ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaPaperPlane />
                    )}
                  </motion.button>
                </div>
              </div>
              
              <div className="text-center mt-2">
                <small className="text-xs text-gray-400">
                  {t("KSP's AI assistant helps with product inquiries and support", "chatbot")}
                </small>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;