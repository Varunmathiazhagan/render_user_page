// Sanitize user input to prevent XSS and injection attacks

// Strip HTML tags from a string
export const stripHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '');
};

// Sanitize a text input value - trim, strip HTML tags, normalize whitespace
export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return stripHtml(str).replace(/\s+/g, ' ').trim();
};

// Sanitize all string values in an object
export const sanitizeFormData = (data) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    sanitized[key] = typeof value === 'string' ? sanitizeInput(value) : value;
  }
  return sanitized;
};
