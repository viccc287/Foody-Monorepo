import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

import { RecentOrdersTable } from "@/components/dashboard/RecentOrdersTable";
import { DateRangePicker } from "@/components/DateRangePicker";
import PaginationNav from "@/components/PaginationNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlert } from "@/lib/useAlert";
import useDashboardStats from "@/lib/useDashboardStats";
import type {
  AgentFullName,
  DashboardStats,
  Order,
  OrderPaginatedResponse,
} from "@/types";
import { DateRange } from "react-day-picker";
import { useUserInfo } from "@/lib/useUserInfo";
import NoShownIf from "@/components/NoShownIf";
import { Button } from "@/components/ui/button";
import { ForkKnife } from "lucide-react";
import { Link } from "react-router-dom";

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

const BASE_FETCH_URL = import.meta.env.VITE_SERVER_URL + "/orders";
const ORDER_LIMIT = 2;

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

  return data;
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

function Dashboard() {
  const [agentNames, setAgentNames] = useState<AgentFullName[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { alert } = useAlert();
  const { userInfo, isElevatedUser, roleDisplay, isRole } = useUserInfo();
  const {
    data: dashboardStats,
    error: dashboardStatsError,
    loading: dashboardStatsLoading,
  } = useDashboardStats(
    dateRange?.from?.toISOString() || "",
    dateRange?.to?.toISOString() || "",
    userInfo?.id,
    isElevatedUser,
    isRole("cook")
  );

  /* DASHBOARD ERRORS */
  useEffect(() => {
    if (dashboardStatsError) {
      alert("Error", dashboardStatsError, "error");
    }
  }, [dashboardStatsError, alert]);

  /* ORDERS */

  useEffect(() => {
    if (!userInfo) return;

    if (isElevatedUser && dateRange?.from && dateRange?.to) {
      fetchOrders(
        page,
        dateRange.from.toISOString(),
        dateRange.to.toISOString()
      )
        .then((response) => {
          setOrders(response.orders);
          setTotalPages(response.pagination.totalPages);
        })
        .catch(console.error);
    }
    fetchAgentNames()
      .then(setAgentNames)
      .catch((error) => console.error(error));
  }, [isElevatedUser, userInfo, dateRange, page]);

  /* DATE RANGE PICKER*/
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

        {roleDisplay && <Badge>{roleDisplay}</Badge>}
      </div>

      {isRole("cook") ? (
        <div className="flex items-center justify-center rounded-lg overflow-hidden h-96">
          <Link to="/orders">
            <Button className="w-fit size-lg">
              <ForkKnife />
              Ir a la gestión de cocina
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <DateRangePicker onDateRangeChange={handleDateRangeChange} />
          <OverviewCards
            {...(dashboardStats as DashboardStats)}
            loading={dashboardStatsLoading}
          />
        </>
      )}

      {isElevatedUser && (
        <NoShownIf
          condition={orders.length === 0}
          message="No hay órdenes para mostrar"
        >
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                <span>Órdenes del periodo seleccionado</span>
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
              <RecentOrdersTable orders={orders} agentNames={agentNames} setOrders={setOrders} />
            </CardContent>
          </Card>
        </NoShownIf>
      )}
    </div>
  );
}

export default Dashboard;
