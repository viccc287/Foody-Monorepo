export interface NewMenuItem {
  name: string;
  quantity: number;
  unit: string;
  isActive: boolean;
  categoryId: number | undefined;
  printLocations: string[];
  variablePrice: boolean;
  recipe?: string;
  price: number;
}

export interface MenuItem extends NewMenuItem {
  id: number;
  ingredients: Ingredient[];

}

type StockItem = {
  id: number;
  name: string;
  stock: number;
  unit: string;
  isActive: boolean;
  categoryId: number;
  supplierId: number;
  cost: number;
};

type Ingredient = {
  id: number;
  menuItemId: number;
  inventoryProductId: number;
  quantityUsed: number;
  stockItem: StockItem;
};

