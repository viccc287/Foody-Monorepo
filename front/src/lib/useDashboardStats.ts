// FILE: useDashboardStats.ts
import { useState, useEffect } from "react";

import type { DashboardStats } from "@/types";

const BASE_FETCH_URL = import.meta.env.VITE_SERVER_URL + "/orders";

const useDashboardStats = (
  startDate: string | undefined,
  endDate: string | undefined
) => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      console.log("Fetching dashboard stats");

      let url = `${BASE_FETCH_URL}/dashboard-stats`;

      if (startDate) url += `?startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      try {
        const response = await fetch(url);
        const data: DashboardStats = await response.json();
        console.log(data);

        if (!response.ok)
          throw new Error("Error al cargar la información del dashboard");
        setData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido al cargar la información del dashboard");
        }
      }
      };
      
    if (startDate || endDate) fetchDashboardStats();
    
  }, [startDate, endDate]);

  return { data, error };
};

export default useDashboardStats;
