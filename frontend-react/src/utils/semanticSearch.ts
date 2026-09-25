import { Product } from '../types';

/**
 * Deterministic Semantic Feature Hash
 * Generates an L2-normalized 16-dimensional vector embedding for text.
 * Mirrors pgvector embedding pipelines and backend intelligence_service.py.
 */
export function generateEmbedding(text: string, dim: number = 16): number[] {
  if (!text || !text.trim()) {
    return new Array(dim).fill(0.0);
  }

  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const tokens = clean.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return new Array(dim).fill(0.0);

  const vector = new Array(dim).fill(0.0);

  for (const token of tokens) {
    // 32-bit FNV-1a hash
    let hash = 0x811c9dc5;
    for (let i = 0; i < token.length; i++) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    hash = hash >>> 0;

    for (let i = 0; i < dim; i++) {
      const nibble = (hash >>> (i * 2)) & 0x0f;
      vector[i] += (nibble / 15.0) - 0.5;
    }
  }

  // L2 normalization: v / ||v||
  const sumSquares = vector.reduce((sum, val) => sum + (val * val), 0);
  const norm = Math.sqrt(sumSquares) || 1.0;
  return vector.map(v => Math.round((v / norm) * 1000) / 1000);
}

/**
 * Computes Cosine Similarity between two normalized embedding vectors.
 * Range: [-1.0, 1.0], typical for semantic text: [0.0, 1.0]
 */
export function cosineSimilarity(v1: number[], v2: number[]): number {
  if (!v1 || !v2 || v1.length !== v2.length || v1.length === 0) return 0.0;
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    norm1 += v1[i] * v1[i];
    norm2 += v2[i] * v2[i];
  }

  const denom = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denom === 0) return 0.0;
  
  const score = dotProduct / denom;
  // normalize to [0, 1] range for intuitive UI display
  return Math.max(0, Math.min(1, (score + 1) / 2));
}

export interface SemanticSearchResult {
  product: Product;
  similarityScore: number;
  cosineSim: number;
  vector: number[];
  queryVector: number[];
}

/**
 * Performs Semantic Vector Search across products.
 * Combines 70% dense vector cosine similarity with 30% lexical token matching (Hybrid Search).
 */
export function performSemanticSearch(
  products: Product[],
  query: string,
  minSimilarity: number = 0.45
): SemanticSearchResult[] {
  if (!query || !query.trim()) return [];

  const cleanQuery = query.trim();
  const queryVec = generateEmbedding(cleanQuery, 16);
  const queryTokens = new Set(cleanQuery.toLowerCase().split(/\s+/).filter(Boolean));

  const scored: SemanticSearchResult[] = [];

  for (const product of products) {
    const textCorpus = `${product.name} ${product.category_name || ''} ${product.description || ''} ${product.sku} ${(product.tags || []).join(' ')}`;
    const productVec = (product as any).embedding && Array.isArray((product as any).embedding)
      ? (product as any).embedding
      : generateEmbedding(textCorpus, 16);

    const cosSim = cosineSimilarity(queryVec, productVec);

    // Token overlap bonus
    const prodTokens = new Set(textCorpus.toLowerCase().split(/\s+/).filter(Boolean));
    let commonTokens = 0;
    queryTokens.forEach(t => {
      if (prodTokens.has(t)) commonTokens++;
    });
    const tokenOverlap = queryTokens.size > 0 ? commonTokens / queryTokens.size : 0;

    // Hybrid Score: 70% Dense Cosine Similarity + 30% Lexical Overlap
    const hybridScore = (cosSim * 0.70) + (tokenOverlap * 0.30);

    if (hybridScore >= minSimilarity || cosSim >= 0.55 || tokenOverlap > 0) {
      scored.push({
        product: {
          ...product,
          similarity_score: Math.round(hybridScore * 100) / 100
        },
        similarityScore: hybridScore,
        cosineSim: cosSim,
        vector: productVec,
        queryVector: queryVec
      });
    }
  }

  // Sort descending by highest semantic match
  return scored.sort((a, b) => b.similarityScore - a.similarityScore);
}

export const SAMPLE_SEMANTIC_PROMPTS = [
  { label: 'Deep Learning GPU', query: 'high performance tensor core neural accelerator for AI' },
  { label: 'Rack Server Node', query: 'enterprise compute blade dual socket datacenter server' },
  { label: 'Fast Solid State', query: 'ultra low latency PCIe NVMe M.2 flash storage drive' },
  { label: 'Studio Headset', query: 'noise cancelling immersive studio monitor audiophile sound' },
  { label: 'Edge IoT Controller', query: 'embedded single board sensor gateway low power microcontroller' }
];
