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
  FormDescription,
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Edit2, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";


import SortableTableHeadSet from "@/components/SortableTableHeadSet";
import { Badge } from "@/components/ui/badge";
import useSortConfig from "@/lib/useSortConfig";
import type { SortableColumn } from "@/types";

import ConfirmActionDialogButton from "@/components/ConfirmActionDialogButton";
import { useAlert } from "@/lib/useAlert";
import type { MenuItem, StockItem } from "@/types";

type Category = {
  id: number;
  name: string;
  description: string;
  type: string;
};

const printLocations = ["Cocina", "Caja", "Barra"];

const units = ["orden", "pieza", "porción", "vaso", "combo", "botella", "kg", "g", "l", "ml", "acción"];

const formSchema = z.object({
  name: z.string().trim().min(1, "Nombre requerido"),
  quantity: z
    .number({ invalid_type_error: "Cantidad requerida" })
    .min(1, "La cantidad debe ser mayor a 0"),
  unit: z.string().trim().min(1, "Unidad requerida"),
  isActive: z.boolean(),
  categoryId: z.number({ required_error: "Categoría requerida" }),
  printLocations: z.array(z.string()),
  variablePrice: z.boolean(),
  price: z
    .number({ invalid_type_error: "Precio requerido" })
    .min(0, "El precio debe ser mayor o igual a 0")
    .multipleOf(0.01, "El precio debe ser múltiplo de 0.01"),
  ingredients: z.array(
    z.object({
      inventoryProductId: z
        .number({ invalid_type_error: "Invalid" })
        .min(1, "Ingrediente requerido"),
      quantityUsed: z.number().min(0.01, "La cantidad debe ser mayor a 0.01"),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

const BASE_FETCH_URL = import.meta.env.VITE_SERVER_URL + "/menu";
const CATEGORY_FETCH_URL =
  import.meta.env.VITE_SERVER_URL + "/categories?type=menu";

const fetchItems = async (): Promise<MenuItem[]> => {
  const response = await fetch(`${BASE_FETCH_URL}/menu-items-with-ingredients`);
  const data: MenuItem[] = await response.json();
  if (!response.ok) throw new Error("Error al obtener los artículos del menú");
  return data;
};

const fetchStockItems = async (): Promise<StockItem[]> => {
  const response = await fetch(`${BASE_FETCH_URL}/stock-items`);
  const data: StockItem[] = await response.json();
  if (!response.ok)
    throw new Error("Error al obtener los artículos del inventario");
  return data;
};

const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch(CATEGORY_FETCH_URL);
  const data: Category[] = await response.json();
  if (!response.ok) throw new Error("Error al obtener las categorías");
  return data;
};

const saveItem = async (
  item: FormValues & { id: number }
): Promise<MenuItem> => {
  const response = await fetch(`${BASE_FETCH_URL}/menu-items/${item.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) throw new Error("Error al guardar el artículo");

  const data = await response.json();

  return data;
};

const createItem = async (values: FormValues): Promise<MenuItem> => {
  const response = await fetch(`${BASE_FETCH_URL}/menu-items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) throw new Error("Error al crear el artículo");
  const data = await response.json();

  return data;
};

const deleteItem = async (id: number): Promise<void> => {
  const response = await fetch(`${BASE_FETCH_URL}/menu-items/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Error al eliminar el artículo");
};

const tableHeaderColumns: SortableColumn<MenuItem>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Nombre" },
  { key: "quantity", label: "Cantidad" },
  { key: "unit", label: "Unidad" },
  { key: "price", label: "Precio" },
  { key: "categoryId", label: "Categoría" },
  { key: "printLocations", label: "Imprimir en" },
  { key: "variablePrice", label: "Precio variable" },
  { key: "isActive", label: "Estado" },
  { key: "ingredients", label: "Ingredientes" },
];

export default function MenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const { sortConfig, sortItems } = useSortConfig<MenuItem>(setItems);

  const { alert } = useAlert();

  const defaultValues: FormValues = {
    name: "",
    quantity: 1,
    unit: "",
    isActive: true,
    categoryId: -2,
    printLocations: [],
    variablePrice: false,
    price: 0,
    ingredients: [],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    fetchItems().then(setItems);

    fetchStockItems().then(setStockItems);
    fetchCategories().then(setCategories);
  }, []);

  const onSubmit = async (values: FormValues) => {
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

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    form.reset(item);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Artículos del menú</h1>
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
                  ? "Edita los detalles del artículo del menú"
                  : "Agrega un nuevo artículo al menú"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                name="articleForm"
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <div className="gap-4 grid grid-cols-2 ">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre del artículo"
                            {...field}
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          name="unit"
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una unidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {units.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-1">
                            <DollarSign size={16} />
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
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
                        <Select
                          onValueChange={(value) => {
                            field.onChange(parseInt(value));
                          }}
                          defaultValue={field.value?.toString() || ""}
                          name="categoryId"
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="printLocations"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Imprimir en</FormLabel>
                          <FormDescription>
                            Selecciona dónde quieres imprimir el ticket
                          </FormDescription>
                        </div>
                        {printLocations.map((location) => (
                          <FormField
                            key={location}
                            control={form.control}
                            name="printLocations"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={location}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(location)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              location,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== location
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {location}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ingredients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ingredientes</FormLabel>
                        <FormControl>
                          <div>
                            {field.value.map((ingredient, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 mb-4 flex-wrap md:flex-nowrap"
                              >
                                <Select
                                  value={ingredient.inventoryProductId?.toString()}
                                  onValueChange={(value) => {
                                    const newIngredients = [...field.value];
                                    newIngredients[index].inventoryProductId =
                                      parseInt(value);
                                    field.onChange(newIngredients);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue
                                      className="min-w-fit"
                                      placeholder="Selecciona un ingrediente"
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {stockItems.map((item) => (
                                      <SelectItem
                                        key={item.id}
                                        value={item.id.toString()}
                                      >
                                        {item.name} - {item.unit}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Input
                                  type="number"
                                  value={ingredient.quantityUsed}
                                  onChange={(e) => {
                                    const newIngredients = [...field.value];
                                    newIngredients[index].quantityUsed =
                                      parseFloat(e.target.value);
                                    field.onChange(newIngredients);
                                  }}
                                  placeholder="Cantidad"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  onClick={() => {
                                    const newIngredients = field.value.filter(
                                      (_, i) => i !== index
                                    );
                                    field.onChange(newIngredients);
                                  }}
                                >
                                  Eliminar
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              onClick={() => {
                                field.onChange([
                                  ...field.value,
                                  { quantityUsed: 0 },
                                ]);
                              }}
                            >
                              {field.value.length === 0
                                ? "Agregar nuevo ingrediente"
                                : "Agregar otro ingrediente"}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col gap-2">
                    <FormField
                      control={form.control}
                      name="variablePrice"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Precio variable</FormLabel>
                            <FormDescription>
                              Permitir cambiar el precio en ocasiones especiales
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Activo</FormLabel>
                            <FormDescription>
                              ¿Este artículo está disponible?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
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
        <div className="text-center">No hay artículos</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHeadSet
                columns={tableHeaderColumns}
                sortConfig={sortConfig}
                sortFunction={sortItems}
              />
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                className={item.isActive ? "" : "bg-red-100"}
              >
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>
                  {categories.find(
                    (category) => category.id === item.categoryId
                  )?.name || "Categoría inexistente"}
                </TableCell>
                <TableCell>
                  {item.printLocations.length > 0
                    ? item.printLocations.join(", ")
                    : "No imprimir"}
                </TableCell>
                <TableCell>{item.variablePrice ? "Sí" : "No"}</TableCell>
                <TableCell>
                  <Badge
                    className={item.isActive ? "bg-green-600" : "bg-red-600"}
                  >
                    {item.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ul>
                    {item.ingredients.map((ing) => (
                      <li key={ing.id}>
                        {ing.stockItem.name}: {ing.quantityUsed}{" "}
                        {ing.stockItem.unit}
                      </li>
                    ))}
                  </ul>
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
                      size="icon"
                    >
                      <Trash2 className="h-4 w-4" />
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
