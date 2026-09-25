import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { generateEmbedding, performSemanticSearch, SAMPLE_SEMANTIC_PROMPTS } from '../utils/semanticSearch';
import { getProductImage } from '../utils/images';

interface SemanticSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (p: Product) => void;
  onApplyQueryToStorefront?: (query: string) => void;
}

export const SemanticSearchModal: React.FC<SemanticSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onApplyQueryToStorefront
}) => {
  const [query, setQuery] = useState('high performance machine learning GPU accelerator for AI training');
  const [activeTab, setActiveTab] = useState<'search' | 'math_explain' | 'pgvector_sql'>('search');

  const queryVector = useMemo(() => {
    return generateEmbedding(query, 16);
  }, [query]);

  const searchResults = useMemo(() => {
    return performSemanticSearch(products, query, 0.40);
  }, [products, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-cyan-950/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 text-lg">
              <i className="fa-solid fa-brain"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[var(--text-main)] flex items-center gap-2">
                  <span>AI Semantic Search & Vector Embeddings</span>
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30">
                  pgvector 16-Dim
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Course 25CS1302E: Dense Semantic Embeddings & Cosine Distance Ranking
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-[var(--border-subtle)] px-6 bg-[var(--bg-card-subtle)] gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('search')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'search'
                ? 'border-purple-500 text-purple-500 font-extrabold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <i className="fa-solid fa-magnifying-glass"></i>
            <span>Interactive Vector Search</span>
          </button>
          <button
            onClick={() => setActiveTab('math_explain')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'math_explain'
                ? 'border-purple-500 text-purple-500 font-extrabold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <i className="fa-solid fa-calculator"></i>
            <span>Cosine Similarity Math & Vectors</span>
          </button>
          <button
            onClick={() => setActiveTab('pgvector_sql')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'pgvector_sql'
                ? 'border-purple-500 text-purple-500 font-extrabold'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <i className="fa-solid fa-database"></i>
            <span>pgvector vs SQL LIKE Benchmark</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Natural Language Query Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
                  <span>Enter Natural Language Intent / Concept</span>
                  <span className="text-purple-400 font-mono text-[11px]">Real-time Vector Projection</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. fast graphics processor for neural network inferencing..."
                    className="w-full bg-[var(--bg-card-subtle)] border-2 border-purple-500/40 focus:border-purple-500 rounded-xl px-4 py-3 pl-11 text-sm text-[var(--text-main)] outline-none shadow-inner font-medium transition"
                  />
                  <i className="fa-solid fa-wand-magic-sparkles text-purple-500 absolute left-4 top-4 text-base"></i>
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-3.5 top-3.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      <i className="fa-solid fa-circle-xmark"></i>
                    </button>
                  )}
                </div>

                {/* Sample Prompt Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] mr-1">Try concepts:</span>
                  {SAMPLE_SEMANTIC_PROMPTS.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(sample.query)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] hover:border-purple-500 text-[var(--text-muted)] hover:text-purple-400 transition cursor-pointer"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated Query Embedding Vector Ribbon */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-purple-900/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <i className="fa-solid fa-chart-simple"></i>
                    <span>Generated 16-Dimensional Query Embedding Vector</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">L2 Norm: 1.000 (Unit Sphere)</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 font-mono text-[11px]">
                  {queryVector.map((val, idx) => (
                    <div 
                      key={idx}
                      className="p-1.5 rounded bg-slate-950/80 border border-slate-800 text-center"
                      title={`Dimension d_${idx + 1}`}
                    >
                      <span className="text-[9px] text-slate-500 block">d{idx + 1}</span>
                      <span className={val >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                        {val >= 0 ? `+${val.toFixed(3)}` : val.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Results */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Ranked Matches by Cosine Similarity ({searchResults.length} Products Found)
                  </h4>
                  {onApplyQueryToStorefront && (
                    <button
                      onClick={() => {
                        onApplyQueryToStorefront(query);
                        onClose();
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <span>Apply to Main Storefront</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  )}
                </div>

                {searchResults.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-muted)]">
                    <i className="fa-solid fa-brain text-2xl mb-2 opacity-50 block"></i>
                    No semantic matches found above the 0.40 similarity threshold. Try another phrase or concept.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {searchResults.map(({ product, similarityScore, cosineSim }, idx) => (
                      <div
                        key={product.product_id}
                        onClick={() => {
                          onSelectProduct(product);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-purple-500/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group hover:shadow-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-mono text-xs font-extrabold flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-contain bg-[var(--bg-card-subtle)] p-1 shrink-0"
                          />
                          <div>
                            <h5 className="font-bold text-xs sm:text-sm text-[var(--text-main)] group-hover:text-purple-400 transition">
                              {product.name}
                            </h5>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              {product.category_name} • SKU: {product.sku} • Stock: {product.total_stock ?? 50} units
                            </span>
                          </div>
                        </div>

                        {/* Similarity Score Pill & Vector Preview */}
                        <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-bold text-purple-400 block font-mono">
                              {Math.round(similarityScore * 100)}% Match
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">
                              cos(θ) = {cosineSim.toFixed(3)}
                            </span>
                          </div>
                          <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" 
                              style={{ width: `${Math.min(100, Math.round(similarityScore * 100))}%` }}
                            ></div>
                          </div>
                          <i className="fa-solid fa-chevron-right text-xs text-[var(--text-muted)] group-hover:translate-x-1 transition-transform"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'math_explain' && (
            <div className="space-y-6 text-xs text-[var(--text-main)] leading-relaxed">
              <div className="bg-purple-950/30 border border-purple-800/40 rounded-xl p-5 space-y-3">
                <h4 className="font-extrabold text-sm text-purple-300 flex items-center gap-2">
                  <i className="fa-solid fa-square-root-variable"></i>
                  <span>The Mathematics of Cosine Vector Similarity</span>
                </h4>
                <p className="text-[var(--text-muted)]">
                  Traditional relational SQL queries rely on lexical keyword matching (e.g. <code className="text-pink-400 font-mono">LIKE '%gpu%'</code>), which fails when users search with synonyms or descriptive concepts. Dense vector search embeds text into an n-dimensional space where conceptual closeness corresponds to the geometric angle θ between vectors.
                </p>
                <div className="p-4 bg-slate-950 rounded-lg font-mono text-center text-sm text-cyan-300 border border-slate-800">
                  Cosine Similarity(A, B) = cos(θ) = (A · B) / (||A||₂ × ||B||₂) = Σ(Aᵢ × Bᵢ) / [ √(Σ Aᵢ²) × √(Σ Bᵢ²) ]
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] space-y-2">
                  <h5 className="font-bold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                    <i className="fa-solid fa-cube text-emerald-400"></i>
                    <span>1. Dense Semantic Embeddings</span>
                  </h5>
                  <p className="text-[var(--text-muted)]">
                    Each catalog item is projected into a 16-dimensional continuous vector space. Tokens are hashed through non-linear semantic projections and L2 normalized onto a unit hypersphere (||v||₂ = 1.0).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] space-y-2">
                  <h5 className="font-bold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                    <i className="fa-solid fa-scale-balanced text-cyan-400"></i>
                    <span>2. Hybrid Search (Dense + Lexical)</span>
                  </h5>
                  <p className="text-[var(--text-muted)]">
                    NexCommerce executes a hybrid scoring function: <strong>70% dense cosine similarity</strong> + <strong>30% token overlap</strong>. This prevents semantic drift while ensuring exact SKUs and model numbers match instantly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pgvector_sql' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  PostgreSQL pgvector Query Equivalent (Production SQL)
                </span>
                <pre className="text-slate-300 text-xs overflow-x-auto whitespace-pre p-2 bg-slate-900 rounded">
{`-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add 16-dimensional embedding column
ALTER TABLE products ADD COLUMN IF NOT EXISTS embedding vector(16);

-- 3. Perform Cosine Distance Vector Search (<=> operator)
SELECT 
    product_id, 
    name, 
    price, 
    1 - (embedding <=> '[0.342, -0.118, 0.765, 0.231, ...]') AS cosine_similarity
FROM products
WHERE is_active = true
ORDER BY embedding <=> '[0.342, -0.118, 0.765, 0.231, ...]'
LIMIT 5;`}
                </pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/40 space-y-1">
                  <span className="font-bold text-rose-400 block font-sans">Traditional Lexical (SQL LIKE)</span>
                  <p className="text-[var(--text-muted)] font-sans">
                    Searching "fast GPU for AI" returns <strong>0 rows</strong> if the product is titled "NVIDIA Tensor Core 4090" without exact words "GPU" or "AI".
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-1">
                  <span className="font-bold text-emerald-400 block font-sans">pgvector Semantic Search</span>
                  <p className="text-[var(--text-muted)] font-sans">
                    Embeddings capture semantic proximity: "GPU", "Tensor Core", "Graphics Accelerator", and "Neural Processor" map to the same neighborhood.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>KL University • Course 25CS1302E DBS-DBD</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--border-subtle)] hover:bg-black/10 dark:hover:bg-white/10 font-bold transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
