export interface NewOrder {
  customer: string;
}

export interface Order extends NewOrder {
  id: number;
  subtotal: number;
  discountTotal: number;
  total: number;
  tip: number;
  createdAt: string;
  paymentMethod: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  status: string;
  claimedById: string | null;
  billedById: string | null;
  orderItems: OrderItem[];
}

export interface EnhancedOrder extends Order {
  orderItems: OrderItem[];
}

export interface NewOrderItem {
  menuItemId: number;
  orderId: number;
  quantity: number;
  comments: string | null;
}

export interface OrderItem extends NewOrderItem {
  id: number;
  subtotal: number | null;
  discountApplied: number | null;
  total: number | null;
  promoId: number | null;
  promoName: string | null;
  appliedPromos: AppliedPromo[];
  quantityHistory: QuantityHistory[];
}

interface AppliedPromo {
  promoId: number;
  promoName: string;
  quantity: number;
  discountApplied: number;
  timestamp: string;
  type: string;
}

interface QuantityHistory {
  quantity: number;
  timestamp: string;
}
