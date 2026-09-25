import { Product } from '../types';

/**
 * 16-Dimensional Semantic Topic Dimensions
 * Maps natural language intent, synonyms, and domain concepts into orthogonal vector dimensions.
 * Compatible with pgvector cosine similarity ranking.
 */
export const SEMANTIC_DIMENSION_LABELS: Record<number, string> = {
  0: 'Compute & Server Nodes',
  1: 'AI & Tensor Accelerators',
  2: 'Enterprise Memory & ECC RAM',
  3: 'High-IOPS NVMe & Storage Fabrics',
  4: 'Spine/Leaf Switches & Optics',
  5: 'Ultra-HD Displays & OLED Monitors',
  6: 'Peripherals, Keyboards & Ergonomics',
  7: 'Acoustic Sound & Studio Audio',
  8: 'Thermal Cooling, GaN & Power',
  9: 'Coffee, Espresso & Morning Energy',
  10: 'Nutrition, Protein & Healthy Snacks',
  11: 'Stationery, Journals & Campus Study',
  12: 'Hygiene, Sonic Care & Wellness',
  13: 'Edge IoT, Microcontrollers & Sensors',
  14: 'Flagship & Enterprise Reliability',
  15: 'Compact, Portability & Everyday Gear'
};

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'it', 'in', 'on', 'for', 'to', 'of', 'and', 'or', 'i', 'can',
  'things', 'thing', 'buy', 'bug', 'with', 'that', 'this', 'me', 'my', 'you', 'your',
  'do', 'does', 'want', 'need', 'looking', 'some', 'any', 'get', 'product', 'items', 'item'
]);

const SEMANTIC_DIMENSIONS: Record<number, string[]> = {
  0: ['server', 'rack', 'epyc', 'xeon', 'cpu', 'processor', 'blade', 'node', 'core', 'compute', 'datacenter', 'virtualization', 'baremetal', 'supermicro', 'chassis'],
  1: ['ai', 'tensor', 'gpu', 'rtx', 'cuda', 'deep', 'learning', 'neural', 'inference', 'accelerator', 'h100', 'a100', 'mi300x', 'movidius', 'training', 'vllm', 'intelligence', 'model'],
  2: ['ram', 'ecc', 'ddr5', 'ddr4', 'memory', 'bandwidth', 'dimm', 'gb', 'registered', 'channel', 'buffering'],
  3: ['ssd', 'nvme', 'pcie', 'disk', 'storage', 'drive', 'tb', 'flash', 'raid', 'san', 'nas', 'hdd', 'ironwolf', 'sata', 'micron', 'samsung', 'solid', 'state'],
  4: ['network', '100gbe', '400gbe', 'switch', 'spine', 'leaf', 'optical', 'qsfp', 'ethernet', 'router', 'fabric', 'sfp', 'transceiver', 'fiber', 'vlan', 'latency'],
  5: ['display', 'monitor', 'screen', 'oled', '4k', 'hz', 'uhd', 'resolution', 'ips', 'panel', 'gaming', 'hdr', 'refresh', 'aspect'],
  6: ['keyboard', 'mouse', 'ergonomic', 'mechanical', 'keychron', 'wireless', 'trackpad', 'cushion', 'chair', 'wrist', 'orthopedic', 'posture'],
  7: ['audio', 'headphones', 'headset', 'sound', 'mic', 'microphone', 'noise', 'cancelling', 'studio', 'acoustic', 'speaker', 'audiophile', 'hifi', 'music', 'listen', 'listening', 'hear', 'song', 'songs', 'tunes', 'earphones', 'earbuds', 'anc', 'spatial', 'playback', 'podcast', 'recording'],
  8: ['power', 'psu', 'cooling', 'fan', 'liquid', 'freezer', 'cooler', 'heatsink', 'watt', 'gan', 'charger', 'battery', 'thermal', 'arctic', 'supply', 'fast', 'charge'],
  9: ['coffee', 'roast', 'bean', 'brew', 'espresso', 'caffeine', 'matcha', 'tea', 'morning', 'beverage', 'arabica', 'colombian', 'drink', 'hot', 'cup'],
  10: ['protein', 'bar', 'almond', 'nutrition', 'snack', 'organic', 'wellness', 'healthy', 'vitamins', 'whey', 'energy', 'diet', 'himalayan', 'salted', 'food'],
  11: ['stationery', 'notebook', 'journal', 'pen', 'gel', 'paper', 'student', 'office', 'campus', 'dot', 'grid', 'rollerball', 'writing', 'desk', 'organizer', 'book', 'notes', 'study'],
  12: ['toothbrush', 'dental', 'hygiene', 'sonic', 'clean', 'oral', 'personal', 'care', 'travel', 'glasses', 'blue', 'light', 'anti-glare', 'wellness', 'teeth'],
  13: ['iot', 'sensor', 'esp32', 'raspberry', 'microcontroller', 'embedded', 'gateway', 'arduino', 'gpio', 'telemetry', 'edge'],
  14: ['enterprise', 'pro', 'ultra', 'premium', 'titanium', 'gold', 'flagship', 'industrial', 'military', 'grade', 'resilient', 'high-throughput', 'durable'],
  15: ['portable', 'cable', 'magnetic', 'bottle', 'insulated', 'silicone', 'compact', 'water', 'desktop', 'accessory', 'case', 'gear', 'weight']
};

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
        if (token === kw || token.startsWith(kw) || kw.startsWith(token)) {
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
  { label: 'Deep Learning GPU', query: 'high performance tensor core neural accelerator for AI' },
  { label: 'Music & Audio Gear', query: 'Things i can buy to listen to music and audio' },
  { label: 'Morning Caffeine Boost', query: 'colombian artisan dark roast coffee and morning caffeine' },
  { label: 'Study & Campus Stationery', query: 'student writing notebook journal and gel ink rollerball pens' },
  { label: 'Fast Solid State Drive', query: 'ultra low latency PCIe NVMe M.2 flash storage drive' },
  { label: 'Healthy Nutrition & Snack', query: 'whey protein energy bars and salted almonds nutrition' },
  { label: 'Fast GaN Charger', query: '65w fast usb-c gan wall charger multi port adapter' }
];
