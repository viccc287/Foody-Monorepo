export interface NewStockItem {
  name: string;
  stock: number;
  unit: string;
  isActive: boolean;
  categoryId: number | undefined;
  supplierId: number | undefined
  cost: number;
}

export interface StockItem extends Omit <NewStockItem, 'categoryId' | 'supplierId'> {
  id: number;
  categoryId: number;
  supplierId: number;
}
