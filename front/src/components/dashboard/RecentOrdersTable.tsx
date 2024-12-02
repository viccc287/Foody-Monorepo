import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { formatDistanceToNow } from "date-fns";

import { es } from "date-fns/locale";

import type { Order, AgentFullName, SortableColumn } from "@/types";
import useSortConfig from "@/lib/useSortConfig";
import SortableTableHeadSet from "../SortableTableHeadSet";

interface RecentOrdersTableProps {
  orders: Order[];
  agentNames: AgentFullName[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const statuses: { [key: string]: string } = {
  active: "Activa",
  paid: "Pagada",
  cancelled: "Cancelada",
  unpaid: "No pagada",
};

const MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export function RecentOrdersTable({
  orders,
  agentNames,
  setOrders,
}: RecentOrdersTableProps) {
  const { sortConfig, sortItems: sortOrders } = useSortConfig<Order>(setOrders);

  const findAgentFullName = (id: number | null) => {
    if (!id) return "Desconocido";
    const agent = agentNames.find((agent) => agent.id === id);
    return agent ? `${agent.name} ${agent.lastName}` : "Desconocido";
  };

  const tableHeaderColumns: SortableColumn<Order>[] = [
    { key: "id", label: "Orden" },
    { key: "customer", label: "Cliente" },
    { key: "orderItems", label: "Artículos" },
    { key: "total", label: "Total" },
    { key: "status", label: "Estado" },
    { key: "createdAt", label: "Creada" },
    { key: "updatedAt", label: "Última actualización" },
    { key: "claimedById", label: "Creada por" },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableTableHeadSet
            columns={tableHeaderColumns}
            sortConfig={sortConfig}
            sortFunction={sortOrders}
          />
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.id}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell>{order.orderItems.length}</TableCell>
            <TableCell>{MXN.format(order.total)}</TableCell>
            <TableCell>
              <Badge
                className={
                  order.status === "active"
                    ? "bg-blue-600"
                    : order.status === "paid"
                    ? "bg-green-600"
                    : order.status === "cancelled"
                    ? "bg-red-600"
                    : "bg-yellow-600"
                }
              >
                {statuses[order.status] || "Desconocido"}
              </Badge>
            </TableCell>

            <TableCell>
              {formatDistanceToNow(new Date(order.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </TableCell>

            <TableCell>
              {formatDistanceToNow(new Date(order.updatedAt), {
                addSuffix: true,
                locale: es,
              })}
            </TableCell>

            <TableCell>
              {findAgentFullName(order.claimedById || null)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
