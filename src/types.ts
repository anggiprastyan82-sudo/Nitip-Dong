export interface DbUser {
  id: string;
  role: 'customer' | 'driver' | 'admin';
  name: string;
  phone: string;
  avatar: string;
  rating: number;
  email?: string;
}

export interface DbDriver {
  id: string; // matches users.id or standalone
  user_id: string;
  online_status: 'online' | 'offline';
  latitude: number;
  longitude: number;
  // Extra fields for rich simulation
  name?: string;
  phone?: string;
  avatar?: string;
  rating?: number;
  status?: string; // e.g. "free", "working", "suspended"
}

export interface DbChat {
  id: string;
  customer_id: string;
  driver_id: string;
  // helper properties for UI
  customer_name?: string;
  driver_name?: string;
  last_message_text?: string;
  last_message_time?: string;
}

export interface DbMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  message: string;
  image_url: string | null;
  latitude?: number | null; // support location messages
  longitude?: number | null; // support location messages
  created_at: string;
  is_read?: boolean;
}

export type OrderStatus =
  | 'Menunggu Pembayaran'
  | 'Menunggu Verifikasi'
  | 'Sedang Belanja'
  | 'Dalam Perjalanan'
  | 'Selesai'
  | 'Dibatalkan';

export interface DbOrder {
  id: string;
  customer_id: string;
  driver_id: string;
  item_description: string;
  food_price: number;
  delivery_fee: number;
  total_price: number;
  payment_proof: string | null;
  status: OrderStatus;
  created_at: string;
  // Helpers
  customer_name?: string;
  driver_name?: string;
}

export interface DbPayment {
  id: string;
  order_id: string;
  payment_proof: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

// Global Application State for Frontend
export interface AppState {
  users: DbUser[];
  drivers: DbDriver[];
  chats: DbChat[];
  messages: DbMessage[];
  orders: DbOrder[];
  payments: DbPayment[];
}
