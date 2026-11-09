import DEMO_SAREE_IMAGES from '../assets/sareeImages';

/**
 * Shared App Categories
 * Used uniformly across HomeScreen and CollectionsScreen for 100% visual and functional consistency.
 */
export const APP_CATEGORIES = [
  {
    id: 'all',
    label: 'All',
    image: DEMO_SAREE_IMAGES[0],
  },
  {
    id: 'sarees',
    label: 'Kanchipuram',
    image: require('../assets/category_saree.jpg'),
  },
  {
    id: 'katan',
    label: 'Banarasi',
    image: require('../assets/sareeEmerald.jpg'),
  },
  {
    id: 'bridal',
    label: 'Bridal',
    image: require('../assets/category_lehenga.jpg'),
  },
  {
    id: 'tissue',
    label: 'Tissue',
    image: require('../assets/sareeCrimson.jpg'),
  },
  {
    id: 'paithani',
    label: 'Paithani',
    image: DEMO_SAREE_IMAGES[5],
  },
];

export default APP_CATEGORIES;

