/**
 * TEXT NORMALIZATION UTILITIES
 * Handles accent removal, special characters, and fuzzy matching
 */

/**
 * Normalizes text by removing diacritics (accents) and special characters
 * Examples: 
 * - "Açaí" → "acai"
 * - "Café" → "cafe"
 * - "Pão de Queijo" → "pao de queijo"
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s]/g, ' ')         // Replace special chars with space
    .replace(/\s+/g, ' ')             // Normalize multiple spaces
    .trim();
}

/**
 * Creates a regex pattern for fuzzy matching that ignores accents
 * Converts each character to a character class that matches accented variants
 */
export function createAccentInsensitivePattern(query: string): RegExp {
  const normalized = normalizeText(query);
  
  const accentMap: Record<string, string> = {
    'a': '[aáàâãäå]',
    'e': '[eéèêë]',
    'i': '[iíìîï]',
    'o': '[oóòôõö]',
    'u': '[uúùûü]',
    'c': '[cç]',
    'n': '[nñ]',
  };
  
  const pattern = normalized
    .split('')
    .map(char => accentMap[char] || char)
    .join('');
  
  return new RegExp(pattern, 'gi');
}

/**
 * Checks if a string matches the search query (accent-insensitive)
 */
export function matchesQuery(text: string, query: string): boolean {
  if (!query || !text) return !query;
  
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  
  return normalizedText.includes(normalizedQuery);
}

/**
 * Calculates similarity score between two strings (0-1)
 * Higher score = better match
 */
export function calculateSimilarity(text: string, query: string): number {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  
  if (normalizedText === normalizedQuery) return 1;
  if (normalizedText.includes(normalizedQuery)) return 0.9;
  if (normalizedText.startsWith(normalizedQuery)) return 0.95;
  
  // Partial word matching
  const textWords = normalizedText.split(' ');
  const queryWords = normalizedQuery.split(' ');
  
  let matchCount = 0;
  for (const qWord of queryWords) {
    if (textWords.some(tWord => tWord.includes(qWord) || qWord.includes(tWord))) {
      matchCount++;
    }
  }
  
  return matchCount / queryWords.length * 0.8;
}

/**
 * Filters and sorts an array of items based on text similarity
 */
export function filterByTextSimilarity<T>(
  items: T[],
  query: string,
  getTextField: (item: T) => string,
  minSimilarity: number = 0.3
): T[] {
  if (!query || query.length < 2) return items;
  
  const normalizedQuery = normalizeText(query);
  
  return items
    .map(item => ({
      item,
      similarity: calculateSimilarity(getTextField(item), normalizedQuery),
    }))
    .filter(({ similarity }) => similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .map(({ item }) => item);
}

/**
 * Highlights matched portions in text
 */
export function highlightMatches(text: string, query: string): string {
  if (!query) return text;
  
  const pattern = createAccentInsensitivePattern(query);
  return text.replace(pattern, match => `<mark>${match}</mark>`);
}
