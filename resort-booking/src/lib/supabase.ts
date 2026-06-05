import { createClient } from '@supabase/supabase-js';

// Fallback values to prevent crashes during development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

// Only create real client if we have valid environment variables
export const isSupabaseConfigured =
  supabaseUrl !== 'https://demo.supabase.co' && supabaseAnonKey !== 'demo-key';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : {
      // Mock client for demo/development
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
        signUp: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
          limit: () => Promise.resolve({ data: [], error: null }),
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
      }),
    };

// Database schema types (simplified for demo)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'admin';
          phone: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          phone?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          phone?: string | null;
        };
      };
      room_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          base_price: number;
          max_guests: number;
          size_sqm: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          base_price: number;
          max_guests: number;
          size_sqm?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          base_price?: number;
          max_guests?: number;
          size_sqm?: number | null;
          created_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          room_type_id: string;
          room_number: string;
          floor: number;
          status: 'available' | 'occupied' | 'maintenance' | 'out_of_order';
          created_at: string;
          // Additional fields
          name: string;
          description: string;
          price_per_night: number;
          max_guests: number;
          images: string[];
          amenities: string[];
          location: string;
          rating: number;
          review_count: number;
        };
        Insert: {
          id?: string;
          room_type_id: string;
          room_number: string;
          floor: number;
          status?: 'available' | 'occupied' | 'maintenance' | 'out_of_order';
          created_at?: string;
          // Additional fields
          name: string;
          description: string;
          price_per_night: number;
          max_guests: number;
          images: string[];
          amenities: string[];
          location: string;
          rating: number;
          review_count: number;
        };
        Update: {
          id?: string;
          room_type_id?: string;
          room_number?: string;
          floor?: number;
          status?: 'available' | 'occupied' | 'maintenance' | 'out_of_order';
          created_at?: string;
          // Additional fields
          name?: string;
          description?: string;
          price_per_night?: number;
          max_guests?: number;
          images?: string[];
          amenities?: string[];
          location?: string;
          rating?: number;
          review_count?: number;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          room_id: string;
          check_in: string;
          check_out: string;
          guests: number;
          total_price: number;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          room_id: string;
          check_in: string;
          check_out: string;
          guests: number;
          total_price: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          room_id?: string;
          check_in?: string;
          check_out?: string;
          guests?: number;
          total_price?: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      facilities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          category: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          category: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          category?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          room_id: string;
          booking_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          room_id: string;
          booking_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          room_id?: string;
          booking_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          status: 'new' | 'read' | 'replied' | 'closed';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          status?: 'new' | 'read' | 'replied' | 'closed';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string;
          message?: string;
          status?: 'new' | 'read' | 'replied' | 'closed';
          created_at?: string;
        };
      };
    };
  };
};

// Type helpers
export type User = Database['public']['Tables']['users']['Row'];
export type Room = Database['public']['Tables']['rooms']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type Facility = Database['public']['Tables']['facilities']['Row'];

// Demo data for when Supabase is not configured
export const demoRooms: Room[] = [
  {
    id: '1',
    room_type_id: '1',
    room_number: '101',
    floor: 1,
    status: 'available',
    created_at: new Date().toISOString(),
    name: 'Ocean View Suite',
    description: 'Luxury suite with stunning ocean views, private balcony, and premium amenities.',
    price_per_night: 450,
    max_guests: 2,
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop'
    ],
    amenities: ['Ocean View', 'Private Balcony', 'King Bed', 'Mini Bar', 'WiFi', 'Room Service'],
    location: 'Beachfront',
    rating: 4.9,
    review_count: 127
  },
  {
    id: '2',
    room_type_id: '2',
    room_number: '201',
    floor: 2,
    status: 'available',
    created_at: new Date().toISOString(),
    name: 'Garden Villa',
    description: 'Spacious villa surrounded by tropical gardens with private pool access.',
    price_per_night: 320,
    max_guests: 4,
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop'
    ],
    amenities: ['Garden View', 'Pool Access', 'Two Bedrooms', 'Kitchen', 'WiFi', 'Parking'],
    location: 'Garden District',
    rating: 4.8,
    review_count: 89
  },
  {
    id: '3',
    room_type_id: '3',
    room_number: '301',
    floor: 3,
    status: 'available',
    created_at: new Date().toISOString(),
    name: 'Penthouse Deluxe',
    description: 'Ultimate luxury penthouse with panoramic views and exclusive amenities.',
    price_per_night: 850,
    max_guests: 6,
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop'
    ],
    amenities: ['Panoramic View', 'Private Terrace', 'Three Bedrooms', 'Full Kitchen', 'Jacuzzi', 'Concierge'],
    location: 'Top Floor',
    rating: 5.0,
    review_count: 45
  }
];

console.log('Supabase config status:', isSupabaseConfigured ? 'Live' : 'Demo mode'); 