import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  ClipboardList,
  Clock,
  ClockAlert,
  Coins,
  DollarSign,
  Percent,
  Ticket,
  XCircle,
} from "lucide-react";
import { Bar, BarChart, Legend, XAxis, YAxis } from "recharts";
import NoShownIf from "../NoShownIf";

const MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

import { useUserInfo } from "@/lib/useUserInfo";
import type { DashboardStats } from "@/types";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type OverviewCardsProps = DashboardStats & {
  loading: boolean;
};

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours > 0) {
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    return `${hours} hr ${remainingMinutes} min`;
  }

  return `${minutes} min`;
}

export function OverviewCards({
  historicTotals = {
    totalSales: 0,
    totalTips: 0,
    totalDiscounts: 0,
    orderCount: 0,
  },
  activeOrders = 0,
  cancelledOrders = 0,
  completedOrders = 0,
  totalSales = 0,
  totalTips = 0,
  totalDiscounts = 0,
  orderCount = 0,
  averageOrderValue = 0,
  averageTimeBetweenCreatedAndBilled = 0,
  conversionRate = 0,
  hourlyDistribution = [],
  topSellingItems = [],
  period = { startDate: "", endDate: "" },
  salesByPeriod = { type: "daily", data: [] },
  loading,
}: OverviewCardsProps) {
  const { isRole } = useUserInfo();

  return loading ? (
    <OverviewCardsSkeleton />
  ) : (
    <div className="flex flex-col 2xl:flex-row gap-4 items-start">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 auto-rows-auto 2xl:w-[60%]">
        <Card className="col-span-2 row-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{MXN.format(totalSales)}</div>

            <p className="text-xs text-muted-foreground mt-1">
              {`${new Date(period.startDate).toLocaleDateString()} - ${new Date(
                period.endDate
              ).toLocaleDateString()}`}
              {Number.isNaN(totalSales / historicTotals.totalSales)
                ? null
                : ` | ${(
                    (totalSales / historicTotals.totalSales) *
                    100
                  ).toFixed(2)}% del valor histórico`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descuentos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {MXN.format(totalDiscounts)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propinas</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MXN.format(totalTips)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Órdenes activas
            </CardTitle>
            <ClockAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Órdenes completadas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Órdenes canceladas
            </CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor promedio de orden
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {MXN.format(averageOrderValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tiempo promedio de cobro
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMinutes(averageTimeBetweenCreatedAndBilled)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de completado
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
          </CardContent>
        </Card>

        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Resumen Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col items-start">
                <h3 className="text-md font-medium text-muted-foreground">
                  Ventas totales
                </h3>
                <p className="text-4xl font-bold">
                  {MXN.format(historicTotals.totalSales)}
                </p>
              </div>
              <div className="flex flex-col items-start">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Propinas totales
                </h3>
                <p className="text-2xl font-bold">
                  {MXN.format(historicTotals.totalTips)}
                </p>
              </div>
              <div className="flex flex-col items-start">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Descuentos totales
                </h3>
                <p className="text-2xl font-bold">
                  {MXN.format(historicTotals.totalDiscounts)}
                </p>
              </div>
              <div className="flex flex-col items-start">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Órdenes totales
                </h3>
                <p className="text-2xl font-bold">
                  {historicTotals.orderCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {isRole("manager") && (
        <Accordion
          type="multiple"
          className="w-full 2xl:w-[40%]"
          defaultValue={["item-1"]}
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>Ventas por periodo</AccordionTrigger>
            <AccordionContent>
              <NoShownIf condition={salesByPeriod.data.length === 0}>
                <Card>
                  <CardContent className="pt-6">
                    <CardHeader>
                      <CardTitle className="text-muted-foreground text-xl">
                        {salesByPeriod.type === "daily"
                          ? "Por día"
                          : salesByPeriod.type === "weekly"
                          ? "Por semana"
                          : salesByPeriod.type === "monthly"
                          ? "Por mes"
                          : "Por año"}
                      </CardTitle>
                    </CardHeader>
                    <ChartContainer
                      config={{
                        totalSales: {
                          label: "Ventas",
                          color: "hsl(var(--chart-1))",
                        },
                        totalTips: {
                          label: "Propinas",
                          color: "hsl(var(--chart-4))",
                        },
                        totalDiscounts: {
                          label: "Descuentos",
                          color: "hsl(var(--chart-2))",
                        },
                      }}
                      className="h-[300px] w-full"
                    >
                      <BarChart
                        data={salesByPeriod.data}
                        margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
                      >
                        <XAxis
                          dataKey="periodStart"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) =>
                            format(parseISO(value), "PP", { locale: es })
                          }
                        />
                        <YAxis
                          yAxisId="left"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar
                          dataKey="totalSales"
                          fill="var(--color-totalSales)"
                          radius={[4, 4, 0, 0]}
                          yAxisId="left"
                          name="Ventas"
                        />
                        <Bar
                          dataKey="totalTips"
                          fill="var(--color-totalTips)"
                          radius={[4, 4, 0, 0]}
                          yAxisId="left"
                          name="Propinas"
                        />
                        <Bar
                          dataKey="totalDiscounts"
                          fill="var(--color-totalDiscounts)"
                          radius={[4, 4, 0, 0]}
                          yAxisId="left"
                          name="Descuentos"
                        />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </NoShownIf>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Artículos más vendidos</AccordionTrigger>
            <AccordionContent>
              <NoShownIf condition={topSellingItems.length === 0}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <ChartContainer
                        config={{
                          quantity: {
                            label: "Cantidad vendida",
                            color: "hsl(var(--chart-1))",
                          },
                        }}
                        className="h-[300px] w-full"
                      >
                        <BarChart
                          data={topSellingItems}
                          layout="vertical"
                          margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
                        >
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={150} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar
                            dataKey="quantity"
                            fill="var(--color-quantity)"
                            name="Cantidad"
                          />
                        </BarChart>
                      </ChartContainer>
                      <ChartContainer
                        config={{
                          revenue: {
                            label: "Ingresos",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                        className="h-[300px] w-full"
                      >
                        <BarChart
                          data={topSellingItems}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis
                            type="number"
                            tickFormatter={(value) => `$${value}`}
                          />
                          <YAxis dataKey="name" type="category" width={150} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar
                            dataKey="revenue"
                            fill="var(--color-revenue)"
                            name="Ingresos"
                          />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  </CardContent>
                </Card>
              </NoShownIf>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Distribución horaria de órdenes</AccordionTrigger>
            <AccordionContent>
              <NoShownIf condition={hourlyDistribution.length === 0}>
                <Card>
                  <CardContent className="pt-6">
                    <ChartContainer
                      config={{
                        orderCount: {
                          label: "Número de órdenes",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px] w-full"
                    >
                      <BarChart
                        data={hourlyDistribution}
                        margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
                      >
                        <XAxis
                          dataKey="hour"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}`}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="orderCount"
                          fill="var(--color-orderCount)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </NoShownIf>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}

function OverviewCardsSkeleton() {
  return (
    <div className="flex flex-col 2xl:flex-row gap-4 items-start">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 auto-rows-auto w-full">
        <Card className="col-span-2 row-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-3/4 mt-1" />
          </CardContent>
        </Card>

        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}

        <Card className="col-span-full">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col items-start">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
