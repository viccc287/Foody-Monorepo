// FILE: useDashboardStats.ts
import { useState, useEffect } from "react";

import type { DashboardStats } from "@/types";

const BASE_FETCH_URL = import.meta.env.VITE_SERVER_URL + "/orders";

const useDashboardStats = (
  startDate: string,
  endDate: string,
  claimedById?: number,
  isElevatedUser?: boolean,
  ignoreCondition?: boolean
) => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    
    if (ignoreCondition) return;

    const fetchDashboardStats = async () => {
      let url = `${BASE_FETCH_URL}/dashboard-stats`;
      
      if (startDate) url += `?startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (!isElevatedUser) {
        if (claimedById) url += `&claimedById=${claimedById}`;
      }

      try {
        const response = await fetch(url);
        const data: DashboardStats = await response.json();

        if (!response.ok)
          throw new Error("Error al cargar la información del dashboard");
        setData(data);

        setLoading(false);

        
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error desconocido al cargar la información del dashboard");
        }
      }
    };

    if (startDate || endDate) fetchDashboardStats();
  }, [startDate, endDate, claimedById, isElevatedUser, ignoreCondition]);

  return { data, error, loading };
};

export default useDashboardStats;
