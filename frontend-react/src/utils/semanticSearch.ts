import { Product } from '../types';

/**
 * 16-Dimensional Semantic Topic Dimensions
 * Maps natural language intent, conversational queries, synonyms, and domain concepts into orthogonal vector dimensions.
 * Fully compatible with pgvector cosine similarity ranking.
 */
export const SEMANTIC_DIMENSION_LABELS: Record<number, string> = {
  0: 'Compute & Enterprise Workstations',
  1: 'AI Acceleration & Neural Models',
  2: 'Enterprise Memory & ECC RAM',
  3: 'High-IOPS NVMe, SSD & Storage',
  4: 'Spine/Leaf Switches & Networking',
  5: 'Ultra-HD Displays & OLED Monitors',
  6: 'Ergonomic Seating, Keyboards & Mice',
  7: 'Acoustic Sound & Studio Audio',
  8: 'Fast GaN Charging, Power & Cooling',
  9: 'Fresh Coffee, Tea & Morning Brew',
  10: 'Healthy Nutrition, Protein & Snacks',
  11: 'Campus Stationery, Notebooks & Writing',
  12: 'Oral Hygiene, Sonic Dental & Care',
  13: 'Eye Care & Anti-Glare Screen Optics',
  14: 'Esports, High-FPS & PC Gaming',
  15: 'Everyday Hydration, Cables & Desk Utility'
};

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'it', 'in', 'on', 'for', 'to', 'of', 'and', 'or', 'i', 'can',
  'things', 'thing', 'buy', 'bug', 'with', 'that', 'this', 'me', 'my', 'you', 'your',
  'do', 'does', 'want', 'need', 'looking', 'some', 'any', 'get', 'product', 'items', 'item',
  'what', 'which', 'how', 'give', 'show', 'find', 'recommend', 'suggest', 'best', 'good'
]);

const SEMANTIC_DIMENSIONS: Record<number, string[]> = {
  0: ['server', 'rack', 'epyc', 'xeon', 'cpu', 'processor', 'blade', 'node', 'core', 'compute', 'datacenter', 'virtualization', 'baremetal', 'supermicro', 'chassis', 'workstation', 'enterprise', 'iot', 'sensor', 'esp32', 'raspberry', 'microcontroller', 'embedded', 'gateway', 'arduino'],
  1: ['ai', 'tensor', 'gpu', 'rtx', 'cuda', 'deep', 'learning', 'neural', 'inference', 'accelerator', 'h100', 'a100', 'mi300x', 'movidius', 'training', 'vllm', 'intelligence', 'model', 'llm', 'chatgpt'],
  2: ['ram', 'ecc', 'ddr5', 'ddr4', 'memory', 'bandwidth', 'dimm', 'gb', 'registered', 'channel', 'buffering'],
  3: ['ssd', 'nvme', 'pcie', 'disk', 'storage', 'drive', 'tb', 'flash', 'raid', 'san', 'nas', 'hdd', 'ironwolf', 'sata', 'micron', 'samsung', 'solid', 'state', 'backup', 'files'],
  4: ['network', '100gbe', '400gbe', 'switch', 'spine', 'leaf', 'optical', 'qsfp', 'ethernet', 'router', 'fabric', 'sfp', 'transceiver', 'fiber', 'vlan', 'latency', 'wifi', 'internet', 'mesh'],
  5: ['display', 'monitor', 'screen', 'oled', '4k', 'hz', 'uhd', 'resolution', 'ips', 'panel', 'hdr', 'refresh', 'aspect', 'visual', 'view', 'watch', 'movies'],
  6: ['keyboard', 'mouse', 'ergonomic', 'mechanical', 'keychron', 'wireless', 'trackpad', 'cushion', 'chair', 'wrist', 'orthopedic', 'posture', 'sitting', 'back', 'pain', 'lumbar', 'comfort', 'spine'],
  7: ['audio', 'headphones', 'headset', 'sound', 'mic', 'microphone', 'noise', 'cancelling', 'studio', 'acoustic', 'speaker', 'audiophile', 'hifi', 'music', 'listen', 'listening', 'hear', 'song', 'songs', 'tunes', 'earphones', 'earbuds', 'anc', 'spatial', 'playback', 'podcast', 'recording', 'tracks'],
  8: ['power', 'psu', 'cooling', 'fan', 'liquid', 'freezer', 'cooler', 'heatsink', 'watt', 'gan', 'charger', 'battery', 'thermal', 'arctic', 'supply', 'fast', 'charge', 'charging', 'adapter', 'plug'],
  9: ['coffee', 'roast', 'bean', 'beans', 'brew', 'espresso', 'caffeine', 'matcha', 'tea', 'morning', 'beverage', 'arabica', 'colombian', 'drink', 'drinking', 'hot', 'cup', 'latte', 'energy', 'wake'],
  10: ['protein', 'bar', 'bars', 'almond', 'almonds', 'nutrition', 'snack', 'snacks', 'organic', 'wellness', 'healthy', 'vitamins', 'whey', 'energy', 'diet', 'himalayan', 'salted', 'food', 'eat', 'eating', 'hungry', 'pantry', 'groceries', 'grocery'],
  11: ['stationery', 'notebook', 'journal', 'pen', 'pens', 'gel', 'paper', 'student', 'office', 'campus', 'dot', 'grid', 'rollerball', 'writing', 'write', 'desk', 'organizer', 'book', 'notes', 'study', 'studying', 'college', 'class', 'homework', 'exam'],
  12: ['toothbrush', 'dental', 'hygiene', 'sonic', 'clean', 'oral', 'personal', 'care', 'travel', 'teeth', 'tooth', 'brush', 'brushing', 'plaque', 'mouth', 'floss'],
  13: ['glasses', 'blue', 'light', 'anti-glare', 'wellness', 'eyes', 'eye', 'glare', 'vision', 'uv', 'uv400', 'strain', 'spectacles'],
  14: ['gaming', 'game', 'gamer', 'games', 'play', 'playing', 'esports', 'fps', 'rtx', 'rgb', 'geforce', 'steam', 'arcade', 'joystick', 'controller', 'low-latency', 'multiplayer', 'competitive', 'rog', 'zephyrus', 'rig', 'setup'],
  15: ['portable', 'cable', 'cables', 'magnetic', 'bottle', 'insulated', 'silicone', 'compact', 'water', 'desktop', 'accessory', 'case', 'gear', 'weight', 'daily', 'essentials', 'everyday', 'wires', 'mess', 'organize', 'hydration', 'flask']
};

