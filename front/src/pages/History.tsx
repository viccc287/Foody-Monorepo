import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

import useSortConfig from "@/lib/useSortConfig";

import type { OrderPaginatedResponse, SortableColumn } from "@/types";
import { CSVLink } from "react-csv";

import SortableTableHeadSet from "@/components/SortableTableHeadSet";

import PaginationNav from "@/components/PaginationNav";
import { Badge } from "@/components/ui/badge";
import { useAlert } from "@/lib/useAlert";
import type { AgentFullName, MenuItem, Order } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const BASE_FETCH_URL = import.meta.env.VITE_SERVER_URL + "/orders";
const ORDER_LIMIT = 15;

const MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const fetchOrders = async (
  page: number = 1
): Promise<OrderPaginatedResponse> => {
  const response = await fetch(
    `${BASE_FETCH_URL}/?limit=${ORDER_LIMIT}&page=${page}`
  );
  const data: OrderPaginatedResponse = await response.json();
  if (!response.ok) throw new Error("Error al cargar las órdenes");

  return {
    ...data,
    orders: data.orders.filter((order) => order.status !== "active"),
  };
};

const fetchAgentNames = async (): Promise<AgentFullName[]> => {
  const response = await fetch(
    import.meta.env.VITE_SERVER_URL + "/agents/names"
  );

  const data = await response.json();
  if (!response.ok)
    throw new Error("Error al cargar los nombres de los agentes");
  return data;
};

const fetchMenuItems = async (): Promise<MenuItem[]> => {
  const response = await fetch(
    import.meta.env.VITE_SERVER_URL + "/menu/menu-items"
  );
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
  { key: "createdAt", label: "Creada" },
  { key: "updatedAt", label: "Modificada" },
  { key: "billedAt", label: "Cobrada" },
  { key: "claimedById", label: "Creada por" },
  { key: "billedById", label: "Cobrada por" },
  { key: "orderItems", label: "Artículos" },
];

const statuses: { [key: string]: string } = {
  paid: "Pagada",
  unpaid: "No pagada",
  cancelled: "Cancelada",
};

const prepareDataForExport = (
  orders: Order[],
  findAgentFullName: (id: number | null) => string,
  findMenuItemName: (id: number) => string
) => {
  return orders.map((order) => ({
    ID: order.id,
    Cliente: order.customer,
    Subtotal: order.subtotal,
    Descuento: order.discountTotal,
    Total: order.total,
    Propina: order.tip,
    Estado: statuses[order.status] || "Desconocido",
    Creada: format(order.createdAt, "dd/MM/yy HH:mm", { locale: es }),
    Modificada: format(order.updatedAt, "dd/MM/yy HH:mm", { locale: es }),
    Cobrada: order.billedAt
      ? format(order.billedAt, "dd/MM/yy HH:mm", { locale: es })
      : "",
    Cancelada: order.cancelledAt
      ? format(order.cancelledAt, "dd/MM/yy HH:mm", { locale: es })
      : "",
    "Razón de cancelación": order.cancelReason || "",
    "Creada por": order.claimedById ? findAgentFullName(order.claimedById) : "",
    "Cobrada por": order.billedById ? findAgentFullName(order.billedById) : "",
    Artículos: order.orderItems
      .map((item) => `${item.quantity} ${findMenuItemName(item.menuItemId)}`)
      .join(", "),
  }));
};

export default function History() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [agentNames, setAgentNames] = useState<AgentFullName[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { sortConfig, sortItems: sortOrders } = useSortConfig<Order>(setOrders);

  const { alert } = useAlert();

  useEffect(() => {
    fetchOrders()
      .then((response) => {
        setOrders(response.orders);
        setTotalPages(response.pagination.totalPages);
      })
      .catch((error) => {
        alert("Error", error.message, "error");
      });

    fetchAgentNames().then(setAgentNames);
    fetchMenuItems().then(setMenuItems);
  }, [alert]);

  useEffect(() => {
    fetchOrders(page)
      .then((response) => {
        setOrders(response.orders);
        setTotalPages(response.pagination.totalPages);
      })
      .catch((error) => {
        alert("Error", error.message, "error");
      });
  }, [page, alert]);

  const findAgentFullName = (id: number | null) => {
    if (!id) return "Desconocido";
    const agent = agentNames.find((agent) => agent.id === id);
    return agent ? `${agent.name} ${agent.lastName}` : "Desconocido";
  };

  const findMenuItemName = (id: number) => {
    const menuItem = menuItems.find((item) => item.id === id);
    return menuItem ? menuItem.name : "Desconocido";
  };

  return (
    <div className="container mx-auto py-10 ">
      <h1 className="text-3xl font-bold mb-6">Histórico de Órdenes</h1>
      <Button className="mb-6">
        <CSVLink
          data={prepareDataForExport(
            orders,
            findAgentFullName,
            findMenuItemName
          )}
          filename="ordenes_historico.csv"
        >
          Exportar CSV completo
        </CSVLink>
      </Button>

      {orders.length === 0 ? (
        <div className="text-center">No hay órdenes históricas</div>
      ) : (
        <>
          {totalPages > 1 && (
            <PaginationNav
              page={page}
              setPage={setPage}
              totalPages={totalPages}
            />
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHeadSet
                  sortFunction={sortOrders}
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
                    </Badge>{" "}
                  </TableCell>
                  <TableCell>
                    {format(order.createdAt, "dd/MM/yy HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell>
                    {format(order.updatedAt, "dd/MM/yy HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell>
                    {order.billedAt &&
                      format(order.billedAt, "dd/MM/yy HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell>
                    {order.claimedById && findAgentFullName(order.claimedById)}
                  </TableCell>
                  <TableCell>
                    {order.billedById && findAgentFullName(order.billedById)}
                  </TableCell>
                  <TableCell>
                    <ul>
                      {order.orderItems.map((item) => (
                        <li key={item.id}>
                          {item.quantity} {findMenuItemName(item.menuItemId)}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
