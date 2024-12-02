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

interface SalesByPeriod {
  type: "daily" | "weekly" | "monthly" | "yearly";
  data: SalesByPeriodData[];
}

interface SalesByPeriodData{
  periodStart: string;
  orderCount: number;
  totalSales: number;
  totalTips: number;
  totalDiscounts: number;
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
  salesByPeriod: SalesByPeriod;
  historicTotals: HistoricTotals;
}

export interface HistoricTotals {
  orderCount: number;
  totalSales: number;
  totalTips: number;
  totalDiscounts: number;
}
