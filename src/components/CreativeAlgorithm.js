/**
 * HarmonicBlend™ Creative Recommendation Algorithm
 * This module provides utility functions for generating creative and unique
 * recommendations based on user inputs and randomization factors
 */

// Generate seeded random number for deterministic but unique results
export const seededRandom = (seed) => {
  // Using a better algorithm for more uniform distribution
  let t = seed + 0.947596;
  return (Math.abs(Math.sin(t * 329.017) * 427.5453) % 1);
};

// Apply creativity factor to sorting and scoring
export const applyCreativityFactor = (baseScore, creativityFactor, seed, itemId) => {
  // Determine how much randomness vs. logic to use
  const randomInfluence = creativityFactor * seededRandom(seed + itemId);
  const logicInfluence = (1 - creativityFactor) * baseScore;
  
  // Enhanced oscillation pattern using multiple frequencies for more organic patterns
  const primaryOsc = Math.sin(seed * itemId * 0.001) * creativityFactor * 0.2;
  const secondaryOsc = Math.cos(seed * itemId * 0.003) * creativityFactor * 0.1;
  const oscillation = primaryOsc + secondaryOsc;
  
  // Apply non-linear transformation for more nuanced results
  const rawScore = randomInfluence + logicInfluence + oscillation;
  return 0.1 + 0.8 * (1 / (1 + Math.exp(-3 * (rawScore - 0.5)))); // Sigmoid transformation
};

// Generate creative reasons based on item and preferences
export const generateCreativeInsight = (item, preferences, seed, creativityFactor) => {
  const genericInsights = [
    "Perfect color harmony", 
    "Trending this season",
    "Artisanal quality",
    "Limited availability",
    "Exceptional texture",
    "Regional specialty",
    "Masterfully crafted",
    "Sustainably sourced",
    "Premium selection",
    "Versatile application",
    "Designer's choice",
    "Technical excellence"
  ];
  
  // Context-aware insights based on item properties
  const contextualInsights = {};
  
  if (item.category) {
    contextualInsights.fashion = [
      "Complements your style profile",
      "Elevates your existing collection",
      "Perfect with your recent purchases"
    ];
    
    contextualInsights.home = [
      "Matches your home aesthetic",
      "Creates harmony with your spaces",
      "Reflects your unique taste"
    ];
    
    contextualInsights.tech = [
      "Aligns with your tech ecosystem",
      "Enhances your workflow",
      "Compatible with your devices"
    ];
  }
  
  // Combined insights pool
  let insightPool = [...genericInsights];
  if (item.category && contextualInsights[item.category]) {
    insightPool = [...insightPool, ...contextualInsights[item.category]];
  }
  
  // More creative = more random insights
  const randomIndex = Math.floor(seededRandom(seed + item.id) * insightPool.length);
  const secondaryIndex = Math.floor(seededRandom(seed + item.id + 100) * insightPool.length);
  
  // With higher creativity, add unexpected combinations
  if (creativityFactor > 0.8) {
    const tertiaryIndex = Math.floor(seededRandom(seed + item.id + 200) * insightPool.length);
    return [insightPool[randomIndex], insightPool[secondaryIndex], insightPool[tertiaryIndex]];
  } else if (creativityFactor > 0.5) {
    return [insightPool[randomIndex], insightPool[secondaryIndex]];
  }
  
  return [insightPool[randomIndex]];
};

// Calculate how well item matches preferences with creative factor
export const calculateCreativeMatch = (item, preferences, creativityFactor, seed) => {
  let baseScore = 0.5; // Start at 50%
  
  // Add more sophisticated preference matching if available
  if (preferences && item.attributes) {
    let matchSum = 0;
    let weightSum = 0;
    
    Object.keys(preferences).forEach(pref => {
      if (item.attributes[pref]) {
        const weight = preferences[pref].weight || 1;
        const similarity = 1 - Math.abs(preferences[pref].value - item.attributes[pref]) / 10;
        matchSum += similarity * weight;
        weightSum += weight;
      }
    });
    
    if (weightSum > 0) {
      baseScore = matchSum / weightSum;
    }
  }
  
  // Add randomness based on creativity factor with diminishing effect for high scores
  const randomComponent = seededRandom(seed + item.id) * creativityFactor * (1 - baseScore * 0.5);
  
  // Add logical component based on preference matching
  const logicalComponent = (1 - creativityFactor) * baseScore * 0.4;
  
  return Math.min(0.95, Math.max(0.35, baseScore + randomComponent + logicalComponent));
};

// NEW: Ensure diversity in recommendations by adjusting scores based on similarity to previous selections
export const promoteDiversity = (recommendations, previousSelections, diversityFactor = 0.3) => {
  if (!previousSelections || previousSelections.length === 0) {
    return recommendations;
  }
  
  return recommendations.map(rec => {
    // Calculate similarity to previous selections
    const similarities = previousSelections.map(prev => {
      // Simple category-based similarity
      if (prev.category === rec.item.category) return 0.7;
      // Simple attribute-based similarity
      if (prev.attributes && rec.item.attributes) {
        const sharedAttributes = Object.keys(prev.attributes).filter(
          attr => rec.item.attributes[attr] === prev.attributes[attr]
        );
        if (sharedAttributes.length > 0) {
          return 0.3 * (sharedAttributes.length / Object.keys(prev.attributes).length);
        }
      }
      return 0;
    });
    
    // Average similarity
    const avgSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / 
                          Math.max(1, similarities.length);
    
    // Adjust score to promote diversity
    const diversityAdjustment = -avgSimilarity * diversityFactor;
    
    return {
      ...rec,
      score: Math.max(0.1, Math.min(0.95, rec.score + diversityAdjustment))
    };
  });
};
