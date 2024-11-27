export interface NewItem {
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

export interface MenuItem extends NewItem {
  id: number;
}
