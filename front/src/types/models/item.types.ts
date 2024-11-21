export interface NewItem  {

    name: string;
    quantity: number;
    unit: string;
    isActive: boolean;
    family: string;
    supplier: string;
    printLocations: string[];
    variablePrice: boolean;
    recipe?: string;
    price: number;
};

export interface Item extends NewItem {
    id: number;
};
  