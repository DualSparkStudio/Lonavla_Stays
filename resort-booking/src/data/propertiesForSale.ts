import { formatPrice } from './resort';

export type PropertyCategory = 'villa' | 'plot';

export type PropertyForSale = {
  id: string;
  title: string;
  category: PropertyCategory;
  description: string;
  longDescription: string;
  price: number;
  /** When true, show "Price on request" instead of amount */
  priceOnRequest?: boolean;
  location: string;
  address: string;
  /** Built-up area (villas) or plot dimensions */
  areaLabel: string;
  bedrooms?: number;
  bathrooms?: number;
  status: 'available' | 'reserved' | 'sold';
  highlights: string[];
  images: string[];
  /** Google Maps embed iframe src, embed URL, or share link */
  mapEmbedUrl?: string;
  /** Google Maps share/place link for guests — Share → Copy link */
  mapsLink?: string;
};

export const propertiesForSale: PropertyForSale[] = [
  {
    id: 'sale-villa-1',
    title: 'Sunset Ridge Villa',
    category: 'villa',
    description:
      'Fully furnished 4 BHK hill villa with valley views, private pool, and clear title—ready to move in or use as a holiday home.',
    longDescription:
      'Sunset Ridge is a standalone villa on a 8,000 sq ft plot in a gated Lonavala neighbourhood. The home includes a double-height living room, modular kitchen, four en-suite bedrooms, and a heated plunge pool. Power backup, rainwater harvesting, and staff quarters are included. Ideal for end-users or investors seeking a turnkey property in the Western Ghats.',
    price: 28500000,
    location: 'Tiger Valley, Lonavala',
    address: 'Survey No. 45, Tiger Valley Road, Lonavala, Maharashtra 410401',
    areaLabel: '3,200 sq ft built-up · 8,000 sq ft plot',
    bedrooms: 4,
    bathrooms: 4,
    status: 'available',
    highlights: ['Clear title', 'Private pool', 'Furnished', 'Valley view', 'Gated community', 'Parking for 3 cars'],
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    ],
  },
  {
    id: 'sale-villa-2',
    title: 'Mistwood Cottage Estate',
    category: 'villa',
    description:
      'Charming 3 BHK stone-and-wood cottage on half an acre—surrounded by native trees, minutes from Tungarli Lake.',
    longDescription:
      'Mistwood Cottage blends colonial architecture with modern comforts. Spread across two levels, the property features a wraparound veranda, fireplace lounge, and landscaped garden with a gazebo. All statutory approvals are in place. A rare opportunity to own a character home in one of Lonavala’s most sought-after lanes.',
    price: 19200000,
    location: 'Tungarli, Lonavala',
    address: 'Lane 7, Near Tungarli Lake, Lonavala, Maharashtra 410403',
    areaLabel: '2,400 sq ft built-up · 22,000 sq ft land',
    bedrooms: 3,
    bathrooms: 3,
    status: 'available',
    highlights: ['Heritage style', 'Large garden', 'Lake proximity', 'Approved plans', 'Servant room', 'Bore well'],
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1605276374101-e4f283423591?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    ],
  },
  {
    id: 'sale-plot-1',
    title: 'Hilltop NA Plot — Khandala View',
    category: 'plot',
    description:
      'NA-sanctioned 10,000 sq ft plot with unobstructed Sahyadri views. Ideal for a weekend villa or boutique stay project.',
    longDescription:
      'This east-facing NA plot sits on a gentle slope with a 40 ft road access. Electricity and water connections available at the boundary wall. Soil test and contour survey reports can be shared on request. Located 8 minutes from the Mumbai–Pune Expressway, with Lonavala town and schools within a 15-minute drive.',
    price: 8500000,
    location: 'Khandala Hills, Lonavala',
    address: 'Plot 14, Green Ridge Layout, Khandala View Road, Lonavala 410401',
    areaLabel: '10,000 sq ft (NA sanctioned)',
    status: 'available',
    highlights: ['NA sanctioned', 'Road access', 'Panoramic view', 'Corner plot', 'Electricity at gate', 'Clear title'],
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
    ],
  },
  {
    id: 'sale-plot-2',
    title: 'Valley Meadows — Twin Plots',
    category: 'plot',
    description:
      'Two adjacent 5,000 sq ft plots in a premium Lonavala layout. Buy one or both—perfect for a family compound or twin villas.',
    longDescription:
      'Valley Meadows is a boutique plotted development with internal roads, street lighting, and 24/7 security. Each plot has individual 7/12 extract and is ready for construction. Clubhouse and common green access included. Combined purchase available at a preferential rate—enquire for details.',
    price: 4200000,
    location: 'Kurvande, Lonavala',
    address: 'Block C, Valley Meadows, Kurvande, Lonavala 410401',
    areaLabel: '5,000 sq ft each (2 plots available)',
    status: 'available',
    highlights: ['Gated layout', 'Individual 7/12', 'Clubhouse access', 'Twin plot option', 'Internal roads', 'Security'],
    images: [
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop',
    ],
  },
  {
    id: 'sale-plot-3',
    title: 'Riverside Agricultural Land',
    category: 'plot',
    description:
      '1.2 acre riverside land with conversion potential—suited for farmhouse, agro-tourism, or long-term investment.',
    longDescription:
      'A scenic parcel along a seasonal stream, bordered by mature trees. Currently agricultural; conversion documentation in progress. Water source on-site. Access via tar road. Due diligence pack including survey maps and lawyer summary available for serious buyers.',
    price: 0,
    priceOnRequest: true,
    location: 'Dhamandri, Lonavala outskirts',
    address: 'Gat No. 892, Dhamandri Village, Maval Taluka, Pune District',
    areaLabel: '1.2 acres (approx. 52,000 sq ft)',
    status: 'available',
    highlights: ['Riverside', 'Farmhouse potential', 'Tar road access', 'Natural tree cover', 'Investment grade', 'Due diligence pack'],
    images: [
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1426604966848-d7ad8d227736?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop',
    ],
  },
  {
    id: 'sale-villa-3',
    title: 'Cloud Nine Penthouse Villa',
    category: 'villa',
    description:
      'Ultra-premium 5 BHK duplex villa with home theatre, rooftop terrace, and smart-home automation throughout.',
    longDescription:
      'Cloud Nine occupies the top two floors of a boutique building with a private lift lobby. Italian marble flooring, imported fittings, and a chef’s kitchen define the interiors. The 1,200 sq ft terrace includes a jacuzzi and outdoor kitchen. Currently tenanted until December—option to assume lease or vacant possession by agreement.',
    price: 45000000,
    location: 'Lonavala Town',
    address: 'Cloud Nine Residences, Old Mumbai-Pune Highway, Lonavala 410401',
    areaLabel: '4,800 sq ft built-up + 1,200 sq ft terrace',
    bedrooms: 5,
    bathrooms: 5,
    status: 'reserved',
    highlights: ['Smart home', 'Private lift', 'Rooftop jacuzzi', 'Home theatre', 'Premium fittings', 'Town centre'],
    images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop',
    ],
  },
];

export function getPropertyForSaleById(id: string): PropertyForSale | undefined {
  return propertiesForSale.find((p) => p.id === id);
}

export function formatSalePrice(property: PropertyForSale): string {
  if (property.priceOnRequest || property.price <= 0) {
    return 'Price on request';
  }
  return formatPrice(property.price);
}

export function getCategoryLabel(category: PropertyCategory): string {
  return category === 'villa' ? 'Villa for sale' : 'Plot for sale';
}

export function getStatusLabel(status: PropertyForSale['status']): string {
  switch (status) {
    case 'available':
      return 'Available';
    case 'reserved':
      return 'Reserved';
    case 'sold':
      return 'Sold';
  }
}
