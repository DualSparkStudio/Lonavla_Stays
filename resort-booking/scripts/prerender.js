import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

const BASE_URL = 'https://lonavalastays.in';
const DEFAULT_OG_IMAGE = `${BASE_URL}/brand/og-image.jpg`;
const LOGO_IMAGE = `${BASE_URL}/brand/lonavala-stays-logo.png`;

const RESORT_NAME = 'Lonavala Stays';
const RESORT_LOCATION = 'Lonavala, Maharashtra';
const RESORT_ADDRESS = 'Office 2, Hill Plaza, Old Mumbai-Pune Highway, Lonavala 410401, Maharashtra, India';
const RESORT_PHONE = '+91 98765 43210';
const RESORT_EMAIL = 'stay@lonavalastays.com';

const villas = [
  {
    id: '1',
    name: 'Valley View Villa',
    room_type: 'Deluxe Villa',
    description:
      'A standalone hill villa with misty Sahyadri views from a private deck. Ideal for couples and small families seeking a quiet Lonavala escape.',
    price_per_night: 6500,
    weekend_price_per_night: 7500,
    location: 'Tiger Valley, Lonavala',
    address: 'Survey No. 12, Tiger Valley Road, Lonavala, Maharashtra 410401',
    max_guests: 3,
    room_number: 'VV-01',
    amenities: ['Valley View', 'Private Deck', 'Wi-Fi', 'Air Conditioning', 'Kitchenette', 'Breakfast Included'],
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de666a01?w=800&h=600&fit=crop',
    ],
  },
  {
    id: '2',
    name: 'Garden Wing Villa',
    room_type: 'Family Villa',
    description:
      'Spacious private villa with landscaped gardens and a separate living wing—perfect for families who want their own property in the hills.',
    price_per_night: 9200,
    weekend_price_per_night: 10500,
    location: 'Tungarli, Lonavala',
    address: 'Lane 4, Near Tungarli Lake, Lonavala, Maharashtra 410403',
    max_guests: 5,
    room_number: 'GW-02',
    amenities: ['Private Garden', 'Living Area', 'Wi-Fi', 'Air Conditioning', 'Parking', 'BBQ Patio'],
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
    ],
  },
  {
    id: '3',
    name: 'Hillside Premium Villa',
    room_type: 'Premium Villa',
    description:
      'Flagship villa with panoramic hill views, premium interiors, and a large sit-out—our most requested property for special occasions.',
    price_per_night: 11500,
    weekend_price_per_night: 12900,
    location: 'Khandala Hills, Lonavala',
    address: 'Plot 8, Khandala View Road, Lonavala, Maharashtra 410401',
    max_guests: 4,
    room_number: 'HP-03',
    amenities: ['Panoramic View', 'King Bed', 'Private Pool', 'Wi-Fi', 'Chef on Request', 'Tea/Coffee Bar'],
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
    ],
  },
  {
    id: '4',
    name: 'Garden Cottage Villa',
    room_type: 'Cottage Villa',
    description:
      'Intimate standalone cottage tucked into greenery—romantic, private, and fully self-contained with its own entrance and patio.',
    price_per_night: 7800,
    weekend_price_per_night: 8900,
    location: 'Kurvande, Lonavala',
    address: 'Cottage 12, Green Meadows Estate, Kurvande, Lonavala 410401',
    max_guests: 2,
    room_number: 'GC-04',
    amenities: ['Private Entry', 'Garden Patio', 'Wi-Fi', 'Air Conditioning', 'Complimentary Breakfast', 'Parking'],
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&h=600&fit=crop',
    ],
  },
];

const facilities = [
  {
    name: 'Carrom',
    description: 'Indoor carrom board for relaxed family game nights at the villa.',
    hours: 'Included with stay',
    image: 'https://images.unsplash.com/photo-1768518354646-33833e95a24d?auto=format&fit=crop&w=800&h=500&q=80',
  },
  {
    name: 'Badminton',
    description: 'Badminton setup for outdoor play—rackets and shuttle available at the property.',
    hours: 'Included with stay',
    image: 'https://images.pexels.com/photos/31724424/pexels-photo-31724424.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  },
  {
    name: 'Swimming Pool',
    description: 'Private swimming pool for guests—perfect for a refreshing dip in the hills.',
    hours: 'Included with stay',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&h=500&q=80',
  },
  {
    name: 'BBQ Grill (On Request)',
    description: 'Barbecue grill arranged on request for outdoor dining and grill nights.',
    hours: 'On request',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=500&q=80',
  },
  {
    name: 'Portable Speaker',
    description: 'Portable Bluetooth speaker for music on the terrace, by the pool, or indoors.',
    hours: 'Included with stay',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&h=500&q=80',
  },
  {
    name: '32" Smart TV | Free Wi-Fi',
    description: '32-inch smart TV with streaming apps and complimentary high-speed Wi-Fi throughout the villa.',
    hours: 'Included with stay',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&h=500&q=80',
  },
];

const lodgingBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  '@id': `${BASE_URL}/#lodgingBusiness`,
  name: RESORT_NAME,
  description: 'Curated luxury villas across Lonavala, Maharashtra with private pools, decks, and mountain views.',
  url: `${BASE_URL}/`,
  telephone: RESORT_PHONE,
  email: RESORT_EMAIL,
  priceRange: '₹6,500 - ₹12,900',
  image: DEFAULT_OG_IMAGE,
  logo: LOGO_IMAGE,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Office 2, Hill Plaza, Old Mumbai-Pune Highway',
    addressLocality: 'Lonavala',
    addressRegion: 'Maharashtra',
    postalCode: '410401',
    addressCountry: 'IN',
  },
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Wi-Fi', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Air Conditioning', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Swimming Pool', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'Free Parking', value: true },
    { '@type': 'LocationFeatureSpecification', name: 'BBQ Grill', value: true },
  ],
  checkinTime: '13:00',
  checkoutTime: '11:00',
};

