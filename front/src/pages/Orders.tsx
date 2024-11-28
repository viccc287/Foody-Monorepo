import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, PlusCircle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  MenuItem,
  Order,
  NewOrder,
  OrderItem,
  NewOrderItem,
  Category,
} from "@/types";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const orderSchema = z.object({
  customer: z.string().trim().min(1, "Customer name is required"),
});

const tipSchema = z.object({
  tipType: z.enum(["15", "18", "20", "custom"]),
  customAmount: z.string().optional(),
});

const ORDER_BASE_FETCH_URL = "http://localhost:3000/orders";
const ORDER_ITEM_FETCH_URL = "http://localhost:3000/order-items";
const MENUITEM_FETCH_URL = "http://localhost:3000/menu/menu-items";
const CATEGORIES_FETCH_URL = "http://localhost:3000/categories?type=menu";

const exampleAgent = {
  name: "Carlos",
  lastName: "Hernández",
  image: null,
  address: "Calle Principal 123, Ciudad A",
  phone: "555-112-3344",
  rfc: "CHH123456789",
  email: "carlos.hernandez@restaurante.com",
  pin: "1234",
  role: "manager",
  isActive: true,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);

  const { toast } = useToast();

  const alert = (title: string, description: string, status?: string) =>
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
      customAmount: "",
    },
  });

  useEffect(() => {
    const loadData = async () => {
      const [ordersData, menuItemsData, categoriesData] = await Promise.all([
        fetch(`${ORDER_BASE_FETCH_URL}/active`).then((res) => res.json()),
        fetch(MENUITEM_FETCH_URL).then((res) => res.json()),
        fetch(CATEGORIES_FETCH_URL).then((res) => res.json()),
      ]);
      console.log("ordersData", ordersData);
      console.log("menuItemsData", menuItemsData);
      console.log("categoriesData", categoriesData);

      setOrders(ordersData);
      setMenuItems(menuItemsData);
      setCategories(categoriesData);
      setLoading(false);
    };
    loadData();
  }, []);

  const findMenuItem = useCallback(
    (id: number) => menuItems.find((item) => item.id === id),
    [menuItems]
  );

  const addItemToOrder = async (menuItem: MenuItem) => {
    if (!selectedOrder) return;

    alert(
      "Imprimiendo",
      `Imprimiendo en ${menuItem.printLocations}`,
      "success"
    );

    // Find if item already exists in order
    const existingItem = selectedOrder.orderItems?.find(
      (item) => item.menuItemId === menuItem.id
    );

    const timestamp = new Date().toISOString();

    let newOrderItem: OrderItem;
    let updatedOrder: Order;

    if (existingItem) {
      const response = await fetch(
        `${ORDER_ITEM_FETCH_URL}/${existingItem.id}/quantity`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity: 1,
            timestamp,
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to update order item");
        return;
      }

      newOrderItem = await response.json();
      updatedOrder = {
        ...selectedOrder,
        orderItems: selectedOrder.orderItems.map((item) =>
          item.id === newOrderItem.id ? newOrderItem : item
        ),
      };
    } else {
      // Create new item
      const newItem: NewOrderItem = {
        menuItemId: menuItem.id,
        orderId: selectedOrder.id,
        quantity: 1,
        comments: null,
      };

      const response = await fetch(ORDER_ITEM_FETCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        console.error("Failed to create order item");
        return;
      }

      newOrderItem = await response.json();
      updatedOrder = {
        ...selectedOrder,
        orderItems: [...selectedOrder.orderItems, newOrderItem],
      };
    }

    setSelectedOrder(updatedOrder);
  };

  const chargeOrder = async () => {
    if (!selectedOrder) return;

    const response = await fetch(
      `${ORDER_BASE_FETCH_URL}/${selectedOrder.id}/charge`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "paid",
          billedById: exampleAgent.name,
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to bill order");
      return;
    }

    const updatedOrder = await response.json();
    setOrders(
      orders.map((order) =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
    setSelectedOrder(updatedOrder);
  };

  async function onOrderSubmit(data: NewOrder) {
    try {
      const response = await fetch(ORDER_BASE_FETCH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create order");

      const newOrder = await response.json();
      console.log("newOrder", newOrder);

      setOrders([...orders, newOrder]);

      setOrderDialogOpen(false);
      orderForm.reset();
    } catch (error) {
      console.error("Error creating order:", error);
    }
  }

  const onTipSubmit = (values: z.infer<typeof tipSchema>) => {
    console.log("values", values);

    // Handle tip submission here
    const tipAmount =
      values.tipType === "custom"
        ? parseFloat(values.customAmount || "0")
        : (parseFloat(values.tipType) / 100) * selectedOrder.total;

    console.log("tipAmount", tipAmount);

    setTipDialogOpen(false);

    tipForm.reset();
  };

  const getMenuItemsByCategory = useCallback(
    (categoryId: number) => {
      return menuItems.filter(item => item.categoryId === categoryId);
    },
    [menuItems]
  );

  return (
    <div className="flex h-full">
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
        <div className="flex flex-col  mb-4 gap-4 ">
          <h2 className="text-xl font-semibold">Mesas</h2>
          <Button onClick={() => setOrderDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
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
      <div className="flex flex-col grow p-6 h-full gap-6">
        {selectedOrder ? (
          <>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                Orden de {selectedOrder.customer}
              </h1>
              <div className="flex ml-auto gap-2">
                <Dialog
                  open={addItemDialogOpen}
                  onOpenChange={setAddItemDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Agregar artículos
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[700px] max-h-[90svh]">
                    <DialogHeader>
                      <DialogTitle>Agregar a la orden</DialogTitle>
                      <DialogDescription>
                        Agrega artículos a la orden de {selectedOrder.customer}
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        {menuItems.map((item) => (
                          <Card key={item.id}>
                            <CardHeader className="p-4">
                              <CardTitle className="text-sm">
                                {item.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <p className="text-sm text-muted-foreground">
                                ${item.price}
                              </p>
                              <Button
                                size="sm"
                                className="mt-2"
                                onClick={() => addItemToOrder(item)}
                              >
                                Agregar
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
                <Dialog open={tipDialogOpen} onOpenChange={setTipDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Agregar propina
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
                                      <RadioGroupItem value="15" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      15%
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="18" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      18%
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
                                    placeholder="Ingresar monto"
                                    {...field}
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
              </div>
            </div>
            <ScrollArea className="grow">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 grow">
                {selectedOrder.orderItems?.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <div className="flex items-center justify-center gap-2">
                          <p className="font-medium">
                            {findMenuItem(item.menuItemId)?.name ||
                              "Artículo eliminado"}
                          </p>
                          {item.appliedPromos.length > 0 ? (
                            <Badge className="text-xs bg-green-600">
                              Promo
                            </Badge>
                          ) : null}
                          <p className="text-xs text-green-600">
                            {item.discountApplied
                              ? `-$${item.discountApplied.toFixed(2)}`
                              : null}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div className="flex justify-center flex-col">
                        <p className="text-xs line-throug text-muted-foreground">
                          ${item.subtotal?.toFixed(2)}
                        </p>

                        <p className="font-semibold">
                          ${item.total?.toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">${selectedOrder.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Descuentos:</span>
                  <span className="font-medium text-green-600">-${selectedOrder.discountTotal?.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Total Final:</span>
                  <span className="text-xl font-bold">${selectedOrder.total?.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button>Cobrar</Button>
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
      <div className="flex flex-col w-96 border-l p-4 h-full">
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
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="grid gap-4">
            {!selectedCategory
              ? // Show categories
                categories.map((category) => (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">{category.name}</CardTitle>
                    </CardHeader>
                  </Card>
                ))
              : // Show menu items for selected category
                getMenuItemsByCategory(selectedCategory.id).map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground">
                        ${item.price}
                      </p>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => addItemToOrder(item)}
                        disabled={!selectedOrder}
                      >
                        Agregar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
