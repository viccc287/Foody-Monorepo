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
  FormMessage
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
  TableRow
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import useSortConfig from "@/lib/useSortConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DollarSign,
  Edit2,
  PlusCircle,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import type { SortableColumn, StockItem, NewStockItem } from "@/types";

const families = [
  "Alimentos",
  "Cervezas",
  "Cocteles",
  "Mezcal/Tequila",
  "Whiskies",
  "Vinos",
  "Ron",
  "Vodka",
  "Ginebra",
  "Brandy",
  "Cognac",
  "Otros",
];

const suppliers = [
  "Tecate",
  "Corona",
  "Modelo",
  "Heineken",
  "Victoria",
  "Indio",
  "Pacífico",
  "Bohemia",
  "Budweiser",
  "Stella Artois",
  "León",
  "Sol",
  "XX Lager",
  "XX Ambar",
  "Negra Modelo",
  "Montejo",
  "Superior",
  "Barrilito",
  "Proveedor Genérico",
];

const units = ["pieza", "vaso", "botella", "kg", "g", "l", "ml"];



const formSchema = z.object({
  name: z.string().trim().min(1, "Nombre requerido"),
  stock: z
    .number({ invalid_type_error: "Stock requerido" })
    .min(0, "El stock debe ser mayor o igual a 0"),
  unit: z.string().trim().min(1, "Unidad requerida"),
  isActive: z.boolean(),
  family: z.string().trim().min(1, "Familia requerida"),
  supplier: z.string().trim().min(1, "Proveedor requerido"),
  cost: z
    .number({ invalid_type_error: "Costo requerido" })
    .min(0, "El costo debe ser mayor o igual a 0")
    .multipleOf(0.01, "El costo debe ser múltiplo de 0.01"),
});


const FETCH_BASE_URL = "http://localhost:3000/menu/stock-items";

const fetchItems = async (): Promise<StockItem[]> => {
  const response = await fetch(FETCH_BASE_URL);
  const data: StockItem[] = await response.json();
  return data;
};

const saveItem = async (item: StockItem): Promise<StockItem> => {
  const response = await fetch(`${FETCH_BASE_URL}/${item.id}`, {
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
  const response = await fetch(FETCH_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) throw new Error("Error al crear el artículo");
  const data = await response.json();

  return { ...values, id: data.id };
};

const deleteItem = async (id: number): Promise<void> => {
  const response = await fetch(`${FETCH_BASE_URL}/${id}`, {
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
  { key: "familyId", label: "Familia" },
  { key: "supplierId", label: "Proveedor" },
];

export default function Stock() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const { toast } = useToast();
  const { sortConfig, sortItems } = useSortConfig<StockItem>(setItems);

  const alert = (title: string, description: string, status?: string) =>
    toast({
      title,
      description,
      variant: status === "error" ? "destructive" : "default",
    });

  const defaultValues: NewStockItem = {
    name: "",
    stock: 0,
    unit: "",
    isActive: true,
    family: "",
    supplier: "",
    cost: 0,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });


  useEffect(() => {
    fetchItems().then(setItems);
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
          <DialogContent className="sm:max-w-[720px]">
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
                        <FormLabel>Costo por unidad</FormLabel>
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
                    name="family"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Familia</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una familia" />
                            </SelectTrigger>
                            <SelectContent>
                              {families.map((family) => (
                                <SelectItem key={family} value={family}>
                                  {family}
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
                    name="supplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proveedor</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                              {suppliers.map((supplier) => (
                                <SelectItem key={supplier} value={supplier}>
                                  {supplier}
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
                  
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.stock}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.cost.toFixed(2)}</TableCell>
                <TableCell>{item.isActive ? "Activo" : "Inactivo"}</TableCell>
                <TableCell>{item.family}</TableCell>
                <TableCell>{item.supplier}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
