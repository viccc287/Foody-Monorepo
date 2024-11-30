import SortableTableHeadSet from "@/components/SortableTableHeadSet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useSortConfig from "@/lib/useSortConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Edit2, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import ConfirmActionDialogButton from "@/components/ConfirmActionDialogButton";
import { Badge } from "@/components/ui/badge";
import { useAlert } from "@/lib/useAlert";
import type {
  Category,
  NewStockItem,
  SortableColumn,
  StockItem,
  Supplier,
} from "@/types";

const units = ["pieza", "vaso", "botella", "cartón", "kg", "g", "l", "ml"];

const formSchema = z.object({
  name: z.string().trim().min(1, "Nombre requerido"),
  stock: z
    .number({ invalid_type_error: "Stock requerido" })
    .min(0, "El stock debe ser mayor o igual a 0"),
  unit: z.string().trim().min(1, "Unidad requerida"),
  isActive: z.boolean(),
  categoryId: z.number(),
  supplierId: z.number(),
  cost: z
    .number({ invalid_type_error: "Costo requerido" })
    .min(0, "El costo debe ser mayor o igual a 0")
    .multipleOf(0.01, "El costo debe ser múltiplo de 0.01"),
});

const BASE_FETCH_URL = import.meta.env.VITE_SERVER_URL + "/menu/stock-items";
const CATEGORY_FETCH_URL =
  import.meta.env.VITE_SERVER_URL + "/categories?type=stock";
const SUPPLIER_FETCH_URL = import.meta.env.VITE_SERVER_URL + "/suppliers";

const fetchItems = async (): Promise<StockItem[]> => {
  const response = await fetch(BASE_FETCH_URL);
  const data: StockItem[] = await response.json();

  if (!response.ok) throw new Error("Error al cargar los artículos");
  return data;
};

const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch(CATEGORY_FETCH_URL);
  const data: Category[] = await response.json();
  if (!response.ok) throw new Error("Error al cargar las categorías");
  return data;
};

const fetchSuppliers = async (): Promise<Supplier[]> => {
  const response = await fetch(SUPPLIER_FETCH_URL);
  const data: Supplier[] = await response.json();
  if (!response.ok) throw new Error("Error al cargar los proveedores");
  return data;
};

const saveItem = async (item: StockItem): Promise<StockItem> => {
  const response = await fetch(`${BASE_FETCH_URL}/${item.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) throw new Error("Error al guardar el artículo");
  return item;
};

const createItem = async (values: NewStockItem): Promise<StockItem> => {
  const response = await fetch(BASE_FETCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) throw new Error("Error al crear el artículo");
  const data = await response.json();

  return { ...values, id: data.id } as StockItem;
};

const deleteItem = async (id: number): Promise<void> => {
  const response = await fetch(`${BASE_FETCH_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Error al eliminar el artículo");
};

const tableHeaderColumns: SortableColumn<StockItem>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Nombre" },
  { key: "stock", label: "Stock" },
  { key: "unit", label: "Unidad" },
  { key: "cost", label: "Costo" },
  { key: "isActive", label: "Estado" },
  { key: "categoryId", label: "Categoría" },
  { key: "supplierId", label: "Proveedor" },
];

const MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export default function Stock() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const { sortConfig, sortItems } = useSortConfig<StockItem>(setItems);
  const {alert} = useAlert();
  

  const defaultValues: NewStockItem = {
    name: "",
    stock: 0,
    unit: "",
    isActive: true,
    categoryId: undefined,
    supplierId: undefined,
    cost: 0,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const unit = form.watch("unit") || "unidad";

  useEffect(() => {
    fetchItems().then(setItems);
    fetchCategories().then(setCategories);
    fetchSuppliers().then(setSuppliers);
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!editingItem) {
        const newItem = await createItem(values);
        setItems([...items, newItem]);
        alert(
          "Artículo agregado",
          "El artículo ha sido agregado correctamente"
        );
      } else {
        const updatedItem = await saveItem({ ...values, id: editingItem.id });
        const updatedItems = items.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        );
        setItems(updatedItems);
        alert(
          "Artículo actualizado",
          "El artículo ha sido actualizado correctamente"
        );
      }
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset(defaultValues);
    } catch (error) {
      let message = "Error inesperado";
      if (error instanceof Error) {
        message = error.message;
      }
      alert("Error", message, "error");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      alert(
        "Artículo eliminado",
        "El artículo ha sido eliminado correctamente"
      );
    } catch (error) {
      let message = "Error inesperado";
      if (error instanceof Error) {
        message = error.message;
      }
      alert("Error", message, "error");
    }
  };

  const handleEdit = (item: StockItem) => {
    setEditingItem(item);
    form.reset(item);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventario</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingItem(null);
                form.reset(defaultValues);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar artículo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1000px] overflow-y-auto max-h-[90svh]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Editar" : "Agregar"} artículo
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Edita los detalles del artículo"
                  : "Agrega un nuevo artículo al inventario"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                name="stockForm"
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col space-y-4"
              >
                <div className="gap-4 grid grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Nombre del artículo"
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad en stock</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Cantidad en stock"
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidad</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una unidad" />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo por {unit}</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-1">
                            <DollarSign size={16} />

                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder="Costo unitario del artículo"
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(parseInt(value));
                            }}
                            value={field.value?.toString() || ""}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id.toString()}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proveedor</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(parseInt(value));
                            }}
                            value={field.value?.toString() || ""}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers.map((supplier) => (
                                <SelectItem
                                  key={supplier.id}
                                  value={supplier.id.toString()}
                                >
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Activo</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="self-end" size="lg">
                  Guardar
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      {items.length === 0 ? (
        <div className="text-center">No hay artículos en el inventario</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHeadSet
                sortFunction={sortItems}
                sortConfig={sortConfig}
                columns={tableHeaderColumns}
              />
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.stock}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{MXN.format(item.cost)}</TableCell>
                <TableCell>
                  <Badge
                    className={item.isActive ? "bg-green-600" : "bg-red-600"}
                  >
                    {item.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {categories.find(
                    (category) => category.id === item.categoryId
                  )?.name || "Categoría inexistente"}
                </TableCell>
                <TableCell>
                  {suppliers.find((supplier) => supplier.id === item.supplierId)
                    ?.name || "Proveedor inexistente"}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <ConfirmActionDialogButton
                      onConfirm={() => handleDelete(item.id)}
                      title="Eliminar artículo"
                      description="¿Estás seguro de que deseas eliminar este artículo?"
                      variant="destructive"
                      requireElevation
                      size='icon'
                    >
                      <Trash2 className="h-4 w-4"  />
                    </ConfirmActionDialogButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
