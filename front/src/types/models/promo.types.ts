export interface NewPromo {
   menuItemId: number; // Permitir null
   startDate: Date; // Permitir null
   endDate: Date;
   type: string;
   discount?: number;
   buy_quantity?: number; // Permitir undefined
   pay_quantity?: number;
   percentage?: number;
   always: boolean;
   isActive: boolean;
   recurrentDateId?: number;
   name: string;
   availability: { [key: string]: { startTime: string | null; endTime: string | null } };
}

export interface Promo extends NewPromo {
   id?: number; // ID adicional
}

export type FormValues = NewPromo; // Usa el mismo tipo para el formulario
