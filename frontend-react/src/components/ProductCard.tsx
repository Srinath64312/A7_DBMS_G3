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
      className="bg-white dark:bg-slate-900 border border-[#d5d9d9] dark:border-slate-800 rounded-md p-3.5 flex flex-col justify-between hover:shadow-lg transition-all duration-200 cursor-pointer relative group"
    >
      {/* Top Image Container with Wishlist Heart */}
      <div className="relative w-full h-48 bg-white dark:bg-slate-800 rounded p-2 mb-3 flex items-center justify-center overflow-hidden">
        <img 
          src={getProductImage(product)} 
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Wishlist Heart Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center transition-transform active:scale-90"
          title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <i className={`fa-heart ${inWishlist ? 'fa-solid text-rose-500 scale-110' : 'fa-regular text-gray-400 hover:text-rose-500'} text-sm transition-all`}></i>
        </button>

        {/* Prime Badge */}
        <div className="absolute bottom-1.5 left-1.5 bg-[#002f36] text-[#00a8e1] px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider flex items-center gap-0.5">
          <span>prime</span>
          <i className="fa-solid fa-check text-[9px] text-[#ff9900]"></i>
        </div>
      </div>

      {/* Product Information */}
      <div className="space-y-1.5 flex-1 flex flex-col">
        {/* Category tag */}
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#565959] dark:text-slate-400">
          {product.category_name || 'Hardware'}
        </span>

        {/* Name */}
        <h4 className="text-xs sm:text-sm font-semibold text-[#0f1111] dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-[#007185] dark:group-hover:text-sky-400">
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
          <span className="text-[#007185] dark:text-sky-400 text-[11px] font-medium ml-1">4.7</span>
          <span className="text-[#565959] dark:text-slate-400 text-[10px]">(128)</span>
        </div>

        {/* Price */}
        <div className="pt-1 flex items-baseline gap-1">
          <span className="text-xs font-semibold text-[#0f1111] dark:text-slate-200">$</span>
          <span className="text-xl font-bold text-[#0f1111] dark:text-white tracking-tight">
            {Math.floor(product.price)}
          </span>
          <span className="text-xs font-bold text-[#0f1111] dark:text-white -ml-0.5">
            {Math.round((product.price % 1) * 100).toString().padStart(2, '0')}
          </span>
          <span className="text-[11px] text-[#565959] dark:text-slate-400 line-through ml-1.5">
            ${(product.price * 1.15).toFixed(2)}
          </span>
        </div>

        {/* Stock & Delivery Guarantee */}
        <div className="text-[11px] font-medium">
          {isOutOfStock ? (
            <span className="text-rose-600 dark:text-rose-400 font-bold">Currently unavailable</span>
          ) : (
            <span className="text-emerald-700 dark:text-emerald-400">
              <i className="fa-solid fa-truck-fast mr-1"></i>FREE Delivery Tomorrow
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className={`a-button a-button-primary w-full py-1.5 text-xs ${
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
          className={`a-button a-button-secondary w-full py-1.5 text-xs font-semibold ${
            isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <i className="fa-solid fa-bolt"></i> Buy Now
        </button>
      </div>

    </div>
  );
};
