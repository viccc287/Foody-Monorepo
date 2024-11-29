import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import type { EnhancedOrder, AgentFullName } from "@/types";

interface RecentOrdersTableProps {
  orders: EnhancedOrder[];
  agentNames: AgentFullName[];
  limit?: number;
}

const statuses: { [key: string]: string } = {
  active: "Activa",
  paid: "Pagada",
  cancelled: "Cancelada",
  unpaid: "No pagada",
};

export function RecentOrdersTable({
  orders,
  agentNames,
  limit = 5,
}: RecentOrdersTableProps) {
  const findAgentFullName = (id: string | null) => {
    if (!id) return "Desconocido";
    const agent = agentNames.find((agent) => agent.id === id);
    return agent ? `${agent.name} ${agent.lastName}` : "Desconocido";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Orden #</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Creada por</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.slice(0, limit).map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.id}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell>{order.orderItems.length}</TableCell>
            <TableCell>${order.total.toFixed(2)}</TableCell>
            <TableCell>
              <Badge className={
                order.status === "active" ? "bg-blue-600" : "bg-gray-600"
              }>
                {statuses[order.status] || "Desconocido"}
              </Badge>
            </TableCell>
            <TableCell className="flex items-center gap-2">
              {findAgentFullName(order.claimedById)}
              {order.createdAt}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
