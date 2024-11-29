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

const parseRelativeTime = (dateString: string): string => {
  const inputDate = new Date(dateString);
  const now = new Date();
  const diffMillis = now.getTime() - inputDate.getTime();

  const minutes = Math.floor(diffMillis / (1000 * 60));
  const hours = Math.floor(diffMillis / (1000 * 60 * 60));
  const days = Math.floor(diffMillis / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffMillis / (1000 * 60 * 60 * 24 * 7));
  const months = Math.floor(diffMillis / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(diffMillis / (1000 * 60 * 60 * 24 * 365));

  if (minutes < 1) {
    return "justo ahora";
  } else if (minutes < 60) {
    return `hace ${minutes} minutos`;
  } else if (hours < 24) {
    return `hace ${hours} horas`;
  } else if (days === 1) {
    return "ayer";
  } else if (days < 7) {
    return `hace ${days} días`;
  } else if (weeks < 5) {
    return `hace ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
  } else if (months < 12) {
    return `hace ${months} ${months === 1 ? "mes" : "meses"}`;
  } else {
    return `hace ${years} ${years === 1 ? "año" : "años"}`;
  }
};

const sortOrdersByDate = (orders: EnhancedOrder[]) => {
  return orders.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export function RecentOrdersTable({
  orders,
  agentNames,
  limit = 5,
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
        {sortOrdersByDate(orders).slice(0, limit).map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.id}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell>{order.orderItems.length}</TableCell>
            <TableCell>${order.total.toFixed(2)}</TableCell>
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
              {parseRelativeTime(order.createdAt)}
            </TableCell>
            <TableCell>{findAgentFullName(order.claimedById)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
