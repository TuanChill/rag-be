/**
 * Recommendation type enums and interfaces for the recommendations engine
 */

/**
 * Types of recommendations that can be generated
 */
export enum RecommendationType {
  SIMILAR = 'similar',
  TRENDING = 'trending',
  CATEGORY_BASED = 'category-based',
  COLLABORATIVE = 'collaborative',
}

/**
 * User interaction types for collaborative filtering
 */
export enum InteractionType {
  CLICK = 'click',
  LIKE = 'like',
  DISLIKE = 'dislike',
  SHARE = 'share',
  VIEW = 'view',
  DISMISS = 'dismiss',
}

/**
 * Similarity score metrics from vector comparison
 */
export interface SimilarityScore {
  cosine: number;
  jaccard?: number;
  combined: number;
}
