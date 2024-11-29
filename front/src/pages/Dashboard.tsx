import { OverviewCards } from "@/components/OverviewCards";
import { Badge } from "@/components/ui/badge";
import TokenService from "@/services/tokenService";
import { useEffect, useState } from "react";

import type { EnhancedOrder, AgentFullName } from "@/types";
import { RecentOrdersTable } from "@/components/RecentOrdersTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const getWelcomeMessage = () => {
  const currentHour = new Date().getHours();
  if (currentHour < 12) {
    return "Buenos días";
  } else if (currentHour < 18) {
    return "Buenas tardes";
  } else {
    return "Buenas noches";
  }
};

const rolesMap: {
  [key: string]: string;
} = {
  manager: "Gerente",
  cashier: "Cajero",
  waiter: "Mesero",
  cook: "Cocinero",
};

const BASE_FETCH_URL = "http://localhost:3000/orders";

const fetchOrders = async (): Promise<EnhancedOrder[]> => {
  const response = await fetch(BASE_FETCH_URL);
  const data: EnhancedOrder[] = await response.json();
  if (!response.ok) throw new Error("Error al cargar las órdenes");
  return data;
};

const fetchAgentNames = async (): Promise<AgentFullName[]> => {
  const response = await fetch("http://localhost:3000/agents/names");

  const data = await response.json();
  if (!response.ok)
    throw new Error("Error al cargar los nombres de los agentes");
  return data;
};

function Dashboard() {
  const [userInfo, setUserInfo] = useState(TokenService.getUserInfo());
  const [agentNames, setAgentNames] = useState<AgentFullName[]>([]);
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [recentOrders, setRecentOrders] = useState<EnhancedOrder[]>([]);
  const [info, setInfo] = useState({
    totalSales: 0,
    todaySales: 0,
    activeOrders: 0,
    cancelledOrders: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updatedUserInfo = TokenService.getUserInfo();
    setUserInfo(updatedUserInfo);
  }, []);


  useEffect(() => {
    fetchOrders()
      .then((data) => setOrders(data))
      .catch((error) => console.error(error));

    fetchAgentNames()
      .then(setAgentNames)
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    const totalSales = orders.reduce((acc, order) => acc + order.total, 0);
    const activeOrders = orders.filter(
      (order) => order.status === "active"
    ).length;

    const completedOrders = orders.filter(
      (order) => order.status === "completed"
    ).length;
    const cancelledOrders = orders.filter(
      (order) => order.status === "cancelled"
    ).length;

    const todayOrders = orders.filter(
      (order) =>
        new Date(order.createdAt).toDateString() === new Date().toDateString()
    );
    const todaySales = todayOrders.reduce((acc, order) => acc + order.total, 0);
    setInfo({
      totalSales,
      todaySales,
      activeOrders,
      cancelledOrders,
      completedOrders,
    });
  }, [orders]);

  useEffect(() => { 
    const recentOrders = orders.slice(0, 5);
    setRecentOrders(recentOrders);
  }, [orders]);


  return (
    <div className="flex flex-col container mx-auto py-10 gap-4">
      <div className="flex items-center mb-6 gap-4">
        <h1 className="text-4xl font-bold">{getWelcomeMessage()}</h1>

        <span className="text-4xl font-thin">{userInfo?.name}</span>
        {userInfo?.role && <Badge>{rolesMap[userInfo.role]}</Badge>}
      </div>
      <OverviewCards {...info} />
      <Card>
        <CardHeader>
          <CardTitle>Órdenes Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentOrdersTable orders={orders} agentNames={agentNames} />
        </CardContent>
      </Card>
    </div>
  );
}
export default Dashboard;