function getVillaSchema(villa) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    '@id': `${BASE_URL}/villas/${villa.id}#accommodation`,
    name: `${villa.name} - ${villa.room_type}`,
    description: villa.description,
    url: `${BASE_URL}/villas/${villa.id}`,
    image: villa.images,
    address: {
      '@type': 'PostalAddress',
      streetAddress: villa.address.split(', Lonavala')[0],
      addressLocality: 'Lonavala',
      addressRegion: 'Maharashtra',
      postalCode: '410401',
      addressCountry: 'IN',
    },
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: villa.max_guests,
    },
    amenityFeature: villa.amenities.map((a) => ({
      '@type': 'LocationFeatureSpecification',
      name: a,
      value: true,
    })),
    priceRange: `₹${villa.price_per_night.toLocaleString('en-IN')} - ₹${(villa.weekend_price_per_night || villa.price_per_night).toLocaleString('en-IN')}`,
    parentOrganization: {
      '@type': 'LodgingBusiness',
      name: RESORT_NAME,
      url: `${BASE_URL}/`,
      telephone: RESORT_PHONE,
    },
  };
}

const commonHeaderHtml = `
  <header style="background:#fff;border-bottom:1px solid #e5e7eb;padding:1rem 1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
    <div style="font-size:1.5rem;font-weight:bold;color:#ff385c;">
      <a href="/" style="text-decoration:none;color:inherit;">${RESORT_NAME}</a>
    </div>
    <nav style="display:flex;gap:1.5rem;align-items:center;" aria-label="Main navigation">
      <a href="/villas" style="text-decoration:none;color:#1f2937;font-weight:500;">Villas</a>
      <a href="/facilities" style="text-decoration:none;color:#1f2937;font-weight:500;">Facilities</a>
      <a href="/about" style="text-decoration:none;color:#1f2937;font-weight:500;">About</a>
      <a href="/contact" style="text-decoration:none;color:#1f2937;font-weight:500;">Contact</a>
      <a href="/villas" style="text-decoration:none;background:#ff385c;color:#fff;padding:0.5rem 1.25rem;border-radius:9999px;font-weight:600;">Book Now</a>
    </nav>
  </header>
`;

const commonFooterHtml = `
  <footer style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:2.5rem 1.5rem;margin-top:3rem;color:#374151;">
    <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:2rem;">
      <div>
        <h3 style="font-size:1.25rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;">${RESORT_NAME}</h3>
        <p style="line-height:1.6;margin-bottom:1rem;">We curate, operate, and manage a collection of private standalone luxury villas across Lonavala, Maharashtra.</p>
        <p style="font-size:0.875rem;color:#6b7280;">© ${new Date().getFullYear()} ${RESORT_NAME}. All rights reserved.</p>
      </div>
      <div>
        <h4 style="font-size:1rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;text-transform:uppercase;">Quick Links</h4>
        <ul style="list-style:none;padding:0;margin:0;line-height:2;">
          <li><a href="/villas" style="color:#374151;text-decoration:none;">Villas Collection</a></li>
          <li><a href="/facilities" style="color:#374151;text-decoration:none;">Villa Facilities</a></li>
          <li><a href="/about" style="color:#374151;text-decoration:none;">About Us</a></li>
          <li><a href="/contact" style="color:#374151;text-decoration:none;">Contact &amp; Enquiries</a></li>
          <li><a href="/terms" style="color:#374151;text-decoration:none;">Terms &amp; Conditions</a></li>
          <li><a href="/house-rules" style="color:#374151;text-decoration:none;">House Rules</a></li>
        </ul>
      </div>
      <div>
        <h4 style="font-size:1rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;text-transform:uppercase;">Reservations &amp; Office</h4>
        <p style="margin-bottom:0.5rem;"><strong>Office:</strong> ${RESORT_ADDRESS}</p>
        <p style="margin-bottom:0.5rem;"><strong>Phone / WhatsApp:</strong> <a href="tel:${RESORT_PHONE.replace(/\\s/g, '')}" style="color:#ff385c;text-decoration:none;">${RESORT_PHONE}</a></p>
        <p style="margin-bottom:0.5rem;"><strong>Email:</strong> <a href="mailto:${RESORT_EMAIL}" style="color:#ff385c;text-decoration:none;">${RESORT_EMAIL}</a></p>
      </div>
    </div>
  </footer>
`;

