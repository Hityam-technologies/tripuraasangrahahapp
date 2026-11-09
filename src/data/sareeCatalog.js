import { DEMO_SAREE_IMAGES } from '../assets/sareeImages';
import { APP_CATEGORIES } from './categories';

/**
 * Curated Master Catalog of Handloom Saree Weaves
 */
export const MASTER_COLLECTIONS = [
  {
    id: 'saree-1',
    brand: 'Tripuraa Heritage',
    title: 'Swarna Kanchipuram Pure Zari Silk',
    price: '₹28,500',
    numericPrice: 28500,
    mrp: '₹34,000',
    category: 'sarees',
    weave: 'Kanchipuram Handloom',
    fabric: 'Pure Mulberry Silk',
    zari: 'Gold & Silver Zari',
    origin: 'Kanchipuram, Tamil Nadu',
    colorTheme: 'gold',
    images: DEMO_SAREE_IMAGES,
    image: DEMO_SAREE_IMAGES[0],
    tryOnImage: require('../assets/sareeModelPink_nobg.png'),
    description:
      'Authentic temple border Kanchipuram handwoven on traditional pit looms with pure gold and silver dipped tested zari and sacred korvai motifs.',
    stock: '1 Heritage Weave Left',
  },
  {
    id: 'saree-2',
    brand: 'Heritage Katan',
    title: 'Emerald Brocade Royal Zari Drape',
    price: '₹38,000',
    numericPrice: 38000,
    mrp: '₹44,500',
    category: 'katan',
    weave: 'Banarasi Katan Silk',
    fabric: 'Pure Katan Silk',
    zari: 'Antique Tested Zari',
    origin: 'Varanasi, Uttar Pradesh',
    colorTheme: 'emerald',
    images: [
      DEMO_SAREE_IMAGES[1],
      DEMO_SAREE_IMAGES[2],
      DEMO_SAREE_IMAGES[3],
    ],
    image: DEMO_SAREE_IMAGES[1],
    tryOnImage: require('../assets/sareeEmerald.jpg'),
    description:
      'Classic Banarasi brocade woven in lustrous emerald green with kadhwa floral jaal and antique gold zari pallu fit for royalty.',
    stock: 'Handcrafted on Order',
  },
  {
    id: 'saree-3',
    brand: 'Varanasi Royal',
    title: 'Crimson Bridal Handwoven Silk',
    price: '₹32,900',
    numericPrice: 32900,
    mrp: '₹39,000',
    category: 'bridal',
    weave: 'Varanasi Bridal Weave',
    fabric: 'Pure Silk',
    zari: 'Royal Saffron Zari',
    origin: 'Varanasi, Uttar Pradesh',
    colorTheme: 'crimson',
    images: [
      DEMO_SAREE_IMAGES[4],
      DEMO_SAREE_IMAGES[5],
      DEMO_SAREE_IMAGES[6],
    ],
    image: DEMO_SAREE_IMAGES[4],
    tryOnImage: require('../assets/sareeCrimson_nobg.png'),
    description:
      'Exquisite bridal heirloom in deep crimson adorned with intricate floral jaal and meenakari craftsmanship with pure silk warp.',
    stock: '2 Pieces Crafted',
  },
  {
    id: 'saree-4',
    brand: 'Tripuraa Couture',
    title: 'Gulabi Pure Temple Kanchipuram',
    price: '₹27,500',
    numericPrice: 27500,
    mrp: '₹32,000',
    category: 'sarees',
    weave: 'Temple Border Silk',
    fabric: 'Pure Handloom Silk',
    zari: 'Pure Zari Pallu',
    origin: 'Kanchipuram, Tamil Nadu',
    colorTheme: 'pink',
    images: [
      DEMO_SAREE_IMAGES[2],
      DEMO_SAREE_IMAGES[0],
      DEMO_SAREE_IMAGES[4],
    ],
    image: DEMO_SAREE_IMAGES[2],
    tryOnImage: require('../assets/sareeModelPink_nobg.png'),
    description:
      'Auspicious rose pink silk paired with contrasting deep purple border and traditional rudraksha korvai weave for timeless heritage.',
    stock: 'In Stock',
  },
  {
    id: 'saree-5',
    brand: 'Swarna Mandir',
    title: 'Royal Bridal Gold Tissue Drape',
    price: '₹45,000',
    numericPrice: 45000,
    mrp: '₹52,000',
    category: 'tissue',
    weave: 'Tissue Brocade Handloom',
    fabric: 'Pure Silk & Tissue',
    zari: 'Fine Gold Zari',
    origin: 'Chanderi & Varanasi',
    colorTheme: 'gold',
    images: [
      DEMO_SAREE_IMAGES[3],
      DEMO_SAREE_IMAGES[5],
      DEMO_SAREE_IMAGES[1],
    ],
    image: DEMO_SAREE_IMAGES[3],
    tryOnImage: require('../assets/sareeModelPink_nobg.png'),
    description:
      'Shimmering metallic gold tissue warp handwoven with pure mulberry silk weft, radiating pure luxury and grand ceremonial splendor.',
    stock: 'Exclusive Single Weave',
  },
  {
    id: 'saree-6',
    brand: 'Maharani Weaves',
    title: 'Peacock Blue Paithani Silk Saree',
    price: '₹34,500',
    numericPrice: 34500,
    mrp: '₹40,000',
    category: 'paithani',
    weave: 'Yeola Handloom Paithani',
    fabric: 'Pure Silk',
    zari: 'Gold Zari Asawali Border',
    origin: 'Yeola, Maharashtra',
    colorTheme: 'blue',
    images: [
      DEMO_SAREE_IMAGES[5],
      DEMO_SAREE_IMAGES[3],
      DEMO_SAREE_IMAGES[2],
    ],
    image: DEMO_SAREE_IMAGES[5],
    tryOnImage: require('../assets/sareeEmerald.jpg'),
    description:
      'Traditional Yeola Paithani featuring signature mor-bangadi (peacock in bangle) motifs and hand-knotted gold zari pallu.',
    stock: 'In Stock',
  },
  {
    id: 'saree-7',
    brand: 'Kashi Heritage',
    title: 'Rani Pink Shikargah Brocade',
    price: '₹41,200',
    numericPrice: 41200,
    mrp: '₹48,000',
    category: 'katan',
    weave: 'Shikargah Banarasi Handloom',
    fabric: 'Pure Katan Silk',
    zari: 'Antique Sona-Rupa Zari',
    origin: 'Varanasi, Uttar Pradesh',
    colorTheme: 'pink',
    images: [
      DEMO_SAREE_IMAGES[6],
      DEMO_SAREE_IMAGES[1],
      DEMO_SAREE_IMAGES[4],
    ],
    image: DEMO_SAREE_IMAGES[6],
    tryOnImage: require('../assets/sareeCrimson_nobg.png'),
    description:
      'Historical hunting scene (Shikargah) woven with real dual-toned sona and rupa zari across the entire field for timeless regal allure.',
    stock: 'Rare Heritage Masterpiece',
  },
  {
    id: 'saree-8',
    brand: 'Tripuraa Bridal',
    title: 'Sindhuri Scarlet Bridal Trousseau',
    price: '₹49,500',
    numericPrice: 49500,
    mrp: '₹58,000',
    category: 'bridal',
    weave: 'Heritage Bridal Brocade',
    fabric: 'Pure Mulberry Silk',
    zari: 'Heavy Floral Zari Pallu',
    origin: 'Kanchipuram, Tamil Nadu',
    colorTheme: 'crimson',
    images: [
      DEMO_SAREE_IMAGES[4],
      DEMO_SAREE_IMAGES[0],
      DEMO_SAREE_IMAGES[3],
    ],
    image: DEMO_SAREE_IMAGES[4],
    tryOnImage: require('../assets/sareeCrimson_nobg.png'),
    description:
      'The pinnacle of wedding luxury: scarlet red pure silk hand-loomed over four months with ceremonial paisley bootas and grand gold pallu.',
    stock: 'Limited Edition',
  },
  {
    id: 'saree-9',
    brand: 'Dakshin Silks',
    title: 'Haldi Mustard Kanchipuram Silk',
    price: '₹26,800',
    numericPrice: 26800,
    mrp: '₹31,000',
    category: 'sarees',
    weave: 'Kanchipuram Korvai',
    fabric: 'Pure Silk',
    zari: 'Ganga-Jamuna Zari Border',
    origin: 'Kanchipuram, Tamil Nadu',
    colorTheme: 'gold',
    images: [
      DEMO_SAREE_IMAGES[0],
      DEMO_SAREE_IMAGES[5],
      DEMO_SAREE_IMAGES[2],
    ],
    image: DEMO_SAREE_IMAGES[0],
    tryOnImage: require('../assets/sareeModelPink_nobg.png'),
    description:
      'Bright auspicious turmeric yellow drape with dual contrasting borders, ideal for haldi, muhurtham, and morning ceremonies.',
    stock: 'In Stock',
  },
  {
    id: 'saree-10',
    brand: 'Ratnaavali Silks',
    title: 'Silver Mist Tissue Organza Silk',
    price: '₹36,000',
    numericPrice: 36000,
    mrp: '₹42,000',
    category: 'tissue',
    weave: 'Tissue Organza Weave',
    fabric: 'Pure Tissue Organza',
    zari: 'Fine Silver Zari Work',
    origin: 'Chanderi, Madhya Pradesh',
    colorTheme: 'silver',
    images: [
      DEMO_SAREE_IMAGES[1],
      DEMO_SAREE_IMAGES[6],
      DEMO_SAREE_IMAGES[3],
    ],
    image: DEMO_SAREE_IMAGES[1],
    tryOnImage: require('../assets/sareeEmerald.jpg'),
    description:
      'Ethereal sheer tissue drape infused with delicate silver zari threads, creating an enchanting royal evening glow.',
    stock: 'Single Artisanal Piece',
  },
];

