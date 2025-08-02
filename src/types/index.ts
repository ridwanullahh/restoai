export interface Restaurant {
  id: string;
  uid: string;
  name: string;
  slug: string;
  ownerId: string;
  description?: string;
  cuisine?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  hours?: RestaurantHours;
  settings?: RestaurantSettings;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface RestaurantHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

export interface RestaurantSettings {
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
  features?: {
    onlineOrdering?: boolean;
    reservations?: boolean;
    loyalty?: boolean;
    reviews?: boolean;
  };
  notifications?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  featured?: boolean;
  allergens?: string[];
  nutritionalInfo?: NutritionalInfo;
  customizations?: MenuItemCustomization[];
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
}

export interface MenuItemCustomization {
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: CustomizationOption[];
}

export interface CustomizationOption {
  name: string;
  price: number;
}

export interface Menu {
  id: string;
  uid: string;
  restaurantId: string;
  name: string;
  description?: string;
  items: MenuItem[];
  active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  uid: string;
  restaurantId: string;
  customerId: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  tip?: number;
  deliveryFee?: number;
  total: number;
  status: OrderStatus;
  orderType: 'dine-in' | 'takeout' | 'delivery';
  orderDate: string;
  estimatedTime?: number;
  deliveryAddress?: Address;
  notes?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: OrderItemCustomization[];
  specialInstructions?: string;
}

export interface OrderItemCustomization {
  name: string;
  option: string;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  instructions?: string;
}

export interface PaymentMethod {
  type: 'card' | 'cash' | 'digital_wallet';
  last4?: string;
  brand?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Review {
  id: string;
  uid: string;
  restaurantId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment?: string;
  reviewDate: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  response?: ReviewResponse;
  verified: boolean;
  helpful: number;
}

export interface ReviewResponse {
  message: string;
  date: string;
  author: string;
}

export interface Customer {
  id: string;
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  preferences: CustomerPreferences;
  loyaltyPoints: number;
  totalOrders: number;
  favoriteRestaurants: string[];
  addresses: Address[];
  createdAt: string;
  lastOrderDate?: string;
}

export interface CustomerPreferences {
  dietary?: string[];
  cuisine?: string[];
  spiceLevel?: 'mild' | 'medium' | 'hot';
  allergies?: string[];
  defaultOrderType?: 'dine-in' | 'takeout' | 'delivery';
}

export interface Analytics {
  id: string;
  uid: string;
  restaurantId: string;
  date: string;
  metrics: AnalyticsMetrics;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
  customerCount: number;
  repeatCustomerRate: number;
  popularItems: PopularItem[];
  peakHours: number[];
}

export interface AnalyticsMetrics {
  totalSales: number;
  onlineOrders: number;
  dineInOrders: number;
  takeoutOrders: number;
  deliveryOrders: number;
  averageRating: number;
  reviewCount: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface PopularItem {
  menuItemId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface Notification {
  id: string;
  uid: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export type NotificationType = 'order' | 'review' | 'payment' | 'system' | 'promotion';

export interface ChatMessage {
  id: string;
  restaurantId: string;
  customerId?: string;
  type: 'customer' | 'ai' | 'staff';
  message: string;
  timestamp: string;
  metadata?: any;
}

export interface InventoryItem {
  id: string;
  uid: string;
  restaurantId: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  lastRestocked?: string;
  expiryDate?: string;
}

// Menu Category Management
export interface MenuCategory {
  id: string;
  uid: string;
  restaurantId: string;
  name: string;
  description?: string;
  displayOrder: number;
  active: boolean;
  image?: string;
  createdAt: string;
  updatedAt?: string;
}

// Theme System
export interface Theme {
  id: string;
  uid: string;
  name: string;
  displayName: string;
  description?: string;
  config: ThemeConfig;
  preview?: string;
  active: boolean;
  createdAt: string;
}

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  typography: {
    fontFamily: string;
    headingFont?: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
  };
  layout: {
    borderRadius: string;
    spacing: string;
    maxWidth: string;
  };
  components: {
    header: {
      style: 'classic' | 'modern' | 'minimal';
      transparent: boolean;
    };
    buttons: {
      style: 'rounded' | 'square' | 'pill';
    };
    cards: {
      shadow: 'none' | 'sm' | 'md' | 'lg';
      border: boolean;
    };
  };
}

// Blog System
export interface BlogPost {
  id: string;
  uid: string;
  restaurantId: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  tags: string[];
  categories: string[];
  seoTitle?: string;
  seoDescription?: string;
  viewCount: number;
  commentsEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BlogComment {
  id: string;
  uid: string;
  postId: string;
  author: string;
  email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  parentId?: string;
  createdAt: string;
}

// Reservations & Waitlist
export interface Reservation {
  id: string;
  uid: string;
  restaurantId: string;
  customerId?: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  date: string;
  time: string;
  partySize: number;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  tableNumber?: string;
  specialRequests?: string;
  confirmationCode: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface WaitlistEntry {
  id: string;
  uid: string;
  restaurantId: string;
  customerId?: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  date: string;
  partySize: number;
  estimatedWait?: number;
  status: 'waiting' | 'seated' | 'cancelled';
  position: number;
  notificationSent: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Discount System
export interface Discount {
  id: string;
  uid: string;
  restaurantId: string;
  name: string;
  code?: string;
  type: 'percentage' | 'fixed' | 'buy-one-get-one';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom?: string;
  validUntil?: string;
  active: boolean;
  applicableItems: string[];
  customerSegments: string[];
  createdAt: string;
  updatedAt?: string;
}

// Loyalty Program
export interface LoyaltyProgram {
  id: string;
  uid: string;
  restaurantId: string;
  name: string;
  description?: string;
  pointsPerDollar: number;
  rewardTiers: RewardTier[];
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface RewardTier {
  name: string;
  pointsRequired: number;
  reward: {
    type: 'discount' | 'free-item' | 'upgrade';
    value: number;
    description: string;
  };
}

// CRM System
export interface CustomerSegment {
  id: string;
  uid: string;
  restaurantId: string;
  name: string;
  description?: string;
  criteria: SegmentCriteria;
  customerCount: number;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SegmentCriteria {
  orderCount?: {
    min?: number;
    max?: number;
  };
  totalSpent?: {
    min?: number;
    max?: number;
  };
  lastOrderDays?: number;
  loyaltyPoints?: {
    min?: number;
    max?: number;
  };
  favoriteCategories?: string[];
  averageOrderValue?: {
    min?: number;
    max?: number;
  };
}

// Referral System
export interface Referral {
  id: string;
  uid: string;
  restaurantId: string;
  referrerId: string;
  refereeId?: string;
  refereeEmail: string;
  referralCode: string;
  status: 'pending' | 'completed' | 'expired';
  rewardAmount: number;
  rewardClaimed: boolean;
  completedAt?: string;
  createdAt: string;
}

// Email Marketing
export interface EmailCampaign {
  id: string;
  uid: string;
  restaurantId: string;
  name: string;
  subject: string;
  content: string;
  type: 'promotional' | 'newsletter' | 'transactional' | 'automated';
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  targetSegments: string[];
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  openRate: number;
  clickRate: number;
  createdAt: string;
  updatedAt?: string;
}

// Reputation Management
export interface ReputationMetric {
  id: string;
  uid: string;
  restaurantId: string;
  platform: 'google' | 'yelp' | 'tripadvisor' | 'facebook' | 'internal';
  rating: number;
  reviewCount: number;
  lastUpdated: string;
  trends: {
    ratingChange: number;
    reviewCountChange: number;
    period: string;
  };
  createdAt: string;
}

export interface Promotion {
  id: string;
  uid: string;
  restaurantId: string;
  name: string;
  description: string;
  type: 'discount' | 'bogo' | 'free_item' | 'percentage';
  value: number;
  minimumOrder?: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  usageLimit?: number;
  usedCount: number;
  applicableItems?: string[];
}