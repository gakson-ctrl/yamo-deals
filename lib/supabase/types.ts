/**
 * lib/supabase/types.ts
 * Hand-written Database type until `supabase gen types typescript` is run.
 * Replace with the generated output after `supabase db push`.
 */

export interface SavedAddress {
  id: string;
  street: string;
  district: string;
  instructions?: string;
  is_default: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export type UserRole = 'customer' | 'merchant';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone: string;
          display_name: string;
          role: UserRole;
          avatar_url: string | null;
          locale: 'fr' | 'en';
          saved_addresses: SavedAddress[];
          created_at: string;
        };
        Insert: {
          id: string;
          phone: string;
          display_name: string;
          role?: UserRole;
          avatar_url?: string | null;
          locale?: 'fr' | 'en';
          saved_addresses?: SavedAddress[];
        };
        Update: {
          phone?: string;
          display_name?: string;
          role?: UserRole;
          avatar_url?: string | null;
          locale?: 'fr' | 'en';
          saved_addresses?: SavedAddress[];
        };
        Relationships: [];
      };
      restaurants: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          cover_url: string | null;
          logo_url: string | null;
          categories: string[];
          address: string;
          latitude: number | null;
          longitude: number | null;
          delivery_fee: number;
          min_order: number;
          avg_prep_time: number;
          is_open: boolean;
          rating: number | null;
          rating_count: number | null;
          created_at: string;
        };
        Insert: {
          owner_id: string;
          name: string;
          description?: string | null;
          cover_url?: string | null;
          logo_url?: string | null;
          categories?: string[];
          address: string;
          latitude?: number | null;
          longitude?: number | null;
          delivery_fee?: number;
          min_order?: number;
          avg_prep_time?: number;
          is_open?: boolean;
          rating?: number | null;
          rating_count?: number | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          cover_url?: string | null;
          logo_url?: string | null;
          categories?: string[];
          address?: string;
          latitude?: number | null;
          longitude?: number | null;
          delivery_fee?: number;
          min_order?: number;
          avg_prep_time?: number;
          is_open?: boolean;
          rating?: number | null;
          rating_count?: number | null;
        };
        Relationships: [];
      };
      menu_categories: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          display_order: number;
        };
        Insert: { restaurant_id: string; name: string; display_order?: number };
        Update: { name?: string; display_order?: number };
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string;
          restaurant_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          is_available: boolean;
          created_at: string;
        };
        Insert: {
          restaurant_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          is_available?: boolean;
        };
        Update: {
          category_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          is_available?: boolean;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          restaurant_id: string;
          status: OrderStatus;
          total_amount: number;
          delivery_fee: number;
          delivery_address: string;
          note_to_kitchen: string | null;
          promo_code: string | null;
          payment_method: 'cash';
          prep_time_min: number | null;
          created_at: string;
          accepted_at: string | null;
          ready_at: string | null;
          delivered_at: string | null;
        };
        Insert: {
          customer_id: string;
          restaurant_id: string;
          status?: OrderStatus;
          total_amount: number;
          delivery_fee: number;
          delivery_address: string;
          note_to_kitchen?: string | null;
          promo_code?: string | null;
          payment_method?: 'cash';
          prep_time_min?: number | null;
          accepted_at?: string | null;
          ready_at?: string | null;
          delivered_at?: string | null;
        };
        Update: {
          status?: OrderStatus;
          prep_time_min?: number | null;
          accepted_at?: string | null;
          ready_at?: string | null;
          delivered_at?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          menu_item_id: string | null;
          name: string;
          unit_price: number;
          quantity: number;
        };
        Insert: {
          order_id: string;
          menu_item_id?: string | null;
          name: string;
          unit_price: number;
          quantity?: number;
        };
        Update: { quantity?: number };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          customer_id: string;
          restaurant_id: string;
          order_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          customer_id: string;
          restaurant_id: string;
          order_id: string;
          rating: number;
          comment?: string | null;
        };
        Update: { rating?: number; comment?: string | null };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
    Functions: {
      place_order: {
        Args: {
          p_customer_id: string;
          p_restaurant_id: string;
          p_items: Array<{ menu_item_id: string; quantity: number }>;
          p_delivery_address: string;
          p_note?: string;
          p_promo_code?: string;
        };
        Returns: { order_id: string; total_amount: number };
      };
      accept_order: {
        Args: {
          p_order_id: string;
          p_merchant_id: string;
          p_prep_time_min: number;
        };
        Returns: boolean;
      };
      update_order_status: {
        Args: {
          p_order_id: string;
          p_merchant_id: string;
          p_new_status: OrderStatus;
        };
        Returns: boolean;
      };
      cancel_order: {
        Args: {
          p_order_id: string;
          p_actor_id: string;
        };
        Returns: boolean;
      };
      toggle_restaurant_status: {
        Args: {
          p_restaurant_id: string;
          p_owner_id: string;
          p_is_open: boolean;
        };
        Returns: boolean;
      };
      insert_menu_item: {
        Args: {
          p_restaurant_id: string;
          p_owner_id: string;
          p_category_id: string | null;
          p_name: string;
          p_description?: string | null;
          p_price: number;
          p_image_url?: string | null;
          p_is_available?: boolean;
        };
        Returns: string;
      };
      update_menu_item: {
        Args: {
          p_item_id: string;
          p_owner_id: string;
          p_name: string;
          p_description?: string | null;
          p_price: number;
          p_image_url?: string | null;
          p_is_available?: boolean;
          p_category_id?: string | null;
        };
        Returns: boolean;
      };
      delete_menu_item: {
        Args: { p_item_id: string; p_owner_id: string };
        Returns: boolean;
      };
      insert_menu_category: {
        Args: { p_restaurant_id: string; p_owner_id: string; p_name: string };
        Returns: string;
      };
      insert_review: {
        Args: {
          p_order_id: string;
          p_customer_id: string;
          p_restaurant_id: string;
          p_rating: number;
          p_comment?: string | null;
        };
        Returns: string;
      };
    };
  };
}
