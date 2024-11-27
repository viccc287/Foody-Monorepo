export interface NewSupplier {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
}

export interface Supplier extends NewSupplier {
    id: number;
}