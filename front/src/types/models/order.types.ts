export interface NewOrder {
  claimedById: number | null | undefined;
  customer: string;
}

export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderPaginatedResponse {
  orders: Order[];
  pagination: Pagination;
  totalPages: number;
}

export interface Order extends NewOrder {
  id: number;
  subtotal: number;
  discountTotal: number;
  total: number;
  tip: number;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  status: string;
  billedById: number | null;
  ready: boolean;
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
  createdAt: string;
  updatedAt: string;
  readyQuantity: number;
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
