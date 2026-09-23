import React, { useState, useEffect } from 'react';
import { Product, Warehouse, Review, User } from '../types';
import { getProductImage } from '../utils/images';

interface ProductDetailModalProps {
  product: Product | null;
  warehouses: Warehouse[];
  user: User | null;
  inWishlist: boolean;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product, warehouseId: string, quantity: number) => void;
  onBuyNow: (p: Product, warehouseId: string, quantity: number) => void;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  warehouses,
  user,
  inWishlist,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onClose,
  onSelectProduct
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedWarehouse, setSelectedWarehouse] = useState('wh_hyd_01');
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (!product) return;
    setQuantity(1);
    // Fetch AI vector recommendations
    fetch(`/api/products/${product.product_id}/recommendations`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setRecommendations(data))
      .catch(() => setRecommendations([]));

    // Fetch Reviews
    fetch(`/api/reviews/${product.product_id}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setReviews(data))
      .catch(() => setReviews([]));
  }, [product]);

  if (!product) return null;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to write a review.');
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token || user.access_token || ''}`
        },
        body: JSON.stringify({
          product_id: product.product_id,
          rating: newRating,
          comment: newComment
        })
      });
      if (res.ok) {
        const rev = await res.json();
        setReviews([rev, ...reviews]);
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-[#d5d9d9] dark:border-slate-800 rounded-lg max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative text-[#0f1111] dark:text-slate-100 p-4 sm:p-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white text-xl p-1"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Col 1: Product Image */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full h-80 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center p-4">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
            {/* Wishlist toggle button */}
            <button
              onClick={() => onToggleWishlist(product)}
              className="mt-3 flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:text-rose-500 py-1.5 px-3 rounded-full border border-gray-300 dark:border-slate-700"
            >
              <i className={`fa-heart ${inWishlist ? 'fa-solid text-rose-500' : 'fa-regular'}`}></i>
              {inWishlist ? 'Saved to Your Wishlist' : 'Add to Your Wishlist'}
            </button>
          </div>

          {/* Col 2: Product Overview & Attributes */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <span className="text-xs uppercase font-mono font-bold text-[#565959] dark:text-slate-400">
                {product.category_name || 'Hardware Component'}
              </span>
              <h2 className="text-base sm:text-lg font-bold leading-snug mt-1">
                {product.name}
              </h2>
              <div className="text-[11px] font-mono text-gray-500 mt-1">
                ASIN: <span className="font-bold text-gray-700 dark:text-gray-300">{product.sku}</span> • Polyglot Backend
              </div>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex text-amber-500">
                {[1,2,3,4,5].map(i => (
                  <i key={i} className="fa-solid fa-star"></i>
                ))}
              </div>
              <span className="text-[#007185] dark:text-sky-400 font-semibold">{reviews.length ? `${reviews.length} ratings` : 'Verified Product'}</span>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
              <div className="text-xs text-gray-500">Price:</div>
              <div className="text-2xl font-bold text-[#b12704] dark:text-rose-400">
                ${product.price.toFixed(2)}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">About this item</span>
              <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Technical Attributes */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Specifications</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(product.attributes).map(([k, v]) => (
                    <div key={k} className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-gray-500 block uppercase font-mono">{k.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-gray-800 dark:text-slate-200">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Col 3: Buy Box */}
          <div className="lg:col-span-3 bg-[#fafafa] dark:bg-slate-800/60 border border-[#d5d9d9] dark:border-slate-700 rounded-lg p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-xl font-bold text-[#b12704] dark:text-rose-400">
                ${(product.price * quantity).toFixed(2)}
              </div>

              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                <i className="fa-solid fa-circle-check"></i> In Stock & Ready to Dispatch
              </div>

              {/* Warehouse Selection */}
              <div>
                <label className="text-xs text-gray-600 dark:text-slate-400 block mb-1 font-semibold">
                  Fulfillment Warehouse:
                </label>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded outline-none"
                >
                  {warehouses.length > 0 ? (
                    warehouses.map(w => (
                      <option key={w.warehouse_id} value={w.warehouse_id}>
                        {w.name} ({w.city})
                      </option>
                    ))
                  ) : (
                    <option value="wh_hyd_01">Hyderabad Central Hub (wh_hyd_01)</option>
                  )}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs text-gray-600 dark:text-slate-400 block mb-1 font-semibold">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full text-xs p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded outline-none"
                >
                  {[1,2,3,4,5,10].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, selectedWarehouse, quantity);
                  onClose();
                }}
                className="a-button a-button-primary w-full py-2 text-xs"
              >
                <i className="fa-solid fa-cart-plus"></i> Add to Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  onBuyNow(product, selectedWarehouse, quantity);
                  onClose();
                }}
                className="a-button a-button-secondary w-full py-2 text-xs font-semibold"
              >
                <i className="fa-solid fa-bolt"></i> Buy Now
              </button>
            </div>
          </div>

        </div>

        {/* Vector Similarity Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-[#0f1111] dark:text-slate-100 flex items-center gap-1.5 mb-3">
              <i className="fa-solid fa-brain text-purple-500"></i> AI Vector Similarity Matches
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recommendations.slice(0, 4).map(rec => (
                <div
                  key={rec.product_id}
                  onClick={() => onSelectProduct(rec)}
                  className="bg-white dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700 hover:border-[#e47911] transition cursor-pointer flex flex-col justify-between"
                >
                  <img
                    src={getProductImage(rec)}
                    alt={rec.name}
                    className="h-24 w-full object-contain mb-2"
                  />
                  <div>
                    <span className="text-xs font-semibold line-clamp-2">{rec.name}</span>
                    <span className="text-xs font-bold text-[#b12704] dark:text-rose-400 mt-1 block">
                      ${rec.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customer Reviews Section */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0f1111] dark:text-slate-100">
              Customer Reviews ({reviews.length})
            </h3>
          </div>

          {/* Review List */}
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2">
            {reviews.length > 0 ? (
              reviews.map(r => (
                <div key={r.review_id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800 dark:text-slate-200">{r.user_name || 'Verified Customer'}</span>
                    <div className="flex text-amber-500 text-[10px]">
                      {[1,2,3,4,5].map(st => (
                        <i key={st} className={`fa-solid fa-star ${st <= r.rating ? '' : 'text-gray-300 dark:text-gray-600'}`}></i>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-slate-300">{r.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-500 py-3">No reviews yet. Be the first to review this hardware unit!</div>
            )}
          </div>

          {/* Write a review */}
          <form onSubmit={handleSubmitReview} className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-bold block">Write a Customer Review</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-slate-400">Rating:</span>
              <div className="flex gap-1 text-amber-500 text-sm cursor-pointer">
                {[1,2,3,4,5].map(st => (
                  <i 
                    key={st} 
                    onClick={() => setNewRating(st)}
                    className={`fa-solid fa-star ${st <= newRating ? '' : 'text-gray-300 dark:text-gray-600'}`}
                  ></i>
                ))}
              </div>
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share performance benchmarks, noise levels, or system compatibility..."
              className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
              rows={2}
              required
            />
            <button
              type="submit"
              disabled={isSubmittingReview}
              className="a-button a-button-primary px-4 py-1.5 text-xs font-bold"
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
