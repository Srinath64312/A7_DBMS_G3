import React from 'react';
import { Product } from '../types';
import { getProductImage } from '../utils/images';

interface ProductCardProps {
  product: Product;
  inWishlist: boolean;
  onToggleWishlist: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  onViewDetails: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  inWishlist,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onViewDetails,
}) => {
  const isOutOfStock = (product.total_stock ?? 1) === 0;

  return (
    <div 
      onClick={() => onViewDetails(product)}
      className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex flex-col justify-between hover:shadow-xl hover:border-[var(--color-brand)] transition-all duration-200 cursor-pointer relative group"
    >
      {/* Top Image Container with Wishlist Heart */}
      <div className="relative w-full h-48 bg-[var(--bg-card-subtle)] rounded-lg p-2.5 mb-3 flex items-center justify-center overflow-hidden border border-[var(--border-subtle)]/40 transition-colors">
        <img 
          src={getProductImage(product)} 
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm rounded"
          loading="lazy"
        />

        {/* Wishlist Heart Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[var(--bg-card)]/90 hover:bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm flex items-center justify-center transition-transform active:scale-90 z-10"
          title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <i className={`fa-heart ${inWishlist ? 'fa-solid text-rose-500 scale-110' : 'fa-regular text-gray-400 hover:text-rose-500'} text-sm transition-all`}></i>
        </button>

        {/* Prime Badge */}
        <div className="absolute bottom-1.5 left-1.5 bg-[#002f36] text-[#00a8e1] px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider flex items-center gap-0.5 shadow-sm">
          <span>prime</span>
          <i className="fa-solid fa-check text-[9px] text-[#ff9900]"></i>
        </div>
      </div>

      {/* Product Information */}
      <div className="space-y-1.5 flex-1 flex flex-col">
        {/* Category tag */}
        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
          {product.category_name || 'Hardware'}
        </span>

        {/* Name */}
        <h4 className="text-xs sm:text-sm font-semibold text-[var(--text-main)] line-clamp-2 leading-snug group-hover:text-[var(--color-link)] transition-colors">
          {product.name}
        </h4>

        {/* Reviews & Star Rating */}
        <div className="flex items-center gap-1 text-xs">
          <div className="flex text-amber-500 text-[11px]">
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star"></i>
            <i className="fa-solid fa-star-half-stroke"></i>
          </div>
          <span className="text-[var(--color-link)] text-[11px] font-medium ml-1">4.7</span>
          <span className="text-[var(--text-muted)] text-[10px]">(128)</span>
        </div>

        {/* Price */}
        <div className="pt-1 flex items-baseline gap-1">
          <span className="text-xs font-semibold text-[var(--text-main)]">$</span>
          <span className="text-xl font-bold text-[var(--text-main)] tracking-tight">
            {Math.floor(product.price)}
          </span>
          <span className="text-xs font-bold text-[var(--text-main)] -ml-0.5">
            {Math.round((product.price % 1) * 100).toString().padStart(2, '0')}
          </span>
          <span className="text-[11px] text-[var(--text-muted)] line-through ml-1.5">
            ${(product.price * 1.15).toFixed(2)}
          </span>
        </div>

        {/* Stock & Delivery Guarantee */}
        <div className="text-[11px] font-medium">
          {isOutOfStock ? (
            <span className="text-rose-500 font-bold">Currently unavailable</span>
          ) : (
            <span className="text-emerald-500 font-semibold">
              <i className="fa-solid fa-truck-fast mr-1"></i>FREE Delivery Tomorrow
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)]/60 flex flex-col gap-2">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className={`a-button a-button-primary w-full py-1.5 text-xs font-bold ${
            isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <i className="fa-solid fa-cart-plus"></i> Add to Cart
        </button>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            onBuyNow(product);
          }}
          className={`a-button a-button-secondary w-full py-1.5 text-xs font-bold ${
            isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <i className="fa-solid fa-bolt"></i> Buy Now
        </button>
      </div>

    </div>
  );
};
