import { OverviewCards } from "@/components/OverviewCards";
import { Badge } from "@/components/ui/badge";
import TokenService from "@/services/tokenService";
import { useEffect, useState } from "react";

import type { EnhancedOrder, AgentFullName } from "@/types";
import { RecentOrdersTable } from "@/components/RecentOrdersTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const getWelcomeMessage = () => {
  const currentHour = new Date().getHours();
  if (currentHour < 5) {
    return "Buena madrugada";
  } else if (currentHour < 12) {
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
  manager: "Administrador",
  cashier: "Cajero",
  waiter: "Mesero",
  cook: "Cocinero",
};

const BASE_FETCH_URL = import.meta.env.VITE_SERVER_URL + "/orders";

const fetchOrders = async (): Promise<EnhancedOrder[]> => {
  const response = await fetch(BASE_FETCH_URL);
  const data: EnhancedOrder[] = await response.json();
  if (!response.ok) throw new Error("Error al cargar las órdenes");
  return data;
};

const fetchOrdersByAgentId = async (agentId: number): Promise<EnhancedOrder[]> => {
  if (!agentId) return [];
  const response = await fetch(`${BASE_FETCH_URL}/active-orders-by-agent/${agentId}`);
  const data: EnhancedOrder[] = await response.json();
  if (!response.ok) throw new Error("Error al cargar las órdenes");
  return data;
}

const fetchAgentNames = async (): Promise<AgentFullName[]> => {
  const response = await fetch(
    import.meta.env.VITE_SERVER_URL + "/agents/names"
  );

  const data = await response.json();
  if (!response.ok)
    throw new Error("Error al cargar los nombres de los agentes");
  return data;
};

const elevatedRoles = ["manager", "cashier"];

function Dashboard() {
  const [userInfo, setUserInfo] = useState(TokenService.getUserInfo());
  const [agentNames, setAgentNames] = useState<AgentFullName[]>([]);
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [todayOrders, setTodayOrders] = useState<EnhancedOrder[]>([]);
  const [dashboardInfo, setDashboardInfo] = useState({
    totalSales: 0,
    todaySales: 0,
    activeOrders: 0,
    cancelledOrders: 0,
    completedOrders: 0,
  });
  const [isElevatedUser, setIsElevatedUser] = useState(false);

  useEffect(() => {
    const updatedUserInfo = TokenService.getUserInfo();
    setUserInfo(updatedUserInfo);
  }, []);

  useEffect(() => {

    if (!userInfo) return;
    
  
    if (isElevatedUser) {
      fetchOrders()
        .then((data) => setOrders(data))
        .catch((error) => console.error(error));
    } else {
      fetchOrdersByAgentId(userInfo.id!)
        .then((data) => setOrders(data))
        .catch((error) => console.error(error));
    }
  
    fetchAgentNames()
      .then(setAgentNames)
      .catch((error) => console.error(error));
  }, [isElevatedUser, userInfo]);

  useEffect(() => {
    
    setIsElevatedUser(elevatedRoles.includes(userInfo?.role || ""));
  }, [userInfo]);

  useEffect(() => {
    if (isElevatedUser) {
      const totalSales = orders.reduce((acc, order) => acc + order.total, 0);
      const todayActiveOrders = todayOrders.filter(
        (order) => order.status === "active"
      ).length;

      const todayCompletedOrders = todayOrders.filter(
        (order) => order.status === "paid"
      ).length;
      const todayCancelledOrders = todayOrders.filter(
        (order) => order.status === "cancelled"
      ).length;

      const todaySales = todayOrders.reduce(
        (acc, order) => acc + order.total,
        0
      );
      setDashboardInfo({
        totalSales,
        todaySales,
        activeOrders: todayActiveOrders,
        cancelledOrders: todayCancelledOrders,
        completedOrders: todayCompletedOrders,
      });
    }
  }, [orders, todayOrders, isElevatedUser]);

  useEffect(() => {
    const todayOrders = orders.filter(
      (order) =>
        new Date(order.createdAt).toDateString() === new Date().toDateString()
    );
    setTodayOrders(todayOrders);
  }, [orders]);

  return (
    <div className="flex flex-col container mx-auto py-10 gap-4">
      <div className="sm:flex-row flex-col flex items-start sm:items-center mb-6 gap-4">
        <h1 className="text-4xl font-bold">{getWelcomeMessage()}</h1>

        <div className="flex items-center gap-2">
          <span className="text-4xl font-thin">{userInfo?.name}</span>
          {userInfo?.role && <Badge>{rolesMap[userInfo.role]}</Badge>}
        </div>
      </div>

      {isElevatedUser && <OverviewCards {...dashboardInfo} />}

      <Card>
        <CardHeader>
          <CardTitle>{isElevatedUser ? 'Órdentes recientes' : 'Tus órdenes activas'}</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentOrdersTable orders={orders} agentNames={agentNames} />
        </CardContent>
      </Card>
    </div>
  );
}
export default Dashboard;
