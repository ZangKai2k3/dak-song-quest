export type QuizCategory =
  | "Thiên nhiên"
  | "Văn hóa M’Nông"
  | "Ẩm thực"
  | "Hidden Gems"
  | "Tổng hợp";

export type VoucherTier = "Silver" | "Gold" | "Diamond" | "Special";

export type WeatherType = "sunny" | "rainy" | "cloudy";

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  locationId?: string;
}

export interface Voucher {
  id: string;
  code: string;
  tier: VoucherTier;
  title: string;
  discount: string;
  expiresAt: string;
  condition: string;
  // Thông tin địa điểm đơn lẻ duy nhất (mỗi voucher chỉ gắn với 1 quán/khách sạn)
  placeName: string;
  placeAddress: string;
  placePhone?: string;
  mapsUrl: string;
  mapsQuery: string;
  places?: string[];
  used: boolean;
  usedAt?: string;
}

export interface Place {
  id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  phone: string;
  openHours: string;
  ticketPrice: string;
  mapsUrl: string;
  lat: number;
  lng: number;
  weatherTip: string;
  highlight?: string;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  reward: string;
  completed: boolean;
}

export interface Weather {
  type: WeatherType;
  temperature: number;
  humidity: number;
  description: string;
  source: "dubaothoitiet" | "open-meteo" | "mock";
  apparentTemperature?: number;
  windSpeed?: number;
  precipitation?: number;
  elevation?: number;
  uvIndex?: number;
  dewPoint?: number;
  tempMax?: number;
  tempMin?: number;
  rainProbability?: number;
  locationName?: string;
  sourceUrl?: string;
  updatedAt?: string;
  isRealtime?: boolean;
}

export interface WeeklyAttempt {
  weekId: string;
  score: number;
  totalQuestions: number;
  timeMs: number;
  category: QuizCategory;
  completedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  zaloUserId?: string;
  score: number;
  totalQuestions: number;
  timeMs: number;
  badge?: string;
  attemptId?: number;
}

export interface OCOPProduct {
  id: number;
  name: string;
  origin: string;
  category: "Hạt tiêu" | "Cà phê" | "Hạt dinh dưỡng" | "Nông sản khô";
  price: number;
  unit: string;
  imageUrl: string;
  description: string;
  inStockQuantity: number;
  badge?: string;
}

export interface CartItem {
  product: OCOPProduct;
  quantity: number;
}

export interface ShippingAddress {
  customerName: string;
  phone: string;
  address: string;
  note?: string;
}

export interface PlacedOrder {
  orderId: number;
  orderCode: string;
  customerName: string;
  phone: string;
  shippingAddress: string;
  items: {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  voucherCodeApplied?: string;
  paymentMethod: "ZaloPay" | "COD";
  paymentStatus: "Paid" | "Pending" | "Unpaid" | "Refunded";
  orderStatus: "PendingConfirm" | "ReadyToShip" | "Shipping" | "Completed" | "Cancelled";
  note?: string;
  createdAt: string;
}