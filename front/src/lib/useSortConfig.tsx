import { useState, useCallback } from "react";

type SortConfig<T> = {
  key: keyof T;
  direction: "asc" | "desc";
} | null;

function useSortConfig<T>(setItems: React.Dispatch<React.SetStateAction<T[]>>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null);

  const sortItems = useCallback(
    (key: keyof T) => {
      let direction: "asc" | "desc" = "asc";
      if (
        sortConfig &&
        sortConfig.key === key &&
        sortConfig.direction === "asc"
      ) {
        direction = "desc";
      }
      setSortConfig({ key, direction });
      setItems((prevItems) =>
        [...prevItems].sort((a, b) => {          
          const aValue = a[key] || "";
          const bValue = b[key] || "";
          if (aValue < bValue) return direction === "asc" ? -1 : 1;
          if (aValue > bValue) return direction === "asc" ? 1 : -1;
          return 0;
        })
      );
    },
    [sortConfig, setItems]
  );

  return { sortConfig, sortItems };
}

export default useSortConfig;
