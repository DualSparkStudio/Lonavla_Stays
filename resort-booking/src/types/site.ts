import type { Room } from '../data/resort';
import type { PropertyForSale } from '../data/propertiesForSale';

export type Facility = {
  id: string;
  name: string;
  description: string;
  image: string;
  hours: string;
};

export type ExploreTile = {
  name: string;
  path: string;
  image: string;
};

export type AboutHighlight = {
  title: string;
  text: string;
};

export type InfoSection = {
  title: string;
  items: string[];
};

export type SiteSettings = {
  resortName: string;
  brandTagline: string;
  resortLocation: string;
  resortAddress: string;
  resortPhone: string;
  resortEmail: string;
  /** Site-wide standard check-in time (24h, e.g. 14:00) */
  checkInTime: string;
  /** Site-wide standard check-out time (24h, e.g. 11:00) */
  checkOutTime: string;
  /** GST percentage applied to villa bookings */
  gstPercent: number;
  /** Per-night charge for each extra adult beyond the included guests */
  extraPersonCharge: number;
  heroTitle: string;
  heroSubtitle: string;
  aboutImage: string;
  aboutParagraphs: string[];
  aboutHighlights: AboutHighlight[];
  exploreTiles: ExploreTile[];
  villasPageTitle: string;
  villasPageSubtitle: string;
  facilitiesPageTitle: string;
  facilitiesPageSubtitle: string;
  forSalePageTitle: string;
  forSalePageSubtitle: string;
  contactPageSubtitle: string;
  houseRulesSections: InfoSection[];
  importantInfoSections: InfoSection[];
};

export type AdminBooking = {
  id: string;
  roomId: string;
  roomName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  bookingRef: string;
  bookedAt: string;
  nights?: number;
  basePrice?: number;
  extraAdults?: number;
  children?: number;
  extraAdultsCharge?: number;
  childrenCharge?: number;
  pricingSubtotal?: number;
  gst?: number;
  gstPercent?: number;
};

export type BlockedDate = {
  id: string;
  roomId: string;
  startDate: string;
  endDate: string;
  reason: string;
  notes?: string;
  source: 'manual';
  createdAt: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalBookings: number;
  totalSpent: number;
  status: 'active' | 'vip' | 'inactive';
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
};

export type SiteData = {
  settings: SiteSettings;
  rooms: Room[];
  propertiesForSale: PropertyForSale[];
  facilities: Facility[];
  bookings: AdminBooking[];
  blockedDates: BlockedDate[];
  users: AdminUser[];
  contactMessages: ContactMessage[];
};

export type { Room, PropertyForSale };
