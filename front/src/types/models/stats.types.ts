interface HourlyDistributionItem {
  hour: string;
  orderCount: number;
}

interface TopSellingItemInfo {
  name: string;
  quantity: number;
  revenue: number;
}

interface Period {
  startDate: string;
  endDate: string;
}

export interface DashboardStats {
  activeOrders: number;
  cancelledOrders: number;
  completedOrders: number;
  totalSales: number;
  totalTips: number;
  totalDiscounts: number;
  orderCount: number;
  averageOrderValue: number;
  averageTimeBetweenCreatedAndBilled: number;
  conversionRate: number;
  hourlyDistribution: HourlyDistributionItem[];
  topSellingItems: TopSellingItemInfo[];
  period: Period;
}

export interface TotalHistoricValues {
  orderCount: number;
  totalSales: number;
  totalTips: number;
  totalDiscounts: number;
}
