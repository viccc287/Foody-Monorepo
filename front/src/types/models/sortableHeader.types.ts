export type SortableColumn<T> = {
    key: keyof T;
    label: React.ReactNode;
  };