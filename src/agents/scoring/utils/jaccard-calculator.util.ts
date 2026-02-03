/**
 * Jaccard Similarity Calculator
 * Phase 4: Scoring Agents
 *
 * J(A,B) = |A ∩ B| / |A ∪ B|
 */

export class JaccardCalculatorUtil {
  /**
   * Calculate Jaccard similarity between two sets
   * @param setA - First set of strings
   * @param setB - Second set of strings
   * @returns Similarity score between 0 and 1
   */
  static calculate(setA: Set<string>, setB: Set<string>): number {
    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  /**
   * Calculate similarity from keyword arrays
   * @param keywordsA - First array of keywords
   * @param keywordsB - Second array of keywords
   * @returns Similarity score between 0 and 1
   */
  static fromArrays(keywordsA: string[], keywordsB: string[]): number {
    const setA = new Set(keywordsA.map((k) => k.toLowerCase()));
    const setB = new Set(keywordsB.map((k) => k.toLowerCase()));
    return this.calculate(setA, setB);
  }

  /**
   * Extract keywords from text using simple frequency analysis
   * @param text - Input text
   * @param limit - Maximum number of keywords to return
   * @returns Array of most frequent keywords
   */
  static extractKeywords(text: string, limit = 20): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const frequency = new Map<string, number>();
    for (const word of words) {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }

    return [...frequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  }
}
