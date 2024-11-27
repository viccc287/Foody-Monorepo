export interface NewItem {
  name: string;
  quantity: number;
  unit: string;
  isActive: boolean;
  category: string;
  supplier: string;
  printLocations: string[];
  variablePrice: boolean;
  recipe?: string;
  price: number;
}

export interface Item extends NewItem {
  id: number;
}
