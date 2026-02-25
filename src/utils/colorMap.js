// Shared color map for yarn colors
export const colorMap = {
  'Red': '#FF0000',
  'Blue': '#0000FF',
  'Green': '#008000',
  'Yellow': '#FFFF00',
  'Purple': '#800080',
  'Pink': '#FFC0CB',
  'Orange': '#FFA500',
  'Brown': '#A52A2A',
  'Black': '#000000',
  'White': '#FFFFFF',
  'Gray': '#808080',
  'Beige': '#F5F5DC',
  'Teal': '#008080',
  'Navy': '#000080',
  'Navy Blue': '#000080',
  'Sky Blue': '#87CEEB',
  'Dark Green': '#006400',
  'Light Pink': '#FFB6C1',
  'Dark Milange': '#666666',
  'Light Milange': '#AAAAAA',
  'Steel Grey': '#71797E',
  'Maroon': '#800000',
  'Rose': '#FF007F',
  'Lavander': '#E6E6FA',
  'Majentha': '#FF00FF',
  'Nut Brown': '#5C4033',
  'Onion': '#CC7722',
  'Violet': '#8F00FF',
  'Water Green': '#73C2FB',
  'Peacock Green': '#00A693',
  'F Green': '#009E60',
  'T Blue': '#0087BD',
  'Baby Pink': '#F4C2C2',
  'L Rose': '#E8909C',
  'kavee': '#A0522D',
  'p Green': '#98FB98',
  'Water Blue': '#AEC6CF',
  'G Yellow': '#FFD700',
  'L Yellow': '#FFFFE0',
  'F Orange': '#FF5F1F',
  'C Orange': '#FF7F50',
  'H White': '#F8F8FF',
  'R Green': '#009900',
};

// Get hex color for a color name, with case-insensitive fallback
export const getColorHex = (colorName) => {
  if (!colorName) return '#CCCCCC';
  
  // Try direct mapping first
  if (colorMap[colorName]) return colorMap[colorName];
  
  // Try case-insensitive search
  const lowerColorName = colorName.toLowerCase();
  const colorKey = Object.keys(colorMap).find(key => 
    key.toLowerCase() === lowerColorName
  );
  
  return colorKey ? colorMap[colorKey] : '#CCCCCC';
};
