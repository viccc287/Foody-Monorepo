export interface NewPromo {
  menuItemId: number | null; // Permitir null
  startDate: Date; // Permitir null
  endDate: Date;
  type: string;
  discount?: number | null;
  buy_quantity?: number | null;
  pay_quantity?: number | null;
  percentage?: number | null;
  always: boolean;
  isActive: boolean;
  recurrentDateId?: number;
  name: string;
  availability: {
    [key: string]: { startTime: string | null; endTime: string | null };
  };
}

export interface Promo extends NewPromo {
  id?: number; // ID adicional
}

export type FormValues = NewPromo; // Usa el mismo tipo para el formulario
