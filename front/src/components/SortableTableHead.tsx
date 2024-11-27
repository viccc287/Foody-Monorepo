import { ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

type SortConfig<T> = {
  key: keyof T;
  direction: "asc" | "desc";
} | null;

type SortableTableHeadProps<T> = {
  sortFunction: (key: keyof T) => void;
  sortConfig: SortConfig<T>;
  columnKey: keyof T;
  children: React.ReactNode;
};

function SortableTableHead<T>({
  columnKey,
  children,
  sortFunction,
  sortConfig,
}: SortableTableHeadProps<T>) {
  return (
    <TableHead
      onClick={() => sortFunction(columnKey)}
      className="cursor-pointer"
    >
      <div className="flex items-center gap-2">
        {children}
        {sortConfig?.key === columnKey && <ChevronsUpDown size={16} />}
      </div>
    </TableHead>
  );
}

export default SortableTableHead;