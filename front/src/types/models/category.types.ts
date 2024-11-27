export interface NewCategory {
  name: string;
  description?: string;
  type: string;
}

export interface Category extends NewCategory {
  id: number;
}
