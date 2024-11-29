export interface Agent  {
    id: number;
    name: string;
    lastName: string;
    image?: string;
    address: string;
    phone: string;
    rfc: string;
    email: string;
    pin: string;
    role: string;
    isActive: boolean;
};
  
export interface AgentFullName {
  id: string;
  name: string;
  lastName: string;
}
