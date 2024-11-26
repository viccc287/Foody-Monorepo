import { useState, useEffect } from "react";
import { PlusCircle, Pencil, Trash, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useToast } from "@/hooks/use-toast";

type StockItem = {
  id: number;
  name: string;
  stock: number;
  unit: string;
  isActive: boolean;
  family: string;
  supplier: string;
  cost: number;
};

type Ingredient = {
  id: number;
  menuItemId: number;
  inventoryProductId: number;
  quantityUsed: number;
  stockItem: StockItem;
};

type MenuItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  isActive: boolean;
  family: string;
  supplier: string;
  printLocations: string[];
  variablePrice: boolean;
  price: number;
  ingredients: Ingredient[];
};

const printLocations = ["Cocina", "Caja", "Barra"];

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
  quantity: z
    .number({ invalid_type_error: "Cantidad requerida" })
    .min(1, "La cantidad debe ser mayor a 0"),
  unit: z.string().trim().min(1, "Unidad requerida"),
  isActive: z.boolean(),
  family: z.string().trim().min(1, "Familia requerida"),
  supplier: z.string().trim().min(1, "Proveedor requerido"),
  printLocations: z.array(z.string()),
  variablePrice: z.boolean(),
  price: z
    .number({ invalid_type_error: "Precio requerido" })
    .min(0, "El precio debe ser mayor o igual a 0")
    .multipleOf(0.01, "El precio debe ser múltiplo de 0.01"),
  ingredients: z.array(
    z.object({
      inventoryProductId: z.number().min(1, "Ingrediente requerido"),
      quantityUsed: z.number().min(0, "La cantidad debe ser mayor a 0"),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

const FETCH_BASE_URL = "http://localhost:3000/menu";

const fetchItems = async (): Promise<MenuItem[]> => {
  const response = await fetch(`${FETCH_BASE_URL}/menu-items-with-ingredients`);
  const data: MenuItem[] = await response.json();
  console.log(data);

  return data;
};

const fetchStockItems = async (): Promise<StockItem[]> => {
  const response = await fetch(`${FETCH_BASE_URL}/stock-items`);
  const data: StockItem[] = await response.json();

  return data;
};

const saveItem = async (item: MenuItem): Promise<MenuItem> => {
  const response = await fetch(`${FETCH_BASE_URL}/menu-items/${item.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  console.log("itemSave: ", item);

  if (!response.ok) throw new Error("Error al guardar el artículo");

  const data = await response.json();
  console.log("dataSave: ", data);

  return data;
};

const createItem = async (values: FormValues): Promise<MenuItem> => {
  const response = await fetch(`${FETCH_BASE_URL}/menu-items`, {
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
  const response = await fetch(`${FETCH_BASE_URL}/menu-item/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Error al eliminar el artículo");
};

export default function MenuItems() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const { toast } = useToast();

  const alert = (title: string, description: string, status?: string) =>
    toast({
      title,
      description,
      variant: status === "error" ? "destructive" : "default",
    });

  const defaultValues: FormValues = {
    name: "",
    quantity: 1,
    unit: "",
    isActive: true,
    family: "",
    supplier: "",
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
          <DialogContent className="sm:max-w-[1000px]">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Editar" : "Agregar"} artículo
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Edita los detalles del artículo"
                  : "Agrega un nuevo artículo"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                name="articleForm"
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
                    name="family"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Familia</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          name="family"
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una familia" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {families.map((family) => (
                              <SelectItem key={family} value={family}>
                                {family}
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
                    name="supplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proveedor</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          name="supplier"
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un proveedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier} value={supplier}>
                                {supplier}
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
                    render={({ field }) => (
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
                                  value={ingredient.inventoryProductId.toString()}
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
                                  { inventoryProductId: 0, quantityUsed: 0 },
                                ]);
                              }}
                            >
                              Agregar otro ingrediente
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Familia</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Imprimir en</TableHead>
              <TableHead>Precio variable</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ingredientes</TableHead>
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
                <TableCell>{item.price.toFixed(2)}</TableCell>
                <TableCell>{item.family}</TableCell>
                <TableCell>{item.supplier}</TableCell>
                <TableCell>
                  {item.printLocations.length > 0
                    ? item.printLocations.join(", ")
                    : "No imprimir"}
                </TableCell>
                <TableCell>{item.variablePrice ? "Sí" : "No"}</TableCell>
                <TableCell
                  className={item.isActive ? "text-green-600" : "text-red-600"}
                >
                  {item.isActive ? "Activo" : "Inactivo"}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
