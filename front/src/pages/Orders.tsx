import { zodResolver } from "@hookform/resolvers/zod";
import { MinusCircle, PlusCircle, RefreshCcw, Trash2, X } from "lucide-react";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import TokenService from "@/services/tokenService";
import {
  AgentFullName,
  Category,
  MenuItem,
  NewOrder,
  NewOrderItem,
  Order,
  OrderItem,
} from "@/types";

interface NotEnoughStockItem {
  name: string;
  unit: string;
  stock: number;
  required: number;
}

const orderSchema = z.object({
  customer: z.string().trim().min(1, "Customer name is required"),
});

const tipSchema = z.object({
  tipType: z.enum(["10", "15", "20", "custom"]),
  customAmount: z
    .number({ invalid_type_error: "Debe ser válido" })
    .min(1, "La propina mínima es $1")
    .optional(),
});

const commentSchema = z.object({
  comments: z.string(),
});

const adminRoles = ["manager", "cashier"];

const ORDER_BASE_FETCH_URL = import.meta.env.VITE_SERVER_URL + "/orders";

const ORDER_WAITER_FETCH_URL =
  import.meta.env.VITE_SERVER_URL + "/orders/active-orders-by-agent";

const ORDER_ITEM_FETCH_URL = import.meta.env.VITE_SERVER_URL + "/order-items";
const MENUITEM_FETCH_URL = import.meta.env.VITE_SERVER_URL + "/menu/menu-items";
const CATEGORIES_FETCH_URL =
  import.meta.env.VITE_SERVER_URL + "/categories?type=menu";
const AGENTS_FETCH_URL = import.meta.env.VITE_SERVER_URL + "/agents/names";

const MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<OrderItem | null>(null);
  const [isElevatedUser, setIsElevatedUser] = useState(false);
  const [agentNames, setAgentNames] = useState<AgentFullName[]>([]);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [itemToAdd, setItemToAdd] = useState<MenuItem | null>(null);

  const [categorySearch, setCategorySearch] = useState("");

  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);

  const [userInfo, setUserInfo] = useState(TokenService.getUserInfo());

  const [orderCharged, setOrderCharged] = useState<Order | null>(null);

  const { toast } = useToast();

  const alert = (title: string, description: ReactNode, status?: string) =>
    toast({
      title,
      description,
      variant: status === "error" ? "destructive" : "default",
    });

  const orderForm = useForm<z.infer<typeof orderSchema>>({
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

  const commentForm = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      comments: "",
    },
  });
  // Effect for user info and role check
  useEffect(() => {
    const updatedUserInfo = TokenService.getUserInfo();
    setUserInfo(updatedUserInfo);
    setIsElevatedUser(adminRoles.includes(updatedUserInfo?.role ?? ""));
  }, []);

  const fetchOrders = async () => {
    try {
      if (!userInfo) return;

      const url = isElevatedUser
        ? `${ORDER_BASE_FETCH_URL}/active`
        : `${ORDER_WAITER_FETCH_URL}/${userInfo.id}`;

      const ordersData = await fetch(url).then((res) => res.json());
      setOrders(ordersData);

      if (selectedOrder) {
        const updatedOrder = ordersData.find(
          (order: Order) => order.id === selectedOrder.id
        );
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Consider adding error state and UI feedback
    }
  };


  useEffect(() => {
    fetchOrders();
  }, [userInfo, isElevatedUser]);

  // Effect for loading initial data
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
        // Consider adding error state and UI feedback
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (categorySearch === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [categorySearch, categories]);

  const findMenuItem = useCallback(
    (id: number) => menuItems.find((item) => item.id === id),
    [menuItems]
  );

  const addItemToOrder = async (
    menuItem: MenuItem,
    comments: string | null = null
  ) => {
    if (!selectedOrder) return;

    if (menuItem.printLocations.length > 0)
      alert(
        "Imprimiendo",
        `Imprimiendo en ${menuItem.printLocations}`,
        "success"
      );

    // Find if item already exists in order
    const existingItem = selectedOrder.orderItems?.find(
      (item) => item.menuItemId === menuItem.id
    );

    if (existingItem) {
      alert(
        "Agregado",
        "La cantidad del artículo en la orden ha sido incrementada"
      );
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

        if (data.error && data.notEnoughStock) {
          const errorList = (
            <ul>
              {data.notEnoughStock.map((stockItem: NotEnoughStockItem) => (
                <li key={stockItem.name}>
                  {stockItem.name} - {stockItem.stock.toFixed(2)}{" "}
                  {stockItem.unit} disponibles, {stockItem.required.toFixed(2)}{" "}
                  necesarios
                </li>
              ))}
            </ul>
          );

          alert(data.error, errorList, "error");
        } else console.error("Failed to update order item");
        return;
      }

      const data = await response.json();
      alert("Agregado", "El artículo ha sido agregado a la orden");
      setSelectedOrder(data.order);
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

      if (data.error && data.notEnoughStock) {
        const errorList = (
          <ul>
            {data.notEnoughStock.map((stockItem: NotEnoughStockItem) => (
              <li key={stockItem.name}>
                {stockItem.name} - {stockItem.stock.toFixed(2)} {stockItem.unit}{" "}
                disponibles, {stockItem.required.toFixed(2)} necesarios
              </li>
            ))}
          </ul>
        );

        alert(data.error, errorList, "error");
      } else console.error("Failed to update order item");
      return;
    }

    const data = await response.json();

    setSelectedOrder(data.order);

    return data.order;
  };

  const chargeOrder = async () => {

    if (!selectedOrder) return;

    if (!selectedOrder.orderItems || selectedOrder.orderItems.length === 0) {
      alert("Error", "No se puede cobrar una orden sin artículos", "error");
      return;
    }

    setOrderCharged(selectedOrder);

    setTicketDialogOpen(true);

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

    setOrders(orders.filter((order) => order.id !== selectedOrder.id));

    setSelectedOrder(null);
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
      "El artículo ha sido eliminado de la orden, el inventario ha sido reestablecido",
      "success"
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

    setOrders(orders.filter((order) => order.id !== selectedOrder.id));

    setSelectedOrder(null);
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

  const findAgentFullName = (id: number | null | undefined) => {
    if (!id) return "Desconocido";
    const agent = agentNames.find((agent) => agent.id === id);
    return agent ? `${agent.name} ${agent.lastName}` : "Desconocido";
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

      const newOrder = await response.json();

      setOrders([...orders, newOrder]);

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

  const onCommentSubmit = async (values: z.infer<typeof commentSchema>) => {
    if (!itemToAdd) return;

    await addItemToOrder(itemToAdd, values.comments);
    setCommentDialogOpen(false);
    commentForm.reset();
    setItemToAdd(null);
  };

  const getMenuItemsByCategory = useCallback(
    (categoryId: number) => {
      return menuItems.filter((item) => item.categoryId === categoryId);
    },
    [menuItems]
  );


  return (
    <div className="flex h-full">
      {/* TICKET DIALOG */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ticket de Venta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center border-b pb-4">
              <h3 className="font-bold">{import.meta.env.VITE_RESTAURANT_NAME}</h3>
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
                    <TableCell>{findMenuItem(item.menuItemId)?.name}</TableCell>
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
          <h2 className="text-xl font-semibold">Mesas</h2>
          <Button onClick={() => setOrderDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear orden
          </Button>
          <Button onClick={fetchOrders} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refrescar
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                Orden de {selectedOrder.customer}
              </h1>
              <Badge className="text-xs" variant="outline">
                {findAgentFullName(selectedOrder.claimedById)}
              </Badge>
              <div className="flex ml-auto gap-2"></div>
            </div>
            <ScrollArea className="grow">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 grow">
                {selectedOrder.orderItems?.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4 gap-2 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {findMenuItem(item.menuItemId)?.name ||
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
                              findMenuItem(item.menuItemId)?.price ?? 0
                            )}{" "}
                            c/u
                          </span>
                          {isElevatedUser && (
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
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
                  {isElevatedUser && (
                    <ConfirmActionDialogButton
                      onConfirm={cancelOrder}
                      title="Cancelar orden"
                      description="¿Estás seguro que deseas cancelar la orden?"
                      variant="destructive"
                      requireElevation
                    >
                      Cancelar
                    </ConfirmActionDialogButton>
                  )}

                  <Dialog
                    open={tipDialogOpen}
                    onOpenChange={() => {
                      if (tipDialogOpen) tipForm.reset();
                      setTipDialogOpen(!tipDialogOpen);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="grow">
                        {/*  <PlusCircle className="mr-2 h-4 w-4" /> */}
                        Propina
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Agregar propina</DialogTitle>
                        <DialogDescription>
                          Agrega propina la orden de {selectedOrder.customer}
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
                  {isElevatedUser && (
                    <ConfirmActionDialogButton
                      onConfirm={chargeOrder}
                      title={`Cobrar orden de ${selectedOrder.customer}`}
                      description="¿Estás seguro que deseas cobrar la orden?"
                    >
                      Cobrar
                    </ConfirmActionDialogButton>

                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              Selecciona una orden para ver los detalles
            </p>
          </div>
        )}
      </div>
      {/* Right Sidebar */}
      <div className="flex flex-col max-w-72 grow border-l p-4 h-full">
        <div className="flex flex-col mb-4 gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {selectedCategory ? selectedCategory.name : "Categorías"}
            </h2>

            {selectedCategory && (
              <Button variant="ghost" onClick={() => setSelectedCategory(null)}>
                Volver
              </Button>
            )}
          </div>
          {!selectedCategory && (
            <div className="flex gap-1">
              <Input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Buscar categoría"
              />
              {categorySearch && (
                <Button
                  onClick={() => {
                    setCategorySearch("");
                  }}
                  variant="outline"
                >
                  <X />
                </Button>
              )}
            </div>
          )}
        </div>
        <ScrollArea className="h-full mt-4">
          <div className="grid gap-2">
            {!selectedCategory
              ? // Show categories
                filteredCategories.map((category) => (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{category.name}</CardTitle>
                    </CardHeader>
                  </Card>
                ))
              : // Show menu items for selected category
                getMenuItemsByCategory(selectedCategory.id).map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-center gap-4 flex-wrap xl:flex-nowrap">
                        <div>
                          <CardTitle className="text-sm">{item.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            ${item.price}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap xl:max-w-min">
                          <Button
                            className="grow"
                            size="sm"
                            onClick={() => addItemToOrder(item)}
                            disabled={!selectedOrder}
                          >
                            Agregar
                          </Button>
                          <Button
                            className="grow"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setItemToAdd(item);
                              setCommentDialogOpen(true);
                            }}
                            disabled={!selectedOrder}
                          >
                            Con comentario
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
          </div>
          <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar con comentarios</DialogTitle>
                <DialogDescription>
                  Agregar {itemToAdd?.name} a la orden de{" "}
                  {selectedOrder?.customer || "l cliente"} con comentarios
                </DialogDescription>
              </DialogHeader>
              <Form {...commentForm}>
                <form
                  onSubmit={commentForm.handleSubmit(onCommentSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={commentForm.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Comentarios" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCommentDialogOpen(false);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit">Agregar con comentario</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </ScrollArea>
      </div>
    </div>
  );
}
