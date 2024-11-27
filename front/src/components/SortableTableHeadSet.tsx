import React from 'react';
import SortableTableHead from './SortableTableHead';

type SortConfig<T> = {
  key: keyof T;
  direction: "asc" | "desc";
} | null;

type ColumnDefinition<T> = {
  key: keyof T;
  label: React.ReactNode;
};

type SortableTableHeadSetProps<T> = {
  sortFunction: (key: keyof T) => void;
  sortConfig: SortConfig<T>;
  columns: ColumnDefinition<T>[];
};

function SortableTableHeadSet<T>({
  sortFunction,
  sortConfig,
  columns,
}: SortableTableHeadSetProps<T>) {
  return (
    <>
      {columns.map((column) => (
        <SortableTableHead<T>
          key={String(column.key)}
          columnKey={column.key}
          sortFunction={sortFunction}
          sortConfig={sortConfig}
        >
          {column.label}
        </SortableTableHead>
      ))}
    </>
  );
}

export default SortableTableHeadSet;