function renderVillaCard(villa) {
  return `
    <article style="background:#fff;border:1px solid #e5e7eb;border-radius:0.75rem;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);display:flex;flex-direction:column;">
      <img src="${villa.images[0]}" alt="${villa.name} exterior and living space in ${villa.location}" width="800" height="600" loading="lazy" style="width:100%;height:16rem;object-fit:cover;" />
      <div style="padding:1.5rem;flex:1;display:flex;flex-direction:column;">
        <span style="font-size:0.75rem;text-transform:uppercase;color:#ff385c;font-weight:700;margin-bottom:0.25rem;">${villa.room_type}</span>
        <h3 style="font-size:1.35rem;font-weight:bold;color:#111827;margin:0 0 0.5rem 0;">${villa.name}</h3>
        <p style="font-size:0.95rem;color:#4b5563;margin-bottom:0.75rem;"><strong>Location:</strong> ${villa.location} · <strong>Capacity:</strong> ${villa.max_guests} guests</p>
        <p style="font-size:0.95rem;color:#4b5563;line-height:1.5;margin-bottom:1rem;flex:1;">${villa.description}</p>
        <p style="font-size:0.875rem;color:#6b7280;margin-bottom:1rem;"><strong>Amenities:</strong> ${villa.amenities.join(' · ')}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #f3f4f6;padding-top:1rem;">
          <span style="font-size:1.25rem;font-weight:bold;color:#111827;">₹${villa.price_per_night.toLocaleString('en-IN')}<span style="font-size:0.875rem;font-weight:normal;color:#6b7280;"> / night</span></span>
          <a href="/villas/${villa.id}" style="color:#ff385c;font-weight:600;text-decoration:none;">View Villa Details →</a>
        </div>
      </div>
    </article>
  `;
}

