"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  DollarSign,
  ShoppingCart,
  XCircle,
  TrendingUp,
  Percent,
  Package,
  Clock,
  Coins,
  ClipboardList,
  Clock2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

import type { DashboardStats } from "@/types";

type OverviewCardsProps = Partial<DashboardStats> & {
  totalHistoricSales: number;
  totalHistoricTips: number;
  totalHistoricDiscounts: number;
  totalHistoricOrderCount: number;
};

export function OverviewCards({
  totalHistoricSales = 0,
  totalHistoricTips = 0,
  totalHistoricDiscounts = 0,
  totalHistoricOrderCount = 0,
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
}: OverviewCardsProps) {
  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-auto">
        <Card className="sm:col-span-2 lg:col-span-2 row-span-2">
          <CardHeader>
            <CardTitle>Resumen Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col items-start">
                <h3 className="text-md font-medium text-muted-foreground">
                  Ventas Totales
                </h3>
                <p className="text-4xl font-bold">
                  {MXN.format(totalHistoricSales)}
                </p>
              </div>
              <div className="flex flex-col items-start">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Propinas Totales
                </h3>
                <p className="text-2xl font-bold">
                  {MXN.format(totalHistoricTips)}
                </p>
              </div>
              <div className="flex flex-col items-start">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Descuentos Totales
                </h3>
                <p className="text-2xl font-bold">
                  {MXN.format(totalHistoricDiscounts)}
                </p>
              </div>
              <div className="flex flex-col items-start">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Órdenes Totales
                </h3>
                <p className="text-2xl font-bold">{totalHistoricOrderCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ventas del período
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{MXN.format(totalSales)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalSales / totalHistoricSales) * 100).toFixed(2)}% del total
              histórico
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Órdenes activas
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
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
              Propinas totales
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MXN.format(totalTips)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Descuentos totales
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {MXN.format(totalDiscounts)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Órdenes totales
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount}</div>
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
              Tasa de conversión
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
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
              Tiempo promedio de cobro
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageTimeBetweenCreatedAndBilled} min
            </div>
          </CardContent>
        </Card>
        |
      </div>
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Distribución horaria de órdenes</AccordionTrigger>
          <AccordionContent>
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
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyDistribution}>
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
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>
            Artículos más vendidos
          </AccordionTrigger>
          <AccordionContent>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ChartContainer
                    config={{
                      quantity: {
                        label: "Cantidad vendida",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topSellingItems}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
                    </ResponsiveContainer>
                  </ChartContainer>
                  <ChartContainer
                    config={{
                      revenue: {
                        label: "Ingresos",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
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
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
