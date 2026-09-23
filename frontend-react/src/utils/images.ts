const CATEGORY_IMAGES: Record<string, string[]> = {
  cat_comp_01: [
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80"
  ],
  cat_elec_02: [
    "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80"
  ],
  cat_audio_03: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80"
  ],
  cat_net_04: [
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551808525-51a94da548ce?w=600&auto=format&fit=crop&q=80"
  ],
  cat_storage_05: [
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541728472741-03e45a58cf88?w=600&auto=format&fit=crop&q=80"
  ],
  cat_display_06: [
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&auto=format&fit=crop&q=80"
  ],
  cat_periph_07: [
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80"
  ],
  cat_power_08: [
    "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618764400608-9e7115eabb74?w=600&auto=format&fit=crop&q=80"
  ]
};

export function getProductImage(product: { image_url?: string; category_id?: string; product_id?: string; name?: string }): string {
  if (product.image_url && product.image_url.startsWith('http')) {
    return product.image_url;
  }
  const catList = product.category_id ? CATEGORY_IMAGES[product.category_id] : null;
  if (catList && catList.length > 0) {
    let hash = 0;
    const str = product.product_id || product.name || '';
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % catList.length;
    return catList[index];
  }
  return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80';
}
