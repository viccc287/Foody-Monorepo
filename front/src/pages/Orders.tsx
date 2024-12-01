import { zodResolver } from "@hookform/resolvers/zod";
import { MinusCircle, PlusCircle, RefreshCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import AlertDialogDelete from "@/components/AlertDialogDelete";
import ConfirmActionDialogButton from "@/components/ConfirmActionDialogButton";
import ItemSearchSidebar from "@/components/orders/ItemSearchSidebar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAlert } from "@/lib/useAlert";
import TokenService from "@/services/tokenService";
import {
  AgentFullName,
  Category,
  MenuItem,
  NewOrder,
  NewOrderItem,
  Order,
  OrderItem,
  StockItem,
} from "@/types";
import CookOrdersPage from "@/components/orders/CookOrdersPage";
import { cn } from "@/lib/utils";
import { io } from "socket.io-client";
import { Progress } from "@/components/ui/progress";

interface NotEnoughStockItem extends StockItem {
  required: number;
}

const orderSchema = z.object({
  customer: z.string().trim().min(1, "El nombre del cliente es requerido"),
});

const tipSchema = z.object({
  tipType: z.enum(["10", "15", "20", "custom"]),
  customAmount: z
    .number({ invalid_type_error: "Debe ser válido" })
    .min(1, "La propina mínima es $1")
    .optional(),
});

const Roles = {
  MANAGER: "manager",
  CASHIER: "cashier",
  COOK: "cook",
  WAITER: "waiter",
};

function hasRole(userRole: string, roles: string[]) {
  return roles.includes(userRole);
}

function isRole(userRole: string, role: string) {
  return userRole === role;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const ORDER_BASE_FETCH_URL = SERVER_URL + "/orders";

const ORDER_WAITER_FETCH_URL = SERVER_URL + "/orders/active-orders-by-agent";

const ORDER_ITEM_FETCH_URL = SERVER_URL + "/order-items";
const MENUITEM_FETCH_URL = SERVER_URL + "/menu/menu-items";
const CATEGORIES_FETCH_URL = SERVER_URL + "/categories?type=menu";
const AGENTS_FETCH_URL = SERVER_URL + "/agents/names";

const MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const socket = io(SERVER_URL);

const ProgressColor = {
  VERY_LOW: "bg-red-500",
  LOW: "bg-amber-500",
  REGULAR: "bg-yellow-500",
  HIGH: "bg-lime-500",
  MAX: "bg-green-500",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<OrderItem | null>(null);
  const [agentNames, setAgentNames] = useState<AgentFullName[]>([]);

  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);

  const [userInfo, setUserInfo] = useState(TokenService.getUserInfo());
  const userRole = userInfo?.role ?? "";

  const [orderCharged, setOrderCharged] = useState<Order | null>(null);

  const { alert } = useAlert();

  const orderForm = useForm<z.infer<typeof orderSchema> & NewOrder>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer: "",
    },
  });

  const tipForm = useForm<z.infer<typeof tipSchema>>({
    resolver: zodResolver(tipSchema),
    defaultValues: {
      tipType: "15",
      customAmount: 1,
    },
  });

  useEffect(() => {
    const updatedUserInfo = TokenService.getUserInfo();
    setUserInfo(updatedUserInfo);
  }, []);

  const handleOrderChanged = useCallback(
    (payload: { action: string; order?: Order; orderId?: number }) => {
      const { action, order, orderId } = payload;

      setOrders((prevOrders) => {
        let updatedOrders = [...prevOrders];

        switch (action) {
          case "created":
            if (order) {
              updatedOrders.push(order);
            }
            break;
          case "updated":
            console.log("received updated order from socket", order);

            if (order) {
              if (order.status === "paid") {
                setOrderCharged(order);
                setTicketDialogOpen(true);
                updatedOrders = updatedOrders.filter((o) => o.id !== order.id);
                break;
              }

              if (order.status === "cancelled") {
                updatedOrders = updatedOrders.filter((o) => o.id !== order.id);
                break;
              }

              const index = updatedOrders.findIndex((o) => o.id === order.id);
              console.log("index", index);

              if (index !== -1) {
                updatedOrders[index] = order;
              } else {
                updatedOrders.push(order); // En caso de que la orden no exista, agregarla
              }
            }
            break;
          case "deleted":
            if (orderId !== undefined) {
              updatedOrders = updatedOrders.filter((o) => o.id !== orderId);
            }
            break;
          default:
            break;
        }

        return updatedOrders;
      });
      if (action === "created" && order) {
        console.log("changing selected order from created", order);

        setSelectedOrder(order as Order);
      } else if (
        action === "updated" &&
        order &&
        selectedOrder?.id === order.id
      ) {
        console.log("changing selected order from updated", order);

        setSelectedOrder(order as Order);
      } else if (action === "deleted" && selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    },
    [selectedOrder]
  );

  const fetchOrders = useCallback(async () => {
    console.log("fetchOrders");

    try {
      if (!userInfo) return;

      const url = isRole(userRole, Roles.WAITER)
        ? `${ORDER_WAITER_FETCH_URL}/${userInfo.id}`
        : `${ORDER_BASE_FETCH_URL}/active`;

      const data = await fetch(url).then((res) => res.json());
      const ordersData: Order[] = data.orders;

      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Considera agregar manejo de estado de error y feedback en la UI
    }
  }, [userInfo, userRole]);

  useEffect(() => {
    if (selectedOrder) {
      const updatedOrder = orders.find(
        (order) => order.id === selectedOrder.id
      );
      setSelectedOrder(updatedOrder || null);
    }
  }, [orders, selectedOrder]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    socket.on("orderChanged", handleOrderChanged);

    return () => {
      socket.off("orderChanged", handleOrderChanged);
    };
  }, [handleOrderChanged]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [menuItemsData, categoriesData, agentNamesData] =
          await Promise.all([
            fetch(MENUITEM_FETCH_URL).then((res) => res.json()),
            fetch(CATEGORIES_FETCH_URL).then((res) => res.json()),
            fetch(AGENTS_FETCH_URL).then((res) => res.json()),
          ]);

        setMenuItems(menuItemsData);
        setCategories(categoriesData);
        setAgentNames(agentNamesData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  const findMenuItemById = useMemo(() => {
    return (id: number) => menuItems.find((item) => item.id === id);
  }, [menuItems]);

  const findAgentFullName = useMemo(() => {
    return (id: number | null | undefined) => {
      if (!id) return "Desconocido";
      const agent = agentNames.find((agent) => agent.id === id);
      return agent ? `${agent.name} ${agent.lastName}` : "Desconocido";
    };
  }, [agentNames]);

  interface OrderItemUpdateResponse {
    orderItem: OrderItem;
    orders: Order;
    lowStockItems?: StockItem[];
    notActiveItems?: StockItem[];
    notEnoughStockItems?: NotEnoughStockItem[];
    error?: string;
  }

  const showOrderAlert = useCallback(
    (data: OrderItemUpdateResponse, quantity: number) => {
      let title = quantity > 0 ? "Artículo agregado" : "Artículo eliminado";
      let messageContent: React.ReactNode =
        quantity > 0 ? "Artículo agregado" : "Artículo eliminado";
      let type: "default" | "warning" | "error" = "default";

      if (data.error && data.notEnoughStockItems) {
        title = data.error;
        messageContent = (
          <ul>
            {data.notEnoughStockItems.map((stockItem: NotEnoughStockItem) => (
              <li key={stockItem.name}>
                {stockItem.name} - {stockItem.stock.toFixed(2)} {stockItem.unit}{" "}
                disponibles, {stockItem.required.toFixed(2)} necesarios
              </li>
            ))}
          </ul>
        );
        type = "error";
      } else if (data.error && data.notActiveItems) {
        title = data.error;
        messageContent = (
          <ul>
            {data.notActiveItems.map((item: StockItem) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        );
        type = "error";
      } else if (data.lowStockItems && data.lowStockItems.length > 0) {
        title =
          "Artículo agregado, pero algunos ingredientes tienen poco stock";
        type = "warning";
        messageContent = (
          <ul>
            {data.lowStockItems.map((stockItem) => (
              <li key={stockItem.id}>
                {stockItem.name} - {stockItem.stock.toFixed(2)} {stockItem.unit}{" "}
                disponibles, límite mínimo: {stockItem.minStock.toFixed(2)}
              </li>
            ))}
          </ul>
        );
      } else if (data.error) {
        title = "Error";
        messageContent = data.error;
        type = "error";
      }

      alert(title, messageContent, type);
    },
    [alert]
  );

  const addItemToOrder = async (
    menuItem: MenuItem,
    comments: string | null = null
  ) => {
    if (!selectedOrder) return;

    if (menuItem.printLocations.length > 0)
      alert("Imprimiendo", `Imprimiendo en ${menuItem.printLocations}`);

    // Find if item already exists in order
    const existingItem = selectedOrder.orderItems?.find(
      (item) => item.menuItemId === menuItem.id
    );

    if (existingItem) {
      return updateItemQuantityOfOrder(existingItem, 1, comments);
    } else {
      const newItem: NewOrderItem = {
        menuItemId: menuItem.id,
        orderId: selectedOrder.id,
        quantity: 1,
        comments,
      };

      const response = await fetch(ORDER_ITEM_FETCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        const data = await response.json();
        showOrderAlert(data, 1);
        return;
      }

      alert("Agregado", "El artículo ha sido agregado a la orden");
    }
  };

  const updateItemQuantityOfOrder = async (
    orderItem: OrderItem,
    quantity: number,
    comments: string | null = null
  ) => {
    if (!selectedOrder) return;
    if (orderItem.quantity + quantity <= 0) return handleDeleteItem(orderItem);
    const timestamp = new Date().toISOString();

    const response = await fetch(
      `${ORDER_ITEM_FETCH_URL}/${orderItem.id}/quantity`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity,
          timestamp,
          comments,
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      showOrderAlert(data, quantity);
      return;
    }

    const data = await response.json();
    showOrderAlert(data, quantity);

    return data.order;
  };

  const chargeOrder = async () => {
    if (!selectedOrder) return;

    if (!selectedOrder.orderItems || selectedOrder.orderItems.length === 0) {
      alert("Error", "No se puede cobrar una orden sin artículos", "error");
      return;
    }

    const response = await fetch(
      `${ORDER_BASE_FETCH_URL}/${selectedOrder.id}/charge`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "paid",
          billedById: userInfo?.id,
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to bill order");
      return;
    }
  };

  const deleteOrderItem = async (orderItem: OrderItem) => {
    if (!selectedOrder) return;

    const response = await fetch(`${ORDER_ITEM_FETCH_URL}/${orderItem.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("Failed to delete order item");
      return;
    }

    alert(
      "Eliminado",
      "El artículo ha sido eliminado de la orden, el inventario ha sido reestablecido"
    );

    const orderData = await response.json();

    const updatedOrder = {
      ...orderData,
      orderItems: selectedOrder.orderItems.filter(
        (item) => item.id !== orderItem.id
      ),
    };

    setSelectedOrder(updatedOrder);
  };

  const cancelOrder = async () => {
    if (!selectedOrder) return;

    const response = await fetch(
      `${ORDER_BASE_FETCH_URL}/${selectedOrder.id}/cancel`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "cancelled",
          cancelReason: "Cancelada por el usuario",
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to cancel order");
      return;
    }
  };

  const handleDeleteItem = (item: OrderItem) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const confirmDeleteItem = () => {
    if (itemToDelete) {
      deleteOrderItem(itemToDelete);
    }
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  async function onOrderSubmit(data: NewOrder) {
    try {
      const response = await fetch(ORDER_BASE_FETCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          claimedById: userInfo?.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to create order");

      setOrderDialogOpen(false);
      orderForm.reset();
    } catch (error) {
      console.error("Error creating order:", error);
    }
  }

  const onTipSubmit = async (values: z.infer<typeof tipSchema>) => {
    // Handle tip submission here
    const tipAmount =
      values.tipType === "custom"
        ? values.customAmount
        : (parseFloat(values.tipType) / 100) * (selectedOrder?.total ?? 0);

    try {
      const response = await fetch(
        `${ORDER_BASE_FETCH_URL}/${selectedOrder?.id}/tip`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tip: tipAmount,
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to update tip");
        return;
      }

      const data = await response.json();

      setSelectedOrder(data.order);
    } catch (error) {
      console.error("Error updating tip:", error);
    }

    setTipDialogOpen(false);

    tipForm.reset();
  };

  return !isRole(userRole, Roles.COOK) ? (
    <div className="flex h-full grow">
      {/* TICKET DIALOG */}
      {hasRole(userRole, [Roles.MANAGER, Roles.CASHIER]) && (
        <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ticket de Venta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h3 className="font-bold">
                  {import.meta.env.VITE_RESTAURANT_NAME}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleString()}
                </p>
                <p className="text-sm">Cliente: {orderCharged?.customer}</p>
                <p className="text-sm">
                  Atendido por: {findAgentFullName(orderCharged?.claimedById)}
                </p>
                <p className="text-sm">
                  Cobrado por: {findAgentFullName(userInfo?.id)}
                </p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell>Cant.</TableCell>
                    <TableCell>Artículo</TableCell>
                    <TableCell className="text-right">Total</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderCharged?.orderItems?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {findMenuItemById(item.menuItemId)?.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {MXN.format(item.total ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>Subtotal</TableCell>
                    <TableCell className="text-right">
                      {MXN.format(orderCharged?.subtotal ?? 0)}
                    </TableCell>
                  </TableRow>
                  {orderCharged && orderCharged?.discountTotal > 0 && (
                    <TableRow>
                      <TableCell colSpan={2}>Descuentos</TableCell>
                      <TableCell className="text-right">
                        {MXN.format(orderCharged?.discountTotal ?? 0)}
                      </TableCell>
                    </TableRow>
                  )}

                  <TableRow>
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right">
                      {MXN.format(orderCharged?.total ?? 0)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2}>Propina</TableCell>
                    <TableCell className="text-right">
                      {MXN.format(orderCharged?.tip ?? 0)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* ORDER DIALOG */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva orden</DialogTitle>
            <DialogDescription>
              Para crear una nueva orden, ingrese el nombre del cliente
            </DialogDescription>
          </DialogHeader>
          <Form {...orderForm}>
            <form
              onSubmit={orderForm.handleSubmit(onOrderSubmit)}
              className="space-y-4"
            >
              <FormField
                control={orderForm.control}
                name="customer"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Nombre del cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Crear orden</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Left Sidebar */}
      <div className="flex flex-col w-64 border-r p-4 h-full">
        <div className="flex flex-col mb-4 gap-4 ">
          <div className="flex gap-2 items-center justify-between">
            <h2 className="text-xl font-semibold">Mesas</h2>
            <Button onClick={fetchOrders} variant="outline" size="icon">
              <RefreshCcw />
            </Button>
          </div>
          <Button onClick={() => setOrderDialogOpen(true)}>
            <PlusCircle />
            Crear orden
          </Button>
        </div>
        <ScrollArea className="grow">
          {orders.map((order) => (
            <Button
              key={order.id}
              variant={selectedOrder?.id === order.id ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => setSelectedOrder(order)}
            >
              {order.customer}
            </Button>
          ))}
        </ScrollArea>
      </div>
      {/* Main Content */}
      <AlertDialogDelete
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        onConfirm={confirmDeleteItem}
        onCancel={() => setShowDeleteDialog(false)}
      />{" "}
      <div className="flex flex-col grow p-6 h-full gap-6">
        {selectedOrder ? (
          <>
            <div className="flex items-start justify-center gap-2 flex-col">
              <div className="flex gap-2 items-center">
                <h1 className="text-2xl font-bold">
                  Orden de {selectedOrder.customer}
                </h1>
                <Badge
                  className={cn(
                    selectedOrder.ready ? "bg-green-600" : "bg-amber-600",
                    "size-fit whitespace-nowrap"
                  )}
                >
                  {selectedOrder.ready ? "Lista para cobrar" : "Pendiente"}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Creada por: {findAgentFullName(selectedOrder.claimedById)}
              </span>
              <div className="flex ml-auto gap-2"></div>
            </div>
            <ScrollArea className="grow">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 grow">
                {selectedOrder.orderItems?.map((item) => (
                  <Card key={item.id} className="relative">
                    <CardContent className="p-4 gap-2 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {findMenuItemById(item.menuItemId)?.name ||
                              "Artículo eliminado"}
                          </span>
                          {item.appliedPromos.length > 0 ? (
                            <Badge className="text-xs bg-green-600">
                              Promo
                            </Badge>
                          ) : null}
                          <span className="text-xs text-green-600">
                            {item.discountApplied
                              ? `-${MXN.format(item.discountApplied)}`
                              : null}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {MXN.format(
                              findMenuItemById(item.menuItemId)?.price ?? 0
                            )}{" "}
                            c/u
                          </span>
                          {hasRole(userRole, [
                            Roles.MANAGER,
                            Roles.CASHIER,
                          ]) && (
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() => handleDeleteItem(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {item.comments ? "-" + item.comments : null}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.readyQuantity}/{item.quantity} listos
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex justify-center flex-col">
                          {item.discountApplied !== null &&
                            item.discountApplied > 0 && (
                              <span className="text-xs line-through text-muted-foreground">
                                {MXN.format(item.subtotal ?? 0)}
                              </span>
                            )}

                          <span className="font-semibold">
                            {MXN.format(item.total ?? 0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => updateItemQuantityOfOrder(item, -1)}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>

                          <span>{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => updateItemQuantityOfOrder(item, 1)}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {(() => {
                        const progress =
                          100 * (item.readyQuantity / item.quantity);
                        return (
                          <Progress
                            value={progress}
                            className="w-full h-[3px] absolute bottom-0 left-0 opacity-75 "
                            indicatorClassName={cn(
                              progress < 25
                                ? ProgressColor.VERY_LOW
                                : progress < 50
                                ? ProgressColor.LOW
                                : progress < 75
                                ? ProgressColor.REGULAR
                                : progress < 100
                                ? ProgressColor.HIGH
                                : ProgressColor.MAX
                            )}
                          />
                        );
                      })()}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            {hasRole(userRole, [Roles.MANAGER, Roles.CASHIER]) && (
              <div className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Subtotal:
                      </span>
                      <span className="font-medium">
                        {MXN.format(selectedOrder.subtotal ?? 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Descuentos:
                      </span>
                      <span className="font-medium text-green-600">
                        {MXN.format(selectedOrder.discountTotal ?? 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">Total Final:</span>
                      <span className="text-xl font-bold">
                        {MXN.format(selectedOrder.total ?? 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="">Propina:</span>
                      <span className="font-medium">
                        {MXN.format(selectedOrder.tip ?? 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {hasRole(userRole, [Roles.MANAGER, Roles.CASHIER]) && (
                      <ConfirmActionDialogButton
                        onConfirm={cancelOrder}
                        title="Cancelar orden"
                        description="¿Estás seguro que deseas cancelar la orden?"
                        variant="destructive"
                        className="grow"
                        requireElevation
                      >
                        Cancelar
                      </ConfirmActionDialogButton>
                    )}

                    {!isRole(userRole, Roles.COOK) && (
                      <Dialog
                        open={tipDialogOpen}
                        onOpenChange={() => {
                          if (tipDialogOpen) tipForm.reset();
                          setTipDialogOpen(!tipDialogOpen);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button className="grow">Propina</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Agregar propina</DialogTitle>
                            <DialogDescription>
                              Agrega propina la orden de{" "}
                              {selectedOrder.customer}
                            </DialogDescription>
                          </DialogHeader>
                          <Form {...tipForm}>
                            <form
                              onSubmit={tipForm.handleSubmit(onTipSubmit)}
                              className="space-y-6"
                            >
                              <FormField
                                control={tipForm.control}
                                name="tipType"
                                render={({ field }) => (
                                  <FormItem className="space-y-3">
                                    <FormLabel>Seleccionar propina</FormLabel>
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="flex flex-col space-y-1"
                                      >
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                          <FormControl>
                                            <RadioGroupItem value="10" />
                                          </FormControl>
                                          <FormLabel className="font-normal">
                                            10%
                                          </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                          <FormControl>
                                            <RadioGroupItem value="15" />
                                          </FormControl>
                                          <FormLabel className="font-normal">
                                            15%
                                          </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                          <FormControl>
                                            <RadioGroupItem value="20" />
                                          </FormControl>
                                          <FormLabel className="font-normal">
                                            20%
                                          </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                          <FormControl>
                                            <RadioGroupItem value="custom" />
                                          </FormControl>
                                          <FormLabel className="font-normal">
                                            Otro
                                          </FormLabel>
                                        </FormItem>
                                      </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {tipForm.watch("tipType") === "custom" && (
                                <FormField
                                  control={tipForm.control}
                                  name="customAmount"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Monto personalizado</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="Ingresar monto"
                                          {...field}
                                          onChange={(e) =>
                                            field.onChange(
                                              parseFloat(e.target.value)
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                              <Button type="submit">Agregar propina</Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    )}
                    {hasRole(userRole, [Roles.CASHIER, Roles.MANAGER]) && (
                      <ConfirmActionDialogButton
                        onConfirm={chargeOrder}
                        title={`Cobrar orden de ${selectedOrder.customer}`}
                        description="¿Estás seguro que deseas cobrar la orden?"
                        className="grow"
                      >
                        Cobrar
                      </ConfirmActionDialogButton>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              Selecciona una orden para ver los detalles
            </p>
          </div>
        )}
      </div>
      <ItemSearchSidebar
        menuItems={menuItems}
        categories={categories}
        addItemToOrder={addItemToOrder}
        selectedOrder={selectedOrder}
      />
    </div>
  ) : (
    <CookOrdersPage
      orders={orders}
      setOrders={setOrders}
      fetchOrders={fetchOrders}
      findMenuItemById={findMenuItemById}
      findAgentFullName={findAgentFullName}
    />
  );
}
