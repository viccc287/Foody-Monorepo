import { zodResolver } from "@hookform/resolvers/zod";
import { MinusCircle, PlusCircle, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";

import AlertDialogDelete from "@/components/AlertDialogDelete";
import ItemSearchSidebar from "@/components/orders/ItemSearchSidebar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import TokenService from "@/services/tokenService";
import {
  AgentFullName,
  Category,
  MenuItem,
  NewOrder,
  Order,
  OrderItem,
} from "@/types";

// WaiterOrdersPageProps.ts
interface WaiterOrdersPageProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  fetchOrders: () => void;
  menuItems: MenuItem[];
  agentNames: AgentFullName[];
  categories: Category[];
  onAddItem: (menuItem: MenuItem, comments?: string | null) => Promise<void>;
  onUpdateItemQuantity: (
    orderItem: OrderItem,
    quantity: number,
    comments?: string | null
  ) => Promise<void>;
  onCreateOrder: (data: NewOrder) => Promise<void>;
  onDeleteItem: (orderItem: OrderItem) => Promise<void>;
  findMenuItemById: (id: number) => MenuItem | undefined;
  findAgentFullName: (id: number | null | undefined) => string;
}

const MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

// WaiterOrdersPage.tsx
export default function WaiterOrdersPage({
  orders,
  menuItems,
  fetchOrders,
  onAddItem,
  onUpdateItemQuantity,
  onCreateOrder,
  onDeleteItem,
  findMenuItemById,
  findAgentFullName,
  categories,
}: WaiterOrdersPageProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<OrderItem | null>(null);
  const [userInfo] = useState(TokenService.getUserInfo());

  const orderSchema = z.object({
    customer: z.string().trim().min(1, "El nombre del cliente es requerido"),
  });

  const orderForm = useForm<z.infer<typeof orderSchema> & NewOrder>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer: "",
    },
  });

  useEffect(() => {
    if (selectedOrder) {
      const updatedOrder = orders.find(
        (order) => order.id === selectedOrder.id
      );
      setSelectedOrder(updatedOrder || null);
    }
  }, [orders, selectedOrder]);

  const handleSubmitOrder = async (data: NewOrder) => {
    await onCreateOrder({
      ...data,
      claimedById: userInfo?.id,
    });
    setOrderDialogOpen(false);
    orderForm.reset();
  };

  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      await onDeleteItem(itemToDelete);
    }
    setShowDeleteDialog(false);
    setItemToDelete(null);
  };

  return (
    <div className="flex h-full grow">
      {/* Order Creation Dialog */}
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
              onSubmit={orderForm.handleSubmit(handleSubmitOrder)}
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

      {/* Left Sidebar - Orders List */}
      <div className="flex flex-col w-64 border-r p-4 h-full">
        <div className="flex flex-col mb-4 gap-4">
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

      {/* Main Content - Order Details */}
      <AlertDialogDelete
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        onConfirm={confirmDeleteItem}
        onCancel={() => setShowDeleteDialog(false)}
      />

      <div className="flex flex-col grow p-6 h-full gap-6">
        {selectedOrder ? (
          <>
            {/* Order Header */}
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
            </div>

            {/* Order Items */}
            <ScrollArea className="grow">
              <div className="grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 grow">
                {selectedOrder.orderItems?.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4 gap-2 flex justify-between items-center">
                      {/* Item details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {findMenuItemById(item.menuItemId)?.name ||
                              "Artículo eliminado"}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {MXN.format(
                            findMenuItemById(item.menuItemId)?.price ?? 0
                          )}{" "}
                          c/u
                        </span>
                      </div>
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onUpdateItemQuantity(item, -1, null)}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onUpdateItemQuantity(item, 1, null)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              Selecciona una orden para ver los detalles
            </p>
          </div>
        )}
      </div>

      {/* Item Search Sidebar */}
      <ItemSearchSidebar
        menuItems={menuItems}
        categories={categories}
        addItemToOrder={onAddItem}
        selectedOrder={selectedOrder}
      />
    </div>
  );
}
