export interface NewStockItem {
  name: string;
  stock: number;
  unit: string;
  isActive: boolean;
  categoryId: number;
  supplierId: number;
  cost: number;
}

export interface StockItem extends NewStockItem {
  id: number;
}
