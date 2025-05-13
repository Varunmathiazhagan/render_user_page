import React, { useState } from "react";
import { FaSpinner, FaRobot, FaThumbsUp, FaExclamationCircle, FaStar, FaRandom, FaMagic, FaDice, FaLightbulb, FaPalette } from "react-icons/fa";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import RobotLoader from './RobotLoader';
import { useTranslation } from "../utils/TranslationContext";

// Add ScrollProgressBar component with gradient
const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll()
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 origin-left z-50"
      style={{ scaleX: scrollYProgress }}
    />
  )
}

const RecommendationsPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 3;
  const uniquenessFactor = 0.5;
  const [sessionSeed, setSessionSeed] = useState(Date.now());
  const [lastInputSignature, setLastInputSignature] = useState("");

  const counts = ['2/20s', '2/30s']; // Only counts found in the data

  const priceRanges = [
    '₹120-140/kg',
    '₹140-160/kg',
    '₹160-180/kg',
    '₹180-200/kg'
  ];

  const purposes = [
    t('Weaving', 'recommendations'),
    t('Knitting', 'recommendations'),
    t('Hosiery', 'recommendations'),
    t('Denim Manufacturing', 'recommendations'),
    t('Technical Textiles', 'recommendations'),
    t('Carpet Manufacturing', 'recommendations'),
    t('Garment Production', 'recommendations'),
    t('Home Textiles', 'recommendations'),
    t('Industrial Use', 'recommendations'),
    t('Medical Textiles', 'recommendations')
  ];

  const blends = [
    t('100% Cotton', 'recommendations'),
    t('Poly/Cotton 65/35', 'recommendations'),
    t('Poly/Cotton 50/50', 'recommendations'),
    t('Cotton/Modal 60/40', 'recommendations'),
    t('Cotton/Viscose 70/30', 'recommendations'),
    t('Polyester/Viscose', 'recommendations'),
    t('Cotton/Polyester/Spandex', 'recommendations'),
    t('Cotton/Lycra', 'recommendations'),
    t('Bamboo/Cotton', 'recommendations'),
    t('Organic Cotton', 'recommendations')
  ];

  const ratings = [
    t('4★ & above', 'recommendations'),
    t('4.5★ & above', 'recommendations'),
    t('5★ only', 'recommendations')
  ];

  const [userPreferences, setUserPreferences] = useState({
    purpose: '',
    priceRange: '',
    quantity: '',
    count: '',
    blend: '',
    rating: '',
    creativeFactor: '0.5'
  });

  const allRecommendations = [
    [
      [
        {
          "id": 1,
          "name": "2/20(s) Grey Yarn",
          "price": 128,
          "category": "Yarn",
          "rating": 4,
          "image": "/images/20(s)Grey.jpg",
          "stock": 0,
          "color": "Melange Grey"
        },
        {
          "id": 2,
          "name": "2/20(s) Red Yarn",
          "price": 150,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/30(s)Red.jpg",
          "stock": 100,
          "color": "Dyed - Red"
        },
        {
          "id": 3,
          "name": "2/20(s) Black Yarn",
          "price": 145,
          "category": "Yarn",
          "rating": 4,
          "image": "/images/20(s)Black.jpg",
          "stock": 40
        },
        {
          "id": 4,
          "name": "2/20(s) Sky Blue Yarn",
          "price": 155,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/20(s)Sky_Blue.jpg",
          "stock": 45
        },
        {
          "id": 5,
          "name": "2/20(s) steel_Grey Yarn",
          "price": 138,
          "category": "Yarn",
          "rating": 4,
          "image": "/images/20(s)steel_grey.jpg",
          "stock": 22
        },
        {
          "id": 6,
          "name": "2/20(s) white Yarn",
          "price": 144,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/20(s)White.jpg",
          "stock": 22
        },
        {
          "id": 9,
          "name": "2/20(s)H_White",
          "price": 144,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/30(s)H_White.jpg",
          "stock": 59
        },
        {
          "id": 10,
          "name": "20(s)Light_milange",
          "price": 177,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/20(s)Light_milange.jpg",
          "stock": 77
        },
        {
          "id": 11,
          "name": "20(s)Nut_Brown",
          "price": 123,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/20(s)Nut_Brown.jpg",
          "stock": 44
        },
        {
          "id": 12,
          "name": "20(s)Onion",
          "price": 187,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/20(s)Onion.jpg",
          "stock": 17
        },
        {
          "id": 13,
          "name": "20(s)Rose",
          "price": 146,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/20(s)Rose.jpg",
          "stock": 41
        },
        {
          "id": 14,
          "name": "20(s)violet",
          "price": 132,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/20(s)violet.jpg",
          "stock": 55
        },
        {
          "id": 15,
          "name": "20(s)Water_green",
          "price": 145,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/20(s)Water_green.jpg",
          "stock": 66
        },
        {
          "id": 16,
          "name": "20(s)Yellow",
          "price": 122,
          "category": "Yarn",
          "rating": 4,
          "image": "/images/20(s)Yellow.jpg",
          "stock": 21
        },
        {
          "id": 17,
          "name": "30(s)Black",
          "price": 154,
          "category": "Yarn",
          "rating": 4,
          "image": "/images/30(s)Black.jpg",
          "stock": 36
        },
        {
          "id": 18,
          "name": "30(s)Dark_Green",
          "price": 122,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/30(s)Dark_Green.jpg",
          "stock": 22
        },
        {
          "id": 19,
          "name": "30(s)Dark_milange",
          "price": 166,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/30(s)Dark_milange.jpg",
          "stock": 54
        },
        {
          "id": 20,
          "name": "30(s)kavee",
          "price": 133,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/30(s)kavee.jpg",
          "stock": 36
        },
        {
          "id": 21,
          "name": "30(s)L_Rose",
          "price": 134,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/30(s)L_Rose.jpg",
          "stock": 66
        },
        {
          "id": 22,
          "name": "30(s)Light_Pink",
          "price": 155,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/30(s)Light_Pink.jpg",
          "stock": 55
        },
        {
          "id": 23,
          "name": "30(s)p.Green",
          "price": 166,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/30(s)p.Green.jpg",
          "stock": 55
        },
        {
          "id": 24,
          "name": "30(s)Pink",
          "price": 157,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/30(s)Pink.jpg",
          "stock": 30
        },
        {
          "id": 25,
          "name": "30(s)T_Blue",
          "price": 177,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/30(s)T_Blue.jpg",
          "stock": 77
        },
        {
          "id": 26,
          "name": "30(s)WaterGreen",
          "price": 154,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/30(s)WaterGreen.jpg",
          "stock": 44
        },
        {
          "id": 27,
          "name": "20(s)Baby_Pink",
          "price": 166,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/20(s)Baby_Pink.jpg",
          "stock": 44
        },
        {
          "id": 28,
          "name": "30(s)Brown",
          "price": 166,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/30(s)Brown.jpg",
          "stock": 66
        },
        {
          "id": 29,
          "name": "30(s)Red",
          "price": 154,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/30(s)Red.jpg",
          "stock": 55
        },
        {
          "id": 30,
          "name": "30(s)Yellow",
          "price": 155,
          "category": "Yarn",
          "rating": 5,
          "image": "/images/30(s)Yellow.jpg",
          "stock": 64
        }
        
      ]
    ]
  ];

  // Generate a pseudo-random number using a seed
  const seededRandom = (seed, index = 0) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };

  const generateCreativeRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create an input signature to detect changes
      const inputSignature = JSON.stringify(userPreferences);
      const hasChangedInput = inputSignature !== lastInputSignature;
      
      if (hasChangedInput) {
        setSessionSeed(Date.now()); // New seed for new inputs
        setLastInputSignature(inputSignature);
      }

      // Increased timing from 3000ms to 7000ms
      await new Promise(resolve => setTimeout(resolve, 7000));
      const products = allRecommendations[0][0];
      const creativity = parseFloat(userPreferences.creativeFactor || uniquenessFactor);
      
      // Apply creative shuffling algorithm
      let productsShuffled = [...products];
      
      // Shuffle based on uniqueness factor and session seed
      for (let i = productsShuffled.length - 1; i > 0; i--) {
        const randomFactor = seededRandom(sessionSeed, i);
        const shouldSwap = randomFactor < creativity;
        
        if (shouldSwap) {
          const j = Math.floor(seededRandom(sessionSeed + i) * i);
          [productsShuffled[i], productsShuffled[j]] = [productsShuffled[j], productsShuffled[i]];
        }
      }
      
      // Apply creative filtering
      let filteredRecommendations = productsShuffled
        .filter(item => {
          // Base stock check with creative factor
          const stockCheck = creativity > 0.7 ? 
            true : // Ignore stock at high creativity
            item.stock > 0;
          
          return stockCheck;
        })
        .map(item => {
          // Apply creativity to item properties
          const creativityInfluence = Math.pow(creativity, 2) * 0.4;
          const creativePrice = Math.round(item.price * (1 + (seededRandom(sessionSeed + item.id) - 0.5) * creativityInfluence));
          
          return {
            ...item,
            displayPrice: creativePrice,
            originalPrice: item.price,
            confidence: calculateCreativeConfidence(item, userPreferences, sessionSeed, creativity),
            reason: generateCreativeReason(item, userPreferences, sessionSeed, creativity)
          };
        })
        .sort((a, b) => {
          // Creativity influences sorting
          if (creativity > 0.8) {
            // Highly random at high creativity
            return seededRandom(sessionSeed + a.id + b.id) - 0.5;
          } 
          
          // Mix of creative and logical sorting
          const randomFactor = seededRandom(sessionSeed + a.id + b.id) * creativity;
          const logicalFactor = b.confidence - a.confidence;
          
          return (logicalFactor * (1 - creativity)) + (randomFactor * 2 - 1);
        })
        .slice(0, Math.max(3, Math.floor(3 + creativity * 4))); // More results at higher creativity

      if (filteredRecommendations.length === 0) {
        setError("No products found with your criteria. Try increasing the creativity level!");
        setRecommendations([]);
      } else {
        setCurrentPage(0);
        setRecommendations(filteredRecommendations);
      }
    } catch (err) {
      setError("Failed to generate creative recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateCreativeConfidence = (item, preferences, seed, creativity) => {
    // Base confidence
    let score = 0.5;
    
    // Use seed to create deterministic but unique confidence scores
    const baseRandom = seededRandom(seed + item.id);
    
    // Add time-based plus preference-based randomization
    const timeVariation = Math.sin((seed % 10000) / 10000) * 0.2;
    const preferenceMultiplier = Object.values(preferences).filter(Boolean).length * 0.05;
    
    // Add stock-based confidence with creativity modifier
    const stockFactor = Math.min(item.stock / 100, 1) * 0.3;
    
    // Creativity influences how much randomness affects the score
    const randomInfluence = baseRandom * creativity;
    const logicalInfluence = (stockFactor + preferenceMultiplier) * (1 - creativity * 0.7);
    
    score += randomInfluence + logicalInfluence + timeVariation * creativity;
    
    // Ensure score stays within bounds - adjust range to be more reasonable
    return Math.min(0.95, Math.max(0.35, score));
  };

  const generateCreativeReason = (item, preferences, seed, creativity) => {
    // Creative reason arrays
    const insightTypes = [
      ["Market trending", "Regional popularity", "Limited availability", "Artisan crafted"],
      ["Seasonal choice", "Designer pick", "Best value", "Premium option"],
      ["Sustainable choice", "Eco-friendly", "Ethically sourced", "Community supported"],
      ["Innovative blend", "Traditional technique", "Modern application", "Versatile use"]
    ];
    
    const qualityInsights = [
      ["Excellent texture", "Superior finish", "Long-lasting", "Color-fast"],
      ["Soft handle", "Smooth texture", "Rich color", "Consistent quality"],
      ["Moisture-wicking", "Temperature regulating", "Easy care", "Durable performance"]
    ];
    
    const creativeUses = [
      ["Perfect for detailed work", "Ideal for everyday projects", "Great for beginners"],
      ["Works well with mixed techniques", "Excellent drape properties", "Superior stitch definition"],
      ["Unusual texture effects", "Creates stunning gradients", "Holds patterns beautifully"]
    ];

    const reasons = [];
    
    // Use seed to deterministically select reasons while maintaining creativity
    const typeIndex = Math.floor(seededRandom(seed + item.id) * insightTypes.length);
    const insightIndex = Math.floor(seededRandom(seed + item.id + 1) * insightTypes[typeIndex].length);
    
    reasons.push(insightTypes[typeIndex][insightIndex]);
    
    // Add more creative insights based on creativity level
    if (creativity > 0.3) {
      const qualityIndex = Math.floor(seededRandom(seed + item.id + 2) * qualityInsights.length);
      const qualitySubIndex = Math.floor(seededRandom(seed + item.id + 3) * qualityInsights[qualityIndex].length);
      reasons.push(qualityInsights[qualityIndex][qualitySubIndex]);
    }
    
    if (creativity > 0.7) {
      const useIndex = Math.floor(seededRandom(seed + item.id + 4) * creativeUses.length);
      const useSubIndex = Math.floor(seededRandom(seed + item.id + 5) * creativeUses[useIndex].length);
      reasons.push(creativeUses[useIndex][useSubIndex]);
    }
    
    // Add stock-based reason with creative twist
    if (item.stock > 75) {
      reasons.push(creativity > 0.5 ? 'Flying off the shelves!' : 'High availability');
    } else if (item.stock > 40) {
      reasons.push(creativity > 0.5 ? 'Carefully curated stock' : 'Good availability');
    } else {
      reasons.push(creativity > 0.5 ? 'Exclusive limited batch' : 'Limited availability');
    }
    
    // Add rating with creative twist
    if (creativity > 0.6) {
      // Create a slightly modified rating at high creativity
      const creativeRating = Math.min(5, Math.max(1, 
        item.rating + (seededRandom(seed + item.id * 2) - 0.5) * creativity
      )).toFixed(1);
      reasons.push(`${creativeRating}★ artisan rating`);
    } else {
      reasons.push(`${item.rating}★ rated`);
    }

    return reasons.join(' • ');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userPreferences.color && !userPreferences.count && !userPreferences.priceRange) {
      setError("Please select at least one filter criterion");
      return;
    }
    generateCreativeRecommendations();
  };
  
  const handleSurpriseMe = () => {
    // Set random preferences
    const randomPrefs = {
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      priceRange: priceRanges[Math.floor(Math.random() * priceRanges.length)],
      count: counts[Math.floor(Math.random() * counts.length)],
      blend: blends[Math.floor(Math.random() * blends.length)],
      rating: ratings[Math.floor(Math.random() * ratings.length)],
      quantity: Math.floor(Math.random() * 100) + 1,
      creativeFactor: (Math.random() * 0.5 + 0.5).toFixed(2) // High creativity for surprise
    };
    
    setUserPreferences(randomPrefs);
    setSessionSeed(Date.now());
    generateCreativeRecommendations();
  };

  const pageCount = Math.ceil(recommendations.length / ITEMS_PER_PAGE);
  const currentItems = recommendations.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8"
    >
      <ScrollProgressBar />
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 flex items-center">
              <FaRobot className="text-blue-500 mr-3" />
              {t('AI Yarn Recommendations', 'recommendations')}
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            {t('Discover unique yarn suggestions tailored to your preferences', 'recommendations')}
          </p>
          <div className="mt-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-yellow-700 p-2 rounded-lg inline-block shadow-sm">
            <FaMagic className="inline mr-2 text-amber-500" /> {t('Each search gives unique results!', 'recommendations')}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ x: -50 }} 
            animate={{ x: 0 }} 
            className="rounded-lg shadow-lg overflow-hidden"
          >
            <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="bg-white p-6">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">{t('Your Preferences', 'recommendations')}</span>
                <motion.button
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSurpriseMe}
                  className="ml-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white p-2 rounded-full hover:shadow-lg transition-all duration-300"
                  title="Surprise Me!"
                >
                  <FaDice />
                </motion.button>
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">{t('Purpose', 'recommendations')}</label>
                  <select
                    value={userPreferences.purpose}
                    onChange={(e) => setUserPreferences({ ...userPreferences, purpose: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('Select purpose', 'recommendations')}</option>
                    {purposes.map(purpose => (
                      <option key={purpose} value={purpose}>{purpose}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">{t('Blend Type', 'recommendations')}</label>
                  <select
                    value={userPreferences.blend}
                    onChange={(e) => setUserPreferences({ ...userPreferences, blend: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('Select blend', 'recommendations')}</option>
                    {blends.map(blend => (
                      <option key={blend} value={blend}>{blend}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">{t('Minimum Rating', 'recommendations')}</label>
                  <select
                    value={userPreferences.rating}
                    onChange={(e) => setUserPreferences({ ...userPreferences, rating: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('Any rating', 'recommendations')}</option>
                    {ratings.map(rating => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">{t('Count', 'recommendations')}</label>
                  <select
                    value={userPreferences.count}
                    onChange={(e) => setUserPreferences({ ...userPreferences, count: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('Select count', 'recommendations')}</option>
                    {counts.map(count => (
                      <option key={count} value={count}>{count}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">{t('Price Range', 'recommendations')}</label>
                  <select
                    value={userPreferences.priceRange}
                    onChange={(e) => setUserPreferences({ ...userPreferences, priceRange: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('Select price range', 'recommendations')}</option>
                    {priceRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">{t('Quantity (kg)', 'recommendations')}</label>
                  <input
                    type="number"
                    value={userPreferences.quantity}
                    onChange={(e) => setUserPreferences({ ...userPreferences, quantity: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={t('Enter quantity', 'recommendations')}
                    min="1"
                    max="1000"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2 flex justify-between">
                    <span>{t('Creativity Factor', 'recommendations')}</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 font-medium">
                      {parseFloat(userPreferences.creativeFactor || 0.5).toFixed(2)}
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 rounded-lg opacity-30"></div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={userPreferences.creativeFactor || 0.5}
                      onChange={(e) => setUserPreferences({ 
                        ...userPreferences, 
                        creativeFactor: e.target.value 
                      })}
                      className="relative w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600 z-10"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{t('Logical', 'recommendations')}</span>
                    <span>{t('Creative', 'recommendations')}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-3 rounded-lg transition-all duration-300 flex items-center justify-center shadow-md"
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaMagic className="mr-2" />}
                  {loading ? t('Generating...', 'recommendations') : t('Get Creative Recommendations', 'recommendations')}
                </motion.button>
              </form>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: 50 }} 
            animate={{ x: 0 }} 
            className="rounded-lg shadow-lg overflow-hidden"
          >
            <div className="h-2 bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500"></div>
            <div className="bg-white p-6">
              <h2 className="text-2xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-teal-500">{t('Creative Suggestions', 'recommendations')}</h2>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 flex items-center border border-red-200">
                  <FaExclamationCircle className="mr-2" />
                  {error}
                </motion.div>
              )}

              <AnimatePresence mode='wait'>
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col justify-center items-center min-h-[400px]"
                  >
                    <RobotLoader />
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-6 text-center"
                    >
                      <h3 className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                        {t('Analyzing Yarn Patterns...', 'recommendations')}
                      </h3>
                      <motion.div
                        className="text-gray-500"
                        animate={{
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <p className="mb-1">{t('Processing', 'recommendations')} {userPreferences.creativeFactor > 0.7 ? t('highly creative', 'recommendations') : userPreferences.creativeFactor > 0.3 ? t('balanced', 'recommendations') : t('logical', 'recommendations')} {t('recommendations', 'recommendations')}</p>
                        <p className="text-sm text-gray-400">{t('Matching your preferences with available yarns', 'recommendations')}</p>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                ) : recommendations.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-gray-500 text-center py-12 px-4"
                  >
                    <p className="text-lg mb-4">{t('Select your preferences or use the Surprise Me button!', 'recommendations')}</p>
                    <motion.div 
                      animate={{ 
                        y: [0, -10, 0],
                        filter: ["drop-shadow(0 0 0 rgba(168, 85, 247, 0))", "drop-shadow(0 0 10px rgba(168, 85, 247, 0.7))", "drop-shadow(0 0 0 rgba(168, 85, 247, 0))"]
                      }} 
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-5xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <FaMagic />
                    </motion.div>
                  </motion.div>
                ) : (
                  <>
                    {currentItems.map((item, index) => (
                      <motion.div
                        key={`${item.id}-${sessionSeed}-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-4 rounded-lg mb-4 hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                        style={{
                          backgroundImage: 'linear-gradient(to right, white, white)',
                          backgroundSize: '100% 100%',
                          backgroundRepeat: 'no-repeat'
                        }}
                      >
                        {/* Gradient border effect */}
                        <div className="absolute inset-0 rounded-lg p-[1px]">
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        
                        <div className="flex items-start space-x-4 relative z-10">
                          <div className="relative">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-24 h-24 object-cover rounded-lg bg-gray-100 shadow-md"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/images/default_yarn.jpg";
                              }}
                            />
                            {parseFloat(userPreferences.creativeFactor || 0.5) > 0.7 && (
                              <motion.div 
                                className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs shadow-lg"
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                              >
                                <FaRandom />
                              </motion.div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{item.name}</h3>
                            <div className="flex items-center text-purple-600 mb-2">
                              <FaThumbsUp className="mr-1" />
                              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 font-medium">
                                {/* Update matching percentage calculation for more reasonable display */}
                                {Math.round(65 + item.confidence * 30)}% {t('Match', 'recommendations')}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">{item.reason}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold">₹{item.displayPrice}</p>
                              {item.displayPrice !== item.originalPrice && parseFloat(userPreferences.creativeFactor || 0.5) > 0.6 && (
                                <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200">
                                  {item.displayPrice > item.originalPrice ? t('Premium selection', 'recommendations') : t('Special offer', 'recommendations')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center mt-2">
                              {[...Array(Math.floor(item.rating))].map((_, i) => (
                                <FaStar key={i} className="text-amber-400 mr-1 drop-shadow-sm" />
                              ))}
                              {item.rating % 1 !== 0 && (
                                <FaStar className="text-amber-300 mr-1 drop-shadow-sm" />
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Pagination Controls */}
                    {pageCount > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                          disabled={currentPage === 0}
                          className="px-3 py-1 rounded bg-gradient-to-r from-blue-500 to-indigo-500 text-white disabled:opacity-50 shadow-sm"
                        >
                          {t('Previous', 'recommendations')}
                        </button>
                        <span className="px-3 py-1 bg-gray-50 rounded shadow-sm">
                          {t('Page', 'recommendations')} {currentPage + 1} {t('of', 'recommendations')} {pageCount}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(pageCount - 1, p + 1))}
                          disabled={currentPage === pageCount - 1}
                          className="px-3 py-1 rounded bg-gradient-to-r from-indigo-500 to-purple-500 text-white disabled:opacity-50 shadow-sm"
                        >
                          {t('Next', 'recommendations')}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ y: 20 }} 
          animate={{ y: 0 }} 
          className="rounded-lg shadow-lg mt-8 overflow-hidden"
        >
          <div className="h-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"></div>
          <div className="bg-white p-6">
            <h2 className="text-2xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">{t('About Creative Recommendations', 'recommendations')}</h2>
            <p className="text-gray-600 mb-4">
              {t('Our creative recommendation system uses advanced algorithms to suggest yarns that might inspire your next project. Adjust the creativity slider to control how unique and surprising your recommendations will be:', 'recommendations')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-md overflow-hidden shadow-sm">
                <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <div className="bg-blue-50 p-3">
                  <h3 className="font-bold mb-1 text-blue-700 flex items-center">
                    <FaLightbulb className="mr-2 text-blue-500" />
                    {t('Low Creativity (0.0-0.3)', 'recommendations')}
                  </h3>
                  <p>{t('More logical recommendations based closely on your preferences.', 'recommendations')}</p>
                </div>
              </div>
              <div className="rounded-md overflow-hidden shadow-sm">
                <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                <div className="bg-purple-50 p-3">
                  <h3 className="font-bold mb-1 text-purple-700 flex items-center">
                    <FaPalette className="mr-2 text-purple-500" />
                    {t('Medium Creativity (0.3-0.7)', 'recommendations')}
                  </h3>
                  <p>{t('Balanced suggestions with some unique alternatives you might not have considered.', 'recommendations')}</p>
                </div>
              </div>
              <div className="rounded-md overflow-hidden shadow-sm">
                <div className="h-1 bg-gradient-to-r from-pink-400 to-pink-600"></div>
                <div className="bg-pink-50 p-3">
                  <h3 className="font-bold mb-1 text-pink-700 flex items-center">
                    <FaMagic className="mr-2 text-pink-500" />
                    {t('High Creativity (0.7-1.0)', 'recommendations')}
                  </h3>
                  <p>{t('Surprising and unconventional recommendations to spark new ideas!', 'recommendations')}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default RecommendationsPage;