const routes = [
  {
    path: '/',
    outputPath: 'index.html',
    title: 'Lonavala Stays — Curated Luxury Villas for Rent in Lonavala',
    description: 'Book curated private luxury villas across Lonavala with private pools, scenic decks, and mountain views. Best rate guarantee with 24x7 local on-ground support.', // 159 chars
    canonical: `${BASE_URL}/`,
    image: DEFAULT_OG_IMAGE,
    schema: lodgingBusinessSchema,
    content: `
      ${commonHeaderHtml}
      <main style="max-width:1200px;margin:0 auto;padding:2rem 1.5rem;">
        <section style="text-align:center;padding:3rem 1rem 2rem 1rem;">
          <h1 style="font-size:2.75rem;font-weight:bold;color:#111827;margin-bottom:1rem;line-height:1.2;">Curated Luxury Villas for Rent in Lonavala</h1>
          <p style="font-size:1.35rem;color:#4b5563;max-width:800px;margin:0 auto 1.5rem auto;line-height:1.6;">
            Escape into the Sahyadri hills. Book standalone luxury villas with private pools, misty valley views, landscaped gardens, and dedicated on-ground hospitality across Lonavala, Maharashtra.
          </p>
          <div style="margin-top:1.5rem;">
            <a href="/villas" style="background:#ff385c;color:#fff;padding:0.75rem 2rem;border-radius:9999px;font-size:1.1rem;font-weight:600;text-decoration:none;display:inline-block;">Explore All Villas</a>
          </div>
        </section>

        <section style="margin-top:3rem;">
          <h2 style="font-size:2rem;font-weight:bold;color:#111827;margin-bottom:1.5rem;text-align:center;">Featured Villas in Our Collection</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem;">
            ${villas.map(renderVillaCard).join('')}
          </div>
        </section>

        <section style="margin-top:4rem;background:#fff;border:1px solid #e5e7eb;border-radius:1rem;padding:2.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <h2 style="font-size:1.75rem;font-weight:bold;color:#111827;margin-bottom:1rem;">Why Guests Choose Lonavala Stays</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;">
            <div>
              <h3 style="font-size:1.15rem;font-weight:bold;color:#ff385c;margin-bottom:0.5rem;">Handpicked Hill Properties</h3>
              <p style="color:#4b5563;line-height:1.5;">Every villa is inspected for hygiene, hillside views, pool safety, and comfort so your group enjoys complete privacy.</p>
            </div>
            <div>
              <h3 style="font-size:1.15rem;font-weight:bold;color:#ff385c;margin-bottom:0.5rem;">Transparent Pricing</h3>
              <p style="color:#4b5563;line-height:1.5;">Direct rates with clear weekend pricing and no hidden check-in surprises. 40% advance booking confirmation.</p>
            </div>
            <div>
              <h3 style="font-size:1.15rem;font-weight:bold;color:#ff385c;margin-bottom:0.5rem;">24×7 Local On-Ground Team</h3>
              <p style="color:#4b5563;line-height:1.5;">Our local team lives in Lonavala to coordinate housekeeping, caretaker assistance, meals, and check-in support.</p>
            </div>
          </div>
        </section>
      </main>
      ${commonFooterHtml}
    `,
  },
  {
    path: '/villas',
    outputPath: 'villas/index.html',
    title: 'Private Villas for Rent in Lonavala | Lonavala Stays',
    description: 'Explore our collection of private hill villas in Lonavala. Compare Valley View, Garden Wing, Hillside Premium & Garden Cottage for your weekend getaway.', // 156 chars
    canonical: `${BASE_URL}/villas`,
    image: DEFAULT_OG_IMAGE,
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: villas.map((v, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${BASE_URL}/villas/${v.id}`,
        name: v.name,
      })),
    },
    content: `
      ${commonHeaderHtml}
      <main style="max-width:1200px;margin:0 auto;padding:2rem 1.5rem;">
        <section style="padding:2rem 0;border-bottom:1px solid #e5e7eb;margin-bottom:2rem;">
          <h1 style="font-size:2.5rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;">Private Villas for Rent in Lonavala</h1>
          <p style="font-size:1.25rem;color:#4b5563;max-width:850px;line-height:1.6;">
            Curated luxury villas across Lonavala. Each listing is a standalone private property—compare locations, capacities, nightly rates, and hillside amenities to find your perfect stay.
          </p>
        </section>

        <section>
          <h2 style="font-size:1.5rem;font-weight:bold;color:#111827;margin-bottom:1.5rem;">Available Villa Listings</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:2rem;">
            ${villas.map(renderVillaCard).join('')}
          </div>
        </section>
      </main>
      ${commonFooterHtml}
    `,
  },
  ...villas.map((villa) => {
    const villaDescriptions = {
      '1': 'Stay at Valley View Villa in Tiger Valley, Lonavala. Standalone hill villa with misty Sahyadri views, private deck, AC, Wi-Fi, and breakfast for up to 3 guests.', // 157 chars
      '2': 'Rent Garden Wing Villa in Tungarli, Lonavala. Spacious family villa with landscaped gardens, living area, BBQ patio, AC, and Wi-Fi for up to 5 guests.', // 151 chars
      '3': 'Rent Hillside Premium Villa in Khandala Hills, Lonavala. Flagship luxury villa with panoramic hill views, private pool, king bed, and AC for up to 4 guests.', // 157 chars
      '4': 'Book Garden Cottage Villa in Kurvande, Lonavala. Intimate hill cottage in greenery with private entry, garden patio, AC, and breakfast for up to 2 guests.', // 154 chars
    };
    const desc = villaDescriptions[villa.id] || `Book ${villa.name} in ${villa.location}. Standalone villa with private amenities, AC, Wi-Fi, and scenic hill views for ${villa.max_guests} guests.`;
    return {
      path: `/villas/${villa.id}`,
      outputPath: `villas/${villa.id}/index.html`,
      title: `${villa.name} — ${villa.room_type} Rental in Lonavala | Lonavala Stays`,
      description: desc,
      canonical: `${BASE_URL}/villas/${villa.id}`,
      image: villa.images[0],
      schema: getVillaSchema(villa),
      content: `
      ${commonHeaderHtml}
      <main style="max-width:1120px;margin:0 auto;padding:2rem 1.5rem;">
        <nav style="margin-bottom:1.5rem;">
          <a href="/villas" style="color:#ff385c;font-weight:600;text-decoration:none;">← Back to all villas</a>
        </nav>
        <section style="margin-bottom:2rem;">
          <span style="font-size:0.875rem;text-transform:uppercase;color:#ff385c;font-weight:700;">${villa.room_type} · ${villa.location}</span>
          <h1 style="font-size:2.5rem;font-weight:bold;color:#111827;margin:0.5rem 0 1rem 0;line-height:1.2;">${villa.name} – ${villa.room_type}</h1>
          <p style="font-size:1.1rem;color:#4b5563;"><strong>Address:</strong> ${villa.address}</p>
        </section>

        <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;margin-bottom:2.5rem;">
          ${villa.images
            .map(
              (img, i) =>
                `<img src="${img}" alt="${villa.name} interior and exterior view ${i + 1}" width="800" height="600" loading="${i === 0 ? 'eager' : 'lazy'}" style="width:100%;height:18rem;object-fit:cover;border-radius:0.75rem;" />`
            )
            .join('')}
        </section>

        <section style="display:grid;grid-template-columns:2fr 1fr;gap:2.5rem;margin-bottom:3rem;">
          <div>
            <h2 style="font-size:1.75rem;font-weight:bold;color:#111827;margin-bottom:1rem;">About this villa</h2>
            <p style="font-size:1.15rem;color:#374151;line-height:1.7;margin-bottom:1.5rem;">${villa.description}</p>
            
            <h3 style="font-size:1.35rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;">Key Details &amp; Capacity</h3>
            <ul style="line-height:1.8;color:#4b5563;margin-bottom:1.5rem;padding-left:1.25rem;">
              <li><strong>Guests Included:</strong> Up to ${villa.max_guests} guests</li>
              <li><strong>Property Reference:</strong> ${villa.room_number}</li>
              <li><strong>Check-in:</strong> 1:00 PM onwards</li>
              <li><strong>Check-out:</strong> 11:00 AM sharp</li>
              <li><strong>Neighbourhood:</strong> ${villa.location}</li>
            </ul>

            <h3 style="font-size:1.35rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;">Amenities</h3>
            <div style="display:flex;flex-wrap:wrap;gap:0.5rem;margin-bottom:2rem;">
              ${villa.amenities
                .map(
                  (a) =>
                    `<span style="background:#f3f4f6;color:#374151;padding:0.4rem 0.85rem;border-radius:9999px;font-size:0.95rem;font-weight:500;">${a}</span>`
                )
                .join('')}
            </div>
          </div>

          <aside style="background:#fff;border:1px solid #e5e7eb;border-radius:1rem;padding:1.75rem;box-shadow:0 4px 6px rgba(0,0,0,0.05);height:fit-content;">
            <div style="font-size:1.75rem;font-weight:bold;color:#111827;margin-bottom:0.25rem;">₹${villa.price_per_night.toLocaleString('en-IN')}<span style="font-size:1rem;font-weight:normal;color:#6b7280;"> / night</span></div>
            <p style="font-size:0.875rem;color:#6b7280;margin-bottom:1.5rem;">Weekend rate: ₹${(villa.weekend_price_per_night || villa.price_per_night).toLocaleString('en-IN')} / night</p>
            <p style="font-size:0.95rem;color:#374151;margin-bottom:1rem;">To reserve dates, contact our reservations desk directly or proceed through our interactive booking system:</p>
            <a href="tel:${RESORT_PHONE.replace(/\\s/g, '')}" style="display:block;text-align:center;background:#ff385c;color:#fff;padding:0.75rem 1rem;border-radius:0.5rem;font-weight:600;text-decoration:none;margin-bottom:0.75rem;">Call ${RESORT_PHONE}</a>
            <a href="https://wa.me/919876543210?text=Hi%2C%20I%20am%20interested%20in%20booking%20${encodeURIComponent(villa.name)}" style="display:block;text-align:center;background:#25d366;color:#fff;padding:0.75rem 1rem;border-radius:0.5rem;font-weight:600;text-decoration:none;">WhatsApp Us</a>
          </aside>
        </section>
      </main>
      ${commonFooterHtml}
    `,
    };
  }),
  {
    path: '/facilities',
    outputPath: 'facilities/index.html',
    title: 'Villa Amenities & Facilities in Lonavala | Lonavala Stays',
    description: 'Discover amenities across our Lonavala villas: private swimming pool, carrom, badminton setup, BBQ grill, portable Bluetooth speaker, and high-speed Wi-Fi.', // 159 chars
    canonical: `${BASE_URL}/facilities`,
    image: DEFAULT_OG_IMAGE,
    schema: lodgingBusinessSchema,
    content: `
      ${commonHeaderHtml}
      <main style="max-width:1200px;margin:0 auto;padding:2rem 1.5rem;">
        <section style="padding:2rem 0;border-bottom:1px solid #e5e7eb;margin-bottom:2rem;">
          <h1 style="font-size:2.5rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;">Our Facilities &amp; Amenities</h1>
          <p style="font-size:1.25rem;color:#4b5563;max-width:850px;line-height:1.6;">
            Games, pool, kitchen essentials, entertainment, and on-site support—amenities available across our villas for your holiday stay in Lonavala.
          </p>
        </section>

        <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:2rem;">
          ${facilities
            .map(
              (f) => `
            <article style="background:#fff;border:1px solid #e5e7eb;border-radius:0.75rem;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
              <img src="${f.image}" alt="${f.name} available at Lonavala Stays villas" width="800" height="500" loading="lazy" style="width:100%;height:14rem;object-fit:cover;" />
              <div style="padding:1.5rem;">
                <h2 style="font-size:1.35rem;font-weight:bold;color:#111827;margin-bottom:0.5rem;">${f.name}</h2>
                <p style="color:#4b5563;line-height:1.5;margin-bottom:1rem;">${f.description}</p>
                <p style="font-size:0.875rem;font-weight:600;color:#ff385c;">${f.hours}</p>
              </div>
            </article>
          `
            )
            .join('')}
        </section>
      </main>
      ${commonFooterHtml}
    `,
  },
  {
    path: '/about',
    outputPath: 'about/index.html',
    title: 'About Us — Handpicked Hill Escapes | Lonavala Stays',
    description: 'Learn about Lonavala Stays. We curate, operate, and manage standalone luxury villas across Lonavala, Maharashtra with dedicated local on-ground guest care.', // 158 chars
    canonical: `${BASE_URL}/about`,
    image: DEFAULT_OG_IMAGE,
    schema: lodgingBusinessSchema,
    content: `
      ${commonHeaderHtml}
      <main style="max-width:1200px;margin:0 auto;padding:2rem 1.5rem;">
        <section style="padding:2rem 0;border-bottom:1px solid #e5e7eb;margin-bottom:2rem;">
          <h1 style="font-size:2.5rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;">About Lonavala Stays</h1>
          <p style="font-size:1.25rem;color:#4b5563;max-width:850px;line-height:1.6;">
            Many villas. One team. Handpicked hill escapes across Lonavala, Maharashtra.
          </p>
        </section>

        <section style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;margin-bottom:3rem;">
          <div>
            <h2 style="font-size:1.75rem;font-weight:bold;color:#111827;margin-bottom:1rem;">Curated Luxury Villa Hospitality</h2>
            <p style="font-size:1.15rem;color:#374151;line-height:1.7;margin-bottom:1rem;">
              Lonavala Stays curates luxury villas across Lonavala. We are not a single hotel—we curate, operate, and book multiple private villas across Lonavala, Maharashtra, each managed as its own property.
            </p>
            <p style="font-size:1.15rem;color:#374151;line-height:1.7;margin-bottom:1rem;">
              Whether you need one villa for a weekend or want to understand how we manage an entire portfolio, our team handles reservations, housekeeping, and guest care villa by villa.
            </p>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=600&fit=crop" alt="Luxury private villa setting in Lonavala hills" width="900" height="600" loading="lazy" style="width:100%;height:auto;border-radius:1rem;box-shadow:0 4px 6px rgba(0,0,0,0.1);" />
          </div>
        </section>

        <section style="background:#f9fafb;border-radius:1rem;padding:2.5rem;margin-bottom:3rem;">
          <h2 style="font-size:1.75rem;font-weight:bold;color:#111827;margin-bottom:1.5rem;text-align:center;">What Makes Us Different</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;">
            <div style="background:#fff;padding:1.5rem;border-radius:0.75rem;border:1px solid #e5e7eb;">
              <h3 style="font-size:1.25rem;font-weight:bold;color:#ff385c;margin-bottom:0.5rem;">Multiple Villas, One Brand</h3>
              <p style="color:#4b5563;line-height:1.6;">We manage a portfolio of standalone villas—each with its own address, style, and amenities—under trusted Lonavala hospitality.</p>
            </div>
            <div style="background:#fff;padding:1.5rem;border-radius:0.75rem;border:1px solid #e5e7eb;">
              <h3 style="font-size:1.25rem;font-weight:bold;color:#ff385c;margin-bottom:0.5rem;">Locally Rooted Team</h3>
              <p style="color:#4b5563;line-height:1.6;">Our on-ground team lives in Lonavala. We match you to the right villa and share the best trails, views, and seasonal tips.</p>
            </div>
            <div style="background:#fff;padding:1.5rem;border-radius:0.75rem;border:1px solid #e5e7eb;">
              <h3 style="font-size:1.25rem;font-weight:bold;color:#ff385c;margin-bottom:0.5rem;">End-to-End Management</h3>
              <p style="color:#4b5563;line-height:1.6;">From booking and housekeeping to maintenance and guest support, we run every villa so guests enjoy a seamless stay.</p>
            </div>
          </div>
        </section>
      </main>
      ${commonFooterHtml}
    `,
  },
  {
    path: '/contact',
    outputPath: 'contact/index.html',
    title: 'Contact Us — Villa Reservations & Enquiries | Lonavala Stays',
    description: 'Contact Lonavala Stays for villa bookings and enquiries in Lonavala. Reach our reservations team via phone, WhatsApp at +91 98765 43210, or send an email.', // 157 chars
    canonical: `${BASE_URL}/contact`,
    image: DEFAULT_OG_IMAGE,
    schema: lodgingBusinessSchema,
    content: `
      ${commonHeaderHtml}
      <main style="max-width:1200px;margin:0 auto;padding:2rem 1.5rem;">
        <section style="padding:2rem 0;border-bottom:1px solid #e5e7eb;margin-bottom:2rem;">
          <h1 style="font-size:2.5rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;">Contact Lonavala Stays</h1>
          <p style="font-size:1.25rem;color:#4b5563;max-width:850px;line-height:1.6;">
            Questions about a villa stay, availability, directions, or custom booking requests? Our team manages every property in our collection.
          </p>
        </section>

        <section style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;margin-bottom:3rem;">
          <div>
            <h2 style="font-size:1.75rem;font-weight:bold;color:#111827;margin-bottom:1.5rem;">Get in Touch</h2>
            <div style="margin-bottom:1.5rem;">
              <h3 style="font-size:1.1rem;font-weight:bold;color:#111827;margin-bottom:0.25rem;">Reservations &amp; Management Office</h3>
              <p style="font-size:1.1rem;color:#4b5563;line-height:1.6;">${RESORT_ADDRESS}</p>
            </div>
            <div style="margin-bottom:1.5rem;">
              <h3 style="font-size:1.1rem;font-weight:bold;color:#111827;margin-bottom:0.25rem;">Phone &amp; WhatsApp</h3>
              <p style="font-size:1.1rem;color:#4b5563;"><a href="tel:${RESORT_PHONE.replace(/\\s/g, '')}" style="color:#ff385c;text-decoration:none;font-weight:600;">${RESORT_PHONE}</a></p>
            </div>
            <div style="margin-bottom:1.5rem;">
              <h3 style="font-size:1.1rem;font-weight:bold;color:#111827;margin-bottom:0.25rem;">Email Address</h3>
              <p style="font-size:1.1rem;color:#4b5563;"><a href="mailto:${RESORT_EMAIL}" style="color:#ff385c;text-decoration:none;font-weight:600;">${RESORT_EMAIL}</a></p>
            </div>
            <div style="margin-top:2rem;">
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop" alt="Scenic Lonavala hill range view near our villa properties" width="600" height="400" loading="lazy" style="width:100%;height:auto;border-radius:0.75rem;" />
            </div>
          </div>
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:1rem;padding:2rem;box-shadow:0 1px 3px rgba(0,0,0,0.05);height:fit-content;">
            <h2 style="font-size:1.5rem;font-weight:bold;color:#111827;margin-bottom:1rem;">Direct Reservation Desk</h2>
            <p style="color:#4b5563;line-height:1.6;margin-bottom:1.5rem;">
              Our on-ground team is available daily from 9:00 AM to 9:00 PM IST to assist with dates, villa tours, customized catering, and instant bookings.
            </p>
            <a href="https://wa.me/919876543210?text=Hi%2C%20I%20have%20an%20enquiry%20regarding%20Lonavala%20Stays" style="display:block;text-align:center;background:#25d366;color:#fff;padding:0.85rem 1.5rem;border-radius:0.5rem;font-weight:600;text-decoration:none;margin-bottom:1rem;">Chat with us on WhatsApp</a>
            <a href="tel:${RESORT_PHONE.replace(/\\s/g, '')}" style="display:block;text-align:center;background:#ff385c;color:#fff;padding:0.85rem 1.5rem;border-radius:0.5rem;font-weight:600;text-decoration:none;">Call Reservations: ${RESORT_PHONE}</a>
          </div>
        </section>
      </main>
      ${commonFooterHtml}
    `,
  },
  {
    path: '/terms',
    outputPath: 'terms/index.html',
    title: 'Terms & Conditions | Lonavala Stays',
    description: 'Read booking terms, payment policies, cancellation guidelines, safety rules, and local regulations for staying at private villas managed by Lonavala Stays.', // 159 chars
    canonical: `${BASE_URL}/terms`,
    image: DEFAULT_OG_IMAGE,
    schema: lodgingBusinessSchema,
    content: `
      ${commonHeaderHtml}
      <main style="max-width:960px;margin:0 auto;padding:2rem 1.5rem;">
        <h1 style="font-size:2.5rem;font-weight:bold;color:#111827;margin-bottom:1rem;">Terms &amp; Conditions</h1>
        <p style="font-size:1.1rem;color:#4b5563;line-height:1.6;margin-bottom:2rem;">
          Please read these terms before booking a stay with ${RESORT_NAME}. For questions, contact us at <a href="mailto:${RESORT_EMAIL}" style="color:#ff385c;text-decoration:none;">${RESORT_EMAIL}</a>.
        </p>

        <section style="margin-bottom:2rem;">
          <h2 style="font-size:1.5rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;">1. Payments &amp; Deposits</h2>
          <ul style="line-height:1.8;color:#4b5563;padding-left:1.25rem;">
            <li>40% of the total booking amount is collected online at checkout; the balance is due at check-in.</li>
            <li>Any deductions for damages or policy violations will be communicated with supporting details.</li>
          </ul>
        </section>

        <section style="margin-bottom:2rem;">
          <h2 style="font-size:1.5rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;">2. Cancellation &amp; Changes</h2>
          <ul style="line-height:1.8;color:#4b5563;padding-left:1.25rem;">
            <li>Cancellation and rescheduling terms depend on your booking date and villa. Refer to your confirmation email for the applicable policy.</li>
            <li>For date changes, contact us as early as possible—peak weekends and holidays may have stricter terms.</li>
          </ul>
        </section>

        <section style="margin-bottom:2rem;">
          <h2 style="font-size:1.5rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;">3. Safety &amp; Emergencies</h2>
          <ul style="line-height:1.8;color:#4b5563;padding-left:1.25rem;">
            <li>Lonavala weather can change quickly—carry warm layers in monsoon and winter months.</li>
            <li>In case of emergency, contact our team immediately using the phone number on your booking confirmation.</li>
            <li>Swimming pools, bonfires, and hillside paths involve inherent risks—follow on-site instructions and supervise children.</li>
          </ul>
        </section>

        <section style="margin-bottom:2rem;">
          <h2 style="font-size:1.5rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;">4. Local Guidelines</h2>
          <ul style="line-height:1.8;color:#4b5563;padding-left:1.25rem;">
            <li>Alcohol consumption must comply with local laws. Guests are responsible for their own conduct.</li>
            <li>Pets are welcome only at villas explicitly marked as pet-friendly—confirm before you book.</li>
            <li>Parking is limited at some properties; inform us in advance if you are bringing multiple vehicles.</li>
          </ul>
        </section>
      </main>
      ${commonFooterHtml}
    `,
  },
  {
    path: '/house-rules',
    outputPath: 'house-rules/index.html',
    title: 'House Rules & Guest Policies | Lonavala Stays',
    description: 'Review house rules for Lonavala Stays: standard check-in at 1:00 PM, check-out by 11:00 AM, occupancy limits, quiet hours, and property care guidelines.', // 156 chars
    canonical: `${BASE_URL}/house-rules`,
    image: DEFAULT_OG_IMAGE,
    schema: lodgingBusinessSchema,
    content: `
      ${commonHeaderHtml}
      <main style="max-width:960px;margin:0 auto;padding:2rem 1.5rem;">
        <h1 style="font-size:2.5rem;font-weight:bold;color:#111827;margin-bottom:1rem;">House Rules &amp; Policies</h1>
        <p style="font-size:1.1rem;color:#4b5563;line-height:1.6;margin-bottom:2rem;">
          These rules apply to all villas managed by ${RESORT_NAME}. Individual properties may have additional guidelines noted on your booking confirmation.
        </p>

        <section style="margin-bottom:2rem;">
          <h2 style="font-size:1.5rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;">Check-in &amp; Check-out</h2>
          <ul style="line-height:1.8;color:#4b5563;padding-left:1.25rem;">
            <li>Standard check-in is from 1:00 PM onwards and check-out is by 11:00 AM sharp.</li>
            <li>Early check-in or late check-out may be available on request, subject to availability.</li>
            <li>A valid government-issued photo ID is required for all guests at check-in.</li>
          </ul>
        </section>

        <section style="margin-bottom:2rem;">
          <h2 style="font-size:1.5rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;">Guests &amp; Occupancy</h2>
          <ul style="line-height:1.8;color:#4b5563;padding-left:1.25rem;">
            <li>Only registered guests may stay overnight. Day visitors must be approved in advance.</li>
            <li>Maximum occupancy must not exceed the limit shown on your villa listing.</li>
            <li>Additional guests or events require prior written approval from our team.</li>
          </ul>
        </section>

        <section style="margin-bottom:2rem;">
          <h2 style="font-size:1.5rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;">Conduct &amp; Noise</h2>
          <ul style="line-height:1.8;color:#4b5563;padding-left:1.25rem;">
            <li>Parties, loud music, and commercial photography are not permitted unless pre-approved.</li>
            <li>Quiet hours are from 10:00 PM to 8:00 AM. Please respect neighbours and villa staff.</li>
            <li>Smoking is not allowed inside villas. Use designated outdoor areas only where provided.</li>
          </ul>
        </section>

        <section style="margin-bottom:2rem;">
          <h2 style="font-size:1.5rem;font-weight:bold;color:#111827;margin-bottom:0.75rem;">Property Care</h2>
          <ul style="line-height:1.8;color:#4b5563;padding-left:1.25rem;">
            <li>Treat the villa, furniture, and amenities with care. Guests are responsible for damage caused during the stay.</li>
            <li>Do not move heavy furniture or reconfigure safety equipment without staff assistance.</li>
            <li>Report maintenance issues promptly so our on-ground team can assist.</li>
          </ul>
        </section>
      </main>
      ${commonFooterHtml}
    `,
  },
];

function buildHeadTags(route) {
  const schemaJson = JSON.stringify(route.schema, null, 2);
  return `
    <title>${route.title}</title>
    <meta name="description" content="${route.description}" />
    <link rel="canonical" href="${route.canonical}" />
    <meta name="robots" content="index, follow" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${RESORT_NAME}" />
    <meta property="og:url" content="${route.canonical}" />
    <meta property="og:title" content="${route.title}" />
    <meta property="og:description" content="${route.description}" />
    <meta property="og:image" content="${route.image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${route.canonical}" />
    <meta name="twitter:title" content="${route.title}" />
    <meta name="twitter:description" content="${route.description}" />
    <meta name="twitter:image" content="${route.image}" />

    <!-- Structured Data (JSON-LD) -->
    <script type="application/ld+json">
${schemaJson}
    </script>
  `;
}

export function runPrerender() {
  const publicDir = path.resolve(__dirname, '../public');
  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('Error: dist/index.html does not exist. Run vite build first.');
    process.exit(1);
  }

  // Ensure public files exist in dist
  const copyFiles = [
    { src: path.join(publicDir, 'robots.txt'), dest: path.join(distDir, 'robots.txt') },
    { src: path.join(publicDir, 'sitemap.xml'), dest: path.join(distDir, 'sitemap.xml') },
    { src: path.join(publicDir, 'brand/og-image.jpg'), dest: path.join(distDir, 'brand/og-image.jpg') },
  ];

  for (const { src, dest } of copyFiles) {
    if (fs.existsSync(src)) {
      const destDirName = path.dirname(dest);
      if (!fs.existsSync(destDirName)) {
        fs.mkdirSync(destDirName, { recursive: true });
      }
      fs.copyFileSync(src, dest);
    }
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf8');

  // Strip existing title or description if any
  const cleanBaseHtml = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s+name=["']description["'][\s\S]*?>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][\s\S]*?>/gi, '')
    .replace(/<meta\s+name=["']robots["'][\s\S]*?>/gi, '')
    .replace(/<meta\s+property=["']og:[^"']*?["'][\s\S]*?>/gi, '')
    .replace(/<meta\s+name=["']twitter:[^"']*?["'][\s\S]*?>/gi, '')
    .replace(/<script\s+type=["']application\/ld\+json["']>[\s\S]*?<\/script>/gi, '')
    .replace(/<!--\s*(?:Open Graph|Twitter|Structured Data)[^>]*?-->/gi, '')
    .replace(/^\s*[\r\n]/gm, '');

  // Cleanly empty the root div if it already had contents
  let resetBaseHtml = cleanBaseHtml;
  const rootOpenIdx = resetBaseHtml.indexOf('<div id="root">');
  const rootCloseIdx = resetBaseHtml.lastIndexOf('</div>');
  if (rootOpenIdx !== -1 && rootCloseIdx !== -1 && rootCloseIdx >= rootOpenIdx) {
    resetBaseHtml =
      resetBaseHtml.slice(0, rootOpenIdx) +
      '<div id="root"></div>' +
      resetBaseHtml.slice(rootCloseIdx + 6);
  }

  for (const route of routes) {
    const headInjection = buildHeadTags(route);
    
    // Inject custom head tags right before </head>
    let pageHtml = resetBaseHtml.replace('</head>', `${headInjection}\n  </head>`);

    // Inject prerendered semantic body inside <div id="root"></div>
    pageHtml = pageHtml.replace(
      '<div id="root"></div>',
      `<div id="root">${route.content}</div>`
    );

    const outFilePath = path.join(distDir, route.outputPath);
    const outDir = path.dirname(outFilePath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(outFilePath, pageHtml, 'utf8');
    console.log(`Pre-rendered: ${route.path} -> ${route.outputPath} (${route.description.length} chars description)`);
  }

  console.log(`Successfully pre-rendered ${routes.length} routes with full metadata, structured data, and non-JS HTML!`);
}

// Run if called directly via node scripts/prerender.js
if (process.argv[1] && process.argv[1].endsWith('prerender.js')) {
  runPrerender();
}

