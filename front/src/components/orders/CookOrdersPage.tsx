import { useCallback, useEffect, useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useAlert } from "@/lib/useAlert";
import { AgentFullName, MenuItem, Order, OrderItem } from "@/types";
import { Minus, Plus, RefreshCcw } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const ORDERITEMS_FETCH_URL = SERVER_URL + "/order-items";

const updateReady = async (orderItem: OrderItem, readyQuantity: number = 1) => {
  if (orderItem.readyQuantity + readyQuantity < 0) return null;
  if (orderItem.readyQuantity + readyQuantity > orderItem.quantity) return null;

  try {
    const url = `${ORDERITEMS_FETCH_URL}/${orderItem.id}/ready-quantity`;
    const response = await fetch(url, {
      method: "PUT",
      body: JSON.stringify({ readyQuantity }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok)
      throw new Error("Error al modificar la cantidad de artículos listos");

    const data = await response.json();
    console.log(data.order);
    return data.order;
  } catch (error) {
    console.error("Error al modificar artículos listos:", error);
  }
};

interface CookOrdersPageProps {
  orders: Order[];
  setOrders?: React.Dispatch<React.SetStateAction<Order[]>>;
  fetchOrders: () => void;
  findMenuItemById: (id: number) => MenuItem | undefined;
  findAgentFullName: (id: number | null | undefined) => string;
}

const ProgressColor = {
  VERY_LOW: "bg-red-500",
  LOW: "bg-amber-500",
  REGULAR: "bg-yellow-500",
  HIGH: "bg-lime-500",
  MAX: "bg-green-500",
};

const getProgressColor = (progress: number) =>
  progress < 25
    ? ProgressColor.VERY_LOW
    : progress < 50
    ? ProgressColor.LOW
    : progress < 75
    ? ProgressColor.REGULAR
    : progress < 100
    ? ProgressColor.HIGH
    : ProgressColor.MAX;
const sortOrdersAndItems = (ordersToSort: Order[]) => {
  return ordersToSort
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .map((order) => ({
      ...order,
      orderItems: order.orderItems?.sort(
        (itemA, itemB) =>
          new Date(itemB.updatedAt).getTime() -
          new Date(itemA.updatedAt).getTime()
      ),
    }));
};

export default function CookOrdersPage({
  orders,
  fetchOrders,
  findMenuItemById,
  findAgentFullName,
}: CookOrdersPageProps) {
  const [filter, setFilter] = useState<number | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [sortedOrders, setSortedOrders] = useState<Order[]>([]);

  const { alert } = useAlert();

  useEffect(() => {
    if (filter) {
      setFilteredOrders(orders.filter((order) => order.id === filter));
    } else {
      setFilteredOrders(orders);
    }
  }, [filter, orders]);

  useEffect(() => {
    setSortedOrders(sortOrdersAndItems(orders));
  }, [orders, sortOrdersAndItems]);

  return (
    <div className="sm:flex h-full grow flex-col md:flex-row">
      <aside className="flex flex-col p-6 gap-6">
        <div className="flex gap-2 items-center justify-between">
          <h2 className="sm:text-2xl font-semibold">Órdenes</h2>
          <Button onClick={fetchOrders} variant="outline" size="icon">
            <RefreshCcw />
          </Button>
        </div>
        <ScrollArea>
          <div className="md:max-w-64 flex flex-col gap-2 md:gap-4 max-h-48 md:max-h-full overflow-auto">
            <Button
              variant="outline"
              className={cn(
                filter === null &&
                  "bg-cyan-500 hover:bg-cyan-600 text-white hover:text-white",
                "md:text-lg px-2 md:px-8 md:py-4 h-fit"
              )}
              onClick={() => setFilter(null)}
            >
              <span className="text-ellipsis overflow-hidden">Todas</span>
            </Button>
            {orders.map((order) => (
              <Button
                variant="outline"
                key={order.id}
                className={cn(
                  filter === order.id &&
                    "bg-cyan-500 hover:bg-cyan-60 0 text-white hover:text-white",
                  "md:text-lg px-4 md:px-8 md:py-4 h-fit flex justify-between items-center"
                )}
                onClick={() => setFilter(order.id)}
              >
                <span className="text-ellipsis overflow-hidden">
                  {order.customer}
                </span>
                <div
                  className={cn(
                    order.ready ? "bg-green-500" : "bg-amber-500",
                    "size-2 rounded-full"
                  )}
                />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </aside>
      <div className="flex flex-col grow p-6 h-full gap-6 justify-start">
        <ScrollArea>
          <div className="flex flex-col gap-4">
            {filteredOrders.map((order) => {
              if (order.orderItems.length === 0) return null;
              return (
                <div key={order.id} className="flex flex-col gap-2">
                  <span
                    className="font-medium text-muted-foreground text-sm"
                    onClick={() => {
                      setFilter(order.id);
                    }}
                  >
                    {order.customer}
                  </span>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-4 grow bg-gray-100 p-2 rounded-xl">
                    {order.orderItems?.map((item) => {
                      const progress =
                        100 * (item.readyQuantity / item.quantity);

                      return (
                        <Card key={item.id} className="w-full relative">
                          <Progress
                            value={progress}
                            className="w-full h-1 md:h-[6px] absolute bottom-0 left-0 opacity-75"
                            indicatorClassName={getProgressColor(progress)}
                          />
                          <CardContent className="p-4 sm:p-6 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <span className="font-medium text-lg sm:text-xl">
                                {item.quantity}{" "}
                                {findMenuItemById(item.menuItemId)?.name ||
                                  "Artículo eliminado"}
                              </span>
                              <Badge
                                className={cn(
                                  getProgressColor(progress),
                                  "px-3 py-1 text-xs sm:text-sm sm:px-4"
                                )}
                              >
                                {item.readyQuantity >= item.quantity
                                  ? "Todo listo"
                                  : item.readyQuantity === 0
                                  ? "Nada listo"
                                  : `Faltan ${
                                      item.quantity - item.readyQuantity
                                    }`}
                              </Badge>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                              <div className="space-y-3 flex-1">
                                <span className="text-sm text-muted-foreground">
                                  {item.readyQuantity} / {item.quantity} listos
                                </span>

                                {item.comments && (
                                  <p className="text-sm text-muted-foreground font-medium break-words">
                                    {item.comments}
                                  </p>
                                )}
                                <span className="block text-xs text-muted-foreground">
                                  {findAgentFullName(order.claimedById)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 sm:gap-3">
                                <Button
                                  size="icon"
                                  onClick={() => updateReady(item, -1)}
                                  variant="outline"
                                  disabled={item.readyQuantity === 0}
                                  className="h-10 w-10 sm:h-14 sm:w-14"
                                >
                                  <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                                <Button
                                  size="icon"
                                  onClick={() => updateReady(item, 1)}
                                  variant="outline"
                                  disabled={item.readyQuantity >= item.quantity}
                                  className="h-10 w-10 sm:h-14 sm:w-14"
                                >
                                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