function tokenMatchesKeyword(token: string, kw: string): boolean {
  if (token === kw) return true;
  if (token.endsWith('ing') && kw.endsWith('e') && token.slice(0, -3) === kw.slice(0, -1)) return true;
  if (kw.endsWith('ing') && token.endsWith('e') && kw.slice(0, -3) === token.slice(0, -1)) return true;
  if (token === kw + 's' || token === kw + 'es' || token === kw + 'ing' || token === kw + 'ed' || token === kw + 'er') return true;
  if (kw === token + 's' || kw === token + 'es' || kw === token + 'ing' || kw === token + 'ed') return true;
  if (kw.length >= 5 && (token.startsWith(kw) || kw.startsWith(token))) return true;
  return false;
}

/**
 * Deterministic Semantic Feature Hash
 * Generates an L2-normalized 16-dimensional vector embedding for text.
 * Combines conceptual semantic topic projections with cryptographic token hashes.
 */
export function generateEmbedding(text: string, dim: number = 16): number[] {
  if (!text || !text.trim()) {
    return new Array(dim).fill(0.0);
  }

  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  let tokens = clean.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return new Array(dim).fill(0.0);

  // Stopwords filtering for clean intent projection
  const filtered = tokens.filter(t => !STOP_WORDS.has(t));
  if (filtered.length > 0) tokens = filtered;

  const vector = new Array(dim).fill(0.0);

  // 1. Semantic Topic Projection
  for (const token of tokens) {
    for (let d = 0; d < dim; d++) {
      const keywords = SEMANTIC_DIMENSIONS[d] || [];
      for (const kw of keywords) {
        if (tokenMatchesKeyword(token, kw)) {
          vector[d] += 3.0; // Strong semantic topic match
          break;
        }
      }
    }
  }

  // 2. Cryptographic Token Hash projection (FNV-1a for unique signature, scaled down)
  for (const token of tokens) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < token.length; i++) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    hash = hash >>> 0;

    for (let i = 0; i < dim; i++) {
      const nibble = (hash >>> (i * 2)) & 0x0f;
      vector[i] += ((nibble / 15.0) - 0.5) * 0.10;
    }
  }

  // 3. L2 normalization: v / ||v||
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
  minSimilarity: number = 0.35
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

    if (hybridScore >= minSimilarity || cosSim >= 0.50 || tokenOverlap > 0) {
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
  { label: 'PC Gaming Gear', query: 'things for high fps competitive pc gaming and esports' },
  { label: 'Study & Exam Prep', query: 'college student writing notebooks and gel ink pens' },
  { label: 'Healthy Study Snack', query: 'healthy organic snack to eat while studying late' },
  { label: 'Back Pain Relief', query: 'cushion for sitting posture and lower back pain relief' },
  { label: 'Morning Caffeine', query: 'artisan dark roast coffee and caffeine for morning energy' },
  { label: 'Desk Cable Cleaner', query: 'things to organize tangled desk wires and charging cables' },
  { label: 'Eye Strain Defense', query: 'glasses to protect eyes from computer screen glare' },
  { label: 'Deep Learning AI', query: 'high performance tensor core neural accelerator for AI' },
  { label: 'Music & Headsets', query: 'things i can buy to listen to music and audio' }
];
