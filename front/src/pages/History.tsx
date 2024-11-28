import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

import useSortConfig from "@/lib/useSortConfig";

import type { SortableColumn } from "@/types";

import { useToast } from "@/hooks/use-toast";

import SortableTableHeadSet from "@/components/SortableTableHeadSet";

import type { OrderItem, MenuItem } from "@/types";

interface Order {
  id: number;
  customer: string;
  total: number;
  tip: number;
  cancelReason?: string;
  subtotal: number;
  discountTotal: number;
  orderItems: OrderItem[];
  status: string;
  createdAt: string;
  billedById: string;
}

interface AgentFullName {
  id: string;
  name: string;
  lastName: string;
}

const BASE_FETCH_URL = "http://localhost:3000/orders";

const MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const fetchOrders = async (): Promise<Order[]> => {
  const response = await fetch(BASE_FETCH_URL);
  const data: Order[] = await response.json();
  if (!response.ok) throw new Error("Error al cargar las órdenes");
  return data.filter((order) => order.status !== "active");
};

const fetchAgentNames = async (): Promise<AgentFullName[]> => {
  const response = await fetch("http://localhost:3000/agents/names");

  const data = await response.json();
  if (!response.ok)
    throw new Error("Error al cargar los nombres de los agentes");
  return data;
};

const fetchMenuItems = async (): Promise<MenuItem[]> => {
  const response = await fetch("http://localhost:3000/menu/menu-items");
  const data: MenuItem[] = await response.json();
  if (!response.ok) throw new Error("Error al cargar los artículos del menú");
  return data;
};

const tableHeaderColumns: SortableColumn<Order>[] = [
  { key: "id", label: "ID" },
  { key: "customer", label: "Cliente" },
  { key: "subtotal", label: "Subtotal" },
  { key: "discountTotal", label: "Descuento" },
  { key: "total", label: "Total" },
  { key: "tip", label: "Propina" },
  { key: "status", label: "Estado" },
  { key: "createdAt", label: "Fecha" },
  { key: "billedById", label: "Cobrada por" },
  { key: "orderItems", label: "Artículos" },
];

const statuses: { [key: string]: string } = {
  paid: "Pagada",
  unpaid: "No pagada",
  cancelled: "Cancelada",
};

export default function History() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [agentNames, setAgentNames] = useState<AgentFullName[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const { toast } = useToast();
  const { sortConfig, sortItems } = useSortConfig<Order>(setOrders);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });

    fetchAgentNames().then(setAgentNames);
    fetchMenuItems().then(setMenuItems);
  }, []);

  const findAgentFullName = (id: string | null) => {
    if (!id) return "Desconocido";
    const agent = agentNames.find((agent) => agent.id === id);
    return agent ? `${agent.name} ${agent.lastName}` : "Desconocido";
  };

  const findMenuItemName = (id: number) => {
    const menuItem = menuItems.find((item) => item.id === id);
    return menuItem ? menuItem.name : "Desconocido";
    };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Histórico de Órdenes</h1>
      {orders.length === 0 ? (
        <div className="text-center">No hay órdenes históricas</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHeadSet
                sortFunction={sortItems}
                sortConfig={sortConfig}
                columns={tableHeaderColumns}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{MXN.format(order.subtotal)}</TableCell>

                <TableCell>{MXN.format(order.discountTotal)}</TableCell>

                <TableCell>{MXN.format(order.total)}</TableCell>
                <TableCell>{MXN.format(order.tip)}</TableCell>

                <TableCell>{statuses[order.status]}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>{findAgentFullName(order.billedById)}</TableCell>
                <TableCell>
                  <ul className=" list-disc">
                    {order.orderItems.map((item) => (
                      <li key={item.id}>
                        {item.quantity}x {findMenuItemName(item.menuItemId)}
                      </li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