/**
 * Curated Collection of Authentic Handloom Sarees for Virtual Try-On Studio
 */
export const TRY_ON_SAREES = MASTER_COLLECTIONS.map((saree) => ({
  id: saree.id,
  name: saree.title,
  fabric: `${saree.fabric} • ${saree.zari}`,
  price: saree.price,
  origin: saree.origin,
  image: saree.image,
  tryOnImage: saree.tryOnImage,
  accentColor: saree.colorTheme === 'emerald' ? '#1F5A38' : saree.colorTheme === 'crimson' ? '#8C1D2F' : '#B08828',
}));

/**
 * Sorting options for collection catalog
 */
export const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
];

/**
 * Filter quick chips for collection catalog
 */
export const QUICK_CHIPS = [
  { id: 'all', label: 'All Weaves' },
  { id: 'pure_zari', label: 'Pure Zari' },
  { id: 'handloom', label: 'Handloom' },
  { id: 'wedding', label: 'Wedding Edit' },
  { id: 'under_30k', label: 'Under ₹30K' },
];

export const TOP_PICKS_PRODUCTS = MASTER_COLLECTIONS.slice(0, 6);
export const FOR_YOU_PRODUCTS = TOP_PICKS_PRODUCTS;

export const getSareeById = (id) =>
  MASTER_COLLECTIONS.find((saree) => saree.id === id);

export default MASTER_COLLECTIONS;
