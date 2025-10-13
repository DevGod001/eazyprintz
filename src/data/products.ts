export interface Product {
  id: string;
  name: string;
  description: string;
  category: 'tshirts' | 'hoodies' | 'sweatshirts' | 'polos' | 'kids' | 'baby' | 'accessories';
  basePrice: number;
  images: string[]; // Fallback images if color doesn't have specific images
  colors: Array<{
    name: string;
    hex: string;
    available: boolean;
    images?: {
      front: string;
      back: string;
    };
  }>;
  sizes: string[];
  brand: string;
  rating: number;
  reviews: number;
  featured?: boolean;
  topSeller?: boolean;
  onSale?: boolean;
  salePrice?: number;
  availableSizes: string[];
  fabric: string;
  weight?: string;
}

export const products: Product[] = [
  // T-Shirts
  {
    id: 'ts-001',
    name: 'Premium Cotton T-Shirt',
    description: 'Ultra-soft 100% cotton t-shirt perfect for everyday wear and custom printing.',
    category: 'tshirts',
    basePrice: 12.99,
    images: ['/products/ts-001.jpg', '/products/ts-001-front.jpg', '/products/ts-001-back.jpg'],
    colors: [
      { name: 'White', hex: '#FFFFFF', available: true },
      { name: 'Black', hex: '#000000', available: true },
      { name: 'Navy', hex: '#000080', available: true },
      { name: 'Gray', hex: '#808080', available: true },
      { name: 'Red', hex: '#FF0000', available: true },
      { name: 'Royal Blue', hex: '#4169E1', available: true },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    brand: 'Gildan',
    rating: 4.8,
    reviews: 2231,
    featured: true,
    topSeller: true,
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    fabric: '100% Cotton',
    weight: '5.3 oz'
  },
  {
    id: 'ts-002',
    name: 'Adult Heavy Cotton T-Shirt',
    description: 'Durable heavyweight cotton tee ideal for screen printing and DTF transfers.',
    category: 'tshirts',
    basePrice: 10.99,
    images: ['/products/tshirt-gray.jpg'],
    colors: [
      { name: 'White', hex: '#FFFFFF', available: true },
      { name: 'Black', hex: '#000000', available: true },
      { name: 'Sport Gray', hex: '#8B8B8B', available: true },
      { name: 'Navy', hex: '#000080', available: true },
      { name: 'Cardinal Red', hex: '#C41E3A', available: true },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    brand: 'Gildan',
    rating: 4.9,
    reviews: 3670,
    topSeller: true,
    availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    fabric: '100% Cotton',
    weight: '6.1 oz'
  },
  {
    id: 'ts-003',
    name: 'Ladies V-Neck T-Shirt',
    description: 'Flattering fit cotton t-shirt designed for women with a comfortable v-neck.',
    category: 'tshirts',
    basePrice: 11.99,
    images: ['/products/tshirt-vneck.jpg'],
    colors: [
      { name: 'White', hex: '#FFFFFF', available: true },
      { name: 'Black', hex: '#000000', available: true },
      { name: 'Pink', hex: '#FFC0CB', available: true },
      { name: 'Teal', hex: '#008080', available: true },
      { name: 'Purple', hex: '#800080', available: true },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    brand: 'Bella+Canvas',
    rating: 4.7,
    reviews: 1560,
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    fabric: '100% Cotton',
    weight: '4.5 oz'
  },
  
  // Hoodies
  {
    id: 'hd-001',
    name: 'Heavyweight Pullover Hoodie',
    description: 'Warm and cozy pullover hoodie with front pocket and adjustable drawstring hood.',
    category: 'hoodies',
    basePrice: 29.99,
    images: ['/products/hoodie-black.jpg'],
    colors: [
      { name: 'Black', hex: '#000000', available: true },
      { name: 'Navy', hex: '#000080', available: true },
      { name: 'Gray', hex: '#808080', available: true },
      { name: 'Maroon', hex: '#800000', available: true },
      { name: 'Forest Green', hex: '#228B22', available: true },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    brand: 'Port & Company',
    rating: 4.8,
    reviews: 672,
    featured: true,
    availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    fabric: '50% Cotton / 50% Polyester',
    weight: '8.0 oz'
  },
  {
    id: 'hd-002',
    name: 'Zip-Up Hoodie',
    description: 'Full-zip hoodie with side pockets and comfortable fleece lining.',
    category: 'hoodies',
    basePrice: 32.99,
    images: ['/products/hoodie-zip.jpg'],
    colors: [
      { name: 'Black', hex: '#000000', available: true },
      { name: 'Navy', hex: '#000080', available: true },
      { name: 'Gray', hex: '#808080', available: true },
      { name: 'Royal Blue', hex: '#4169E1', available: true },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    brand: 'Gildan',
    rating: 4.7,
    reviews: 534,
    availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    fabric: '50% Cotton / 50% Polyester',
    weight: '8.0 oz'
  },
  
  // Sweatshirts
  {
    id: 'sw-001',
    name: 'Crewneck Sweatshirt',
    description: 'Classic crewneck sweatshirt with soft fleece interior and ribbed cuffs.',
    category: 'sweatshirts',
    basePrice: 24.99,
    images: ['/products/sweatshirt-crew.jpg'],
    colors: [
      { name: 'White', hex: '#FFFFFF', available: true },
      { name: 'Black', hex: '#000000', available: true },
      { name: 'Navy', hex: '#000080', available: true },
      { name: 'Gray', hex: '#808080', available: true },
      { name: 'Burgundy', hex: '#800020', available: true },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    brand: 'Gildan',
    rating: 4.7,
    reviews: 892,
    availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    fabric: '50% Cotton / 50% Polyester',
    weight: '8.0 oz'
  },
  
  // Polos
  {
    id: 'pl-001',
    name: 'Performance Polo Shirt',
    description: 'Moisture-wicking polo shirt perfect for sports teams and corporate wear.',
    category: 'polos',
    basePrice: 18.99,
    images: ['/products/polo-black.jpg'],
    colors: [
      { name: 'White', hex: '#FFFFFF', available: true },
      { name: 'Black', hex: '#000000', available: true },
      { name: 'Navy', hex: '#000080', available: true },
      { name: 'Red', hex: '#FF0000', available: true },
      { name: 'Gray', hex: '#808080', available: true },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    brand: 'Sport-Tek',
    rating: 4.6,
    reviews: 298,
    availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    fabric: '100% Polyester',
    weight: '3.8 oz'
  },
  {
    id: 'pl-002',
    name: 'Cotton Pique Polo',
    description: 'Classic cotton polo with traditional styling and comfortable fit.',
    category: 'polos',
    basePrice: 16.99,
    images: ['/products/polo-pique.jpg'],
    colors: [
      { name: 'White', hex: '#FFFFFF', available: true },
      { name: 'Black', hex: '#000000', available: true },
      { name: 'Navy', hex: '#000080', available: true },
      { name: 'Royal Blue', hex: '#4169E1', available: true },
    ],
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    brand: 'Jerzees',
    rating: 4.5,
    reviews: 445,
    availableSizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'],
    fabric: '100% Cotton',
    weight: '6.5 oz'
  },
  
  // Kids
  {
    id: 'ks-001',
    name: 'Youth Premium T-Shirt',
    description: 'High-quality cotton t-shirt sized for kids and young teens.',
    category: 'kids',
    basePrice: 9.99,
    images: ['/products/kids-tshirt.jpg'],
    colors: [
      { name: 'White', hex: '#FFFFFF', available: true },
      { name: 'Black', hex: '#000000', available: true },
      { name: 'Navy', hex: '#000080', available: true },
      { name: 'Red', hex: '#FF0000', available: true },
      { name: 'Royal Blue', hex: '#4169E1', available: true },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    brand: 'Gildan',
    rating: 4.8,
    reviews: 512,
    availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '100% Cotton',
    weight: '5.0 oz'
  },
  {
    id: 'ks-002',
    name: 'Youth Pullover Hoodie',
    description: 'Warm hoodie for kids with kangaroo pocket and soft fleece lining.',
    category: 'kids',
    basePrice: 19.99,
    images: ['/products/kids-hoodie.jpg'],
    colors: [
      { name: 'Black', hex: '#000000', available: true },
      { name: 'Navy', hex: '#000080', available: true },
      { name: 'Gray', hex: '#808080', available: true },
      { name: 'Red', hex: '#FF0000', available: true },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    brand: 'Gildan',
    rating: 4.9,
    reviews: 387,
    availableSizes: ['XS', 'S', 'M', 'L', 'XL'],
    fabric: '50% Cotton / 50% Polyester',
    weight: '7.75 oz'
  },
  
  // Baby
  {
    id: 'bb-001',
    name: 'Soft Cotton Baby Onesie',
    description: 'Adorable cotton onesie perfect for baby\'s first custom designs.',
    category: 'baby',
    basePrice: 8.99,
    images: ['/products/baby-onesie.jpg'],
    colors: [
      { name: 'White', hex: '#FFFFFF', available: true },
      { name: 'Pink', hex: '#FFC0CB', available: true },
      { name: 'Blue', hex: '#87CEEB', available: true },
      { name: 'Yellow', hex: '#FFFFE0', available: true },
    ],
    sizes: ['NB', '0-3M', '3-6M', '6-12M', '12-18M'],
    brand: 'Rabbit Skins',
    rating: 4.8,
    reviews: 342,
    featured: true,
    availableSizes: ['NB', '0-3M', '3-6M', '6-12M', '12-18M'],
    fabric: '100% Cotton',
    weight: '4.5 oz'
  },
  {
    id: 'bb-002',
    name: 'Baby T-Shirt',
    description: 'Comfortable cotton t-shirt for babies and toddlers.',
    category: 'baby',
    basePrice: 7.99,
    images: ['/products/baby-tshirt.jpg'],
    colors: [
      { name: 'White', hex: '#FFFFFF', available: true },
      { name: 'Pink', hex: '#FFC0CB', available: true },
      { name: 'Blue', hex: '#87CEEB', available: true },
    ],
    sizes: ['6M', '12M', '18M', '24M'],
    brand: 'Rabbit Skins',
    rating: 4.7,
    reviews: 198,
    availableSizes: ['6M', '12M', '18M', '24M'],
    fabric: '100% Cotton',
    weight: '4.5 oz'
  },
];

export const categories = [
  { id: 'all', name: 'All Products', icon: '🛍️' },
  { id: 'tshirts', name: 'T-Shirts', icon: '👕' },
  { id: 'hoodies', name: 'Hoodies', icon: '🧥' },
  { id: 'sweatshirts', name: 'Sweatshirts', icon: '👔' },
  { id: 'polos', name: 'Polo Shirts', icon: '👕' },
  { id: 'kids', name: 'Kids', icon: '👶' },
  { id: 'baby', name: 'Baby', icon: '🍼' },
];
