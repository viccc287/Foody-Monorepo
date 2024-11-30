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

import type { EnhancedOrder, AgentFullName } from "@/types";

interface RecentOrdersTableProps {
  orders: EnhancedOrder[];
  agentNames: AgentFullName[];
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



const sortOrdersByDate = (orders: EnhancedOrder[]) => {
  return orders.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export function RecentOrdersTable({
  orders,
  agentNames,
}: RecentOrdersTableProps) {

  const findAgentFullName = (id: number | null) => {
    if (!id) return "Desconocido";
    const agent = agentNames.find((agent) => agent.id === id);
    return agent ? `${agent.name} ${agent.lastName}` : "Desconocido";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Orden</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Artículos</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Creada</TableHead>
          <TableHead>Creada por</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortOrdersByDate(orders).map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.id}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell>{order.orderItems.length}</TableCell>
            <TableCell>{MXN.format(order.total)}</TableCell>
            <TableCell>
              <Badge
                className={
                  order.status === "active" ? "bg-blue-600" : order.status === "paid" ? "bg-green-600" : order.status === "cancelled" ? "bg-red-600" : "bg-yellow-600"
                }
              >
                {statuses[order.status] || "Desconocido"}
              </Badge>
            </TableCell>
           

            <TableCell className="flex items-center gap-2">
              {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })}
            </TableCell>
            <TableCell>{findAgentFullName(order.claimedById)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
