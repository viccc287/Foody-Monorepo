import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { Badge } from "@/components/ui/badge";
import TokenService from "@/services/tokenService";
import { useEffect, useState } from "react";

import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { DateRangePicker } from "@/components/DateRangePicker";
import PaginationNav from "@/components/PaginationNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlert } from "@/lib/useAlert";
import useDashboardStats from "@/lib/useDashboardStats";
import type {
  AgentFullName,
  EnhancedOrder,
  OrderPaginatedResponse,
  TotalHistoricValues,
} from "@/types";
import { DateRange } from "react-day-picker";

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
const ORDER_LIMIT = 15;

const fetchTotalHistoricValues = async (): Promise<TotalHistoricValues> => {
  const response = await fetch(`${BASE_FETCH_URL}/total-sales`);
  const data = await response.json();
  if (!response.ok) throw new Error("Error al cargar las ventas totales");
  return data;
};

const fetchOrders = async (
  page: number = 1,
  startDate?: string,
  endDate?: string
): Promise<OrderPaginatedResponse> => {
  let url = `${BASE_FETCH_URL}/?limit=${ORDER_LIMIT}`;

  if (page) {
    url += `&page=${page}`;
  }

  if (startDate && endDate) {
    url += `&startDate=${startDate}&endDate=${endDate}`;
  }
  const response = await fetch(url);
  const data: OrderPaginatedResponse = await response.json();
  if (!response.ok) throw new Error("Error al cargar las órdenes");
  console.log(data);

  return data;
};

const fetchOrdersByAgentId = async (
  agentId: number
): Promise<EnhancedOrder[]> => {
  if (!agentId) return [];
  const response = await fetch(
    `${BASE_FETCH_URL}/active-orders-by-agent/${agentId}`
  );
  const data = await response.json();
  if (!response.ok) throw new Error("Error al cargar las órdenes");
  const ordersData: EnhancedOrder[] = data.orders;
  return ordersData;
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

const elevatedRoles = ["manager", "cashier"];

function Dashboard() {
  const [userInfo, setUserInfo] = useState(TokenService.getUserInfo());
  const [agentNames, setAgentNames] = useState<AgentFullName[]>([]);
  const [orders, setOrders] = useState<EnhancedOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<EnhancedOrder[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [totalHistoricValues, setTotalHistoricValues] =
    useState<TotalHistoricValues | null>(null);
  const [isElevatedUser, setIsElevatedUser] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { alert } = useAlert();
  const { data: dashboardStats, error: dashboardStatsError } =
    useDashboardStats(
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString()
    );

  useEffect(() => {
    if (dashboardStatsError) {
      alert("Error", dashboardStatsError, "error");
    }
  }, [dashboardStatsError, alert]);

  useEffect(() => {
    const updatedUserInfo = TokenService.getUserInfo();
    setUserInfo(updatedUserInfo);
  }, []);

  /* TOTAL HISTORIC SALES */
  useEffect(() => {
    if (isElevatedUser) {
      fetchTotalHistoricValues()
        .then(setTotalHistoricValues)
        .catch((error) => alert("Error", error.message, "error"));
    }
  }, [isElevatedUser, alert]);

  /* ORDERS */

  useEffect(() => {
    if (!userInfo) return;

    if (isElevatedUser && dateRange?.from && dateRange?.to) {
      fetchOrders(1, dateRange.from.toISOString(), dateRange.to.toISOString())
        .then((response) => {
          setOrders(response.orders);
          setTotalPages(response.pagination.totalPages);
        })
        .catch(console.error);
    } else if (!isElevatedUser) {
      fetchOrdersByAgentId(userInfo.id!).then(setOrders).catch(console.error);
    }

    fetchAgentNames()
      .then(setAgentNames)
      .catch((error) => console.error(error));
  }, [isElevatedUser, userInfo, dateRange]);

  /* ORDERS PAGE CHANGE */

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchOrders(
        page,
        dateRange.from.toISOString(),
        dateRange.to.toISOString()
      )
        .then((response) => {
          setOrders(response.orders);
          setTotalPages(response.pagination.totalPages);
        })
        .catch((error) => {
          alert("Error", error.message, "error");
        });
    }
  }, [page, dateRange, alert]);

  /* USER INFO */

  useEffect(() => {
    setIsElevatedUser(elevatedRoles.includes(userInfo?.role || ""));
  }, [userInfo]);

  /* UPDATE CARDS */

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  return (
    <div className="flex flex-col container mx-auto py-10 gap-4">
      <div className="sm:flex-row flex-col flex items-start sm:items-center mb-6 gap-4">
        <h1 className="text-4xl font-bold">
          {getWelcomeMessage()}{" "}
          <span className="font-light">{userInfo?.name}</span>
        </h1>

        {userInfo?.role && <Badge>{rolesMap[userInfo.role]}</Badge>}
      </div>

      <DateRangePicker onDateRangeChange={handleDateRangeChange} />

      {isElevatedUser && (
        <OverviewCards
          totalHistoricSales={totalHistoricValues?.totalSales || 0}
          totalHistoricTips={totalHistoricValues?.totalTips || 0}
          totalHistoricDiscounts={totalHistoricValues?.totalDiscounts || 0}
          totalHistoricOrderCount={totalHistoricValues?.orderCount || 0}
          {...dashboardStats}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {isElevatedUser ? "Órdenes filtradas" : "Tus órdenes activas"}
            {totalPages > 1 && (
              <PaginationNav
                page={page}
                setPage={setPage}
                totalPages={totalPages}
              />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentOrdersTable orders={orders} agentNames={agentNames} />
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
