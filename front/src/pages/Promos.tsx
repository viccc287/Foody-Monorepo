import AlertDialogTrash from "@/components/AlertDialogTrash";
import SortableTableHeadSet from "@/components/SortableTableHeadSet";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import useSortConfig from "@/lib/useSortConfig";
import { FormValues, MenuItem, NewPromo, Promo, SortableColumn } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Edit2, Percent, PlusCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const availabilitySchema = z.object({
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
});

const formSchema = z
  .object({
    menuItemId: z
      .number({ required_error: "El artículo del menú es requerido" })
      .int("Debe ser un número entero"),
    startDate: z
      .date()
      .refine((value) => !isNaN(value.getTime()), "Fecha de inicio inválida"),
    endDate: z
      .date()
      .refine((value) => !isNaN(value.getTime()), "Fecha de término inválida"),
    type: z.string().trim().min(1, "El tipo es requerido"),
    discount: z
      .number()
      .min(0.01, "El descuento debe ser mayor a 0.01")
      .nullable(),
    buy_quantity: z
      .number({ invalid_type_error: "Debe ser un número válido" })
      .int("Debe ser un número entero")
      .min(1, "La cantidad de compra mínima es 1")
      .nullable(),
    pay_quantity: z
      .number({ invalid_type_error: "Debe ser un número válido" })
      .int("Debe ser un número entero")
      .min(1, "La cantidad de pago mínima es 1")
      .nullable(),
    percentage: z
      .number({ invalid_type_error: "Debe ser un número válido" })
      .min(0.01, "El porcentaje debe ser mayor a 0.01")
      .max(100, "El porcentaje no puede ser mayor al 100%")
      .nullable(),
    always: z.boolean(),
    isActive: z.boolean(),
    recurrentDateId: z
      .number()
      .int("Debe ser un número entero")
      .min(0, "El ID de fecha recurrente no puede ser negativo")
      .optional(),
    name: z.string().trim().min(1, "El nombre es requerido"),
    availability: z.record(z.string(), availabilitySchema), // Permitir cualquier combinación de días y horarios
  })
  .refine(
    (data) => {
      if (data.type === "price_discount") {
        return data.discount !== undefined;
      }
      if (data.type === "percentage_discount") {
        return data.percentage !== undefined;
      }
      if (data.type === "buy_x_get_y") {
        return (
          data.pay_quantity !== undefined && data.buy_quantity !== undefined
        );
      }
      return true;
    },
    {
      message: "Faltan campos requeridos según el tipo seleccionado",
      path: ["type"],
    }
  )
  .refine(
    (data) =>
      data.always ||
      Object.values(data.availability).some(
        (day) => day.startTime && day.endTime
      ),
    {
      message: "Al menos un día debe tener un horario definido. Selecciona 'Siempre' si la promoción estará activa todo el tiempo",
      path: ["availability"],
    }
  )
  .refine(
    (data) =>
      data.type !== "buy_x_get_y" ||
      (data.buy_quantity !== undefined &&
        data.pay_quantity !== undefined &&
        data.buy_quantity !== null && data.pay_quantity !== null && data.buy_quantity > data.pay_quantity),
    {
      message: "La cantidad que se paga debe ser menor que la que se lleva",
      path: ["pay_quantity"],
    }
  )
  .refine((data) => data.startDate <= data.endDate, {
    message: "La fecha de término no puede ser anterior a la fecha de inicio",
    path: ["endDate"],
  })
  .refine(
    (data) =>
      Object.values(data.availability).every(
        (day) => !day.startTime || !day.endTime || day.startTime < day.endTime
      ),
    {
      message: "La hora de término no puede ser anterior a la hora de inicio",
      path: ["availability"],
    }
  );

const MENUITEM_FETCH_URL = "http://localhost:3000/menu/menu-items";
const BASE_FETCH_URL = "http://localhost:3000/promos";

const fetchPromos = async (): Promise<Promo[]> => {
  const response = await fetch(
    "http://localhost:3000/promos/promos-with-availability"
  );
  const data: Promo[] = await response.json();

  data.forEach((promo) => {
    promo.startDate = new Date(promo.startDate);
    promo.endDate = new Date(promo.endDate);
  });

  return data;
};

const fetchMenuItems = async (): Promise<MenuItem[]> => {
  const response = await fetch(MENUITEM_FETCH_URL);
  const data: MenuItem[] = await response.json();
  return data;
};

const createPromo = async (values: FormValues): Promise<Promo> => {
  const payload: NewPromo = {
    ...values,
  };

  const response = await fetch(`${BASE_FETCH_URL}/promos-with-availability`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorResponse = await response.text();
    console.error("Error al crear la promoción:", errorResponse);
    throw new Error("Error al crear la promoción");
  }

  const data = await response.json();

  return { ...payload, id: data.id }; // O ajusta según necesites devolver
};

const savePromo = async (promo: Promo): Promise<Promo> => {
  try {
    const response = await fetch(
      `${BASE_FETCH_URL}/promos-with-availability/${promo.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(promo),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al actualizar la promoción: ${response.status}`);
    }

    const data = await response.json();

    return { ...promo, id: data.id };
  } catch (error) {
    console.error("Error en savePromo:", error);
    throw error;
  }
};

const deletePromo = async (id: number): Promise<void> => {
  const response = await fetch(
    `${BASE_FETCH_URL}/promos-with-availability/${id}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) throw new Error("Error al eliminar la promoción");
};

const tableHeaderColumns: SortableColumn<Promo>[] = [
  { key: "name", label: "Nombre" },
  { key: "menuItemId", label: "Artículo" },
  { key: "startDate", label: "Fecha de inicio" },
  { key: "endDate", label: "Fecha de fin" },
  { key: "type", label: "Tipo" },
  { key: "discount", label: "Descuento" },
  { key: "buy_quantity", label: "Lleva" },
  { key: "pay_quantity", label: "Paga" },
  { key: "percentage", label: "Porcentaje" },
  { key: "always", label: "¿Siempre activo?" },
  { key: "isActive", label: "Estado" },
  { key: "availability", label: "Días" },
];

const daysInSpanish = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const daysInEnglish = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const typesInSpanish = {
  price_discount: "Descuento por precio",
  percentage_discount: "Descuento por porcentaje",
  buy_x_get_y: "Paga X lleva Y",
};

const daysTranslations = {
  Monday: "Lunes",
  Tuesday: "Martes",
  Wednesday: "Miércoles",
  Thursday: "Jueves",
  Friday: "Viernes",
  Saturday: "Sábado",
  Sunday: "Domingo",
};

export default function Promos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [selectedType, setSelectedType] = useState("");
  const { toast } = useToast();
  const { sortConfig, sortItems: sortPromos } = useSortConfig<Promo>(setPromos);

  const alert = (title: string, description: string, status?: string) =>
    toast({
      title,
      description,
      variant: status === "error" ? "destructive" : "default",
    });

  const defaultValues: FormValues = {
    menuItemId: null,
    startDate: new Date(new Date().setHours(0, 0, 0, 0)), // Primera hora de hoy
    endDate: new Date(new Date().setHours(24, 0, 0, 0)), // Primera hora de mañana
    type: "",
    always: true,
    isActive: true,
    name: "",
    availability: {
      Monday: { startTime: null, endTime: null },
      Tuesday: { startTime: null, endTime: null },
      Wednesday: { startTime: null, endTime: null },
      Thursday: { startTime: null, endTime: null },
      Friday: { startTime: null, endTime: null },
      Saturday: { startTime: null, endTime: null },
      Sunday: { startTime: null, endTime: null },
    },
    discount: null,
    buy_quantity: null,
    pay_quantity: null,
    percentage: null,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    fetchPromos().then(setPromos);
    fetchMenuItems().then(setMenuItems);
  }, []);

  useEffect(() => {
    if (!isDialogOpen) setSelectedType("");
  }, [isDialogOpen]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Si no estamos editando una promoción, creamos una nueva
      if (!editingPromo) {
        const newPromo = await createPromo(values);

        // Actualizamos la lista de promociones
        setPromos([...promos, newPromo]);

        // Mostrar alerta de éxito
        alert(
          "Promoción creada correctamente",
          "La promoción ha sido creada exitosamente."
        );
      } else {
        const updatedPromo = await savePromo({
          ...values,
          id: editingPromo.id,
        });
        setPromos(
          promos.map((promo) =>
            promo.id === updatedPromo.id ? updatedPromo : promo
          )
        );
        alert("Promoción actualizada", "Promoción actualizada correctamente");
      }

      // Restablecer el formulario y cerrar el diálogo
      setIsDialogOpen(false);
      setEditingPromo(null);
      form.reset(defaultValues);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  };

  const handleEdit = (promo: Promo) => {
    form.reset(promo);
    setEditingPromo(promo);
    setSelectedType(promo.type);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePromo(id);
      setPromos((prev) => prev.filter((promo) => promo.id !== id));
      alert(
        "Promoción eliminada",
        "La promoción ha sido eliminado correctamente"
      );
    } catch (error) {
      let message = "Error inesperado";
      if (error instanceof Error) {
        message = error.message;
      }
      alert("Error", message, "error");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Promos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingPromo(null);
                form.reset(defaultValues);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar promo
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[1000px] max-h-[90svh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPromo ? "Editar" : "Agregar"} promoción
              </DialogTitle>
              <DialogDescription>
                {editingPromo
                  ? "Edita los detalles de la promoción"
                  : "Agrega una nueva promoción"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                /* onSubmit={(e) => {
                  e.preventDefault();
                  const results = formSchema.safeParse(form.getValues());

                  if (!results.success) {
                    console.error("Errores de validación:", results.error.errors);
                    return;
                  }
              
                  form.handleSubmit(onSubmit)();
                }} */
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col space-y-4"
              >
                <div className="gap-4 grid grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Nombre de la promoción</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de inicio</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            placeholder="Fecha de inicio"
                            {...field}
                            value={
                              field.value instanceof Date
                                ? field.value.toISOString().split("T")[0]
                                : field.value || "" // Si es cadena, úsala directamente
                            }
                            onChange={(e) => {
                              // Convierte la cadena de entrada a un objeto Date antes de actualizar el campo
                              field.onChange(
                                new Date(e.target.value + "T00:00:00")
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de fin</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            placeholder="Fecha de fin"
                            {...field}
                            value={
                              field.value instanceof Date
                                ? field.value.toISOString().split("T")[0]
                                : field.value || "" // Si es cadena, úsala directamente
                            }
                            onChange={(e) => {
                              // Convierte la cadena de entrada a un objeto Date antes de actualizar el campo
                              field.onChange(
                                new Date(e.target.value + "T00:00:00")
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="menuItemId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Artículo del menú</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(parseInt(value));
                          }}
                          defaultValue={field.value?.toString() || ""}
                          name="menuItemId"
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un artículo del menú" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {menuItems.map((menuItem) => (
                              <SelectItem
                                key={menuItem.id}
                                value={menuItem.id.toString()}
                              >
                                {menuItem.name}
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mr-2">Tipo</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedType(value);
                            }}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="price_discount">
                                Descuento por precio
                              </SelectItem>
                              <SelectItem value="percentage_discount">
                                Descuento por porcentaje
                              </SelectItem>
                              <SelectItem value="buy_x_get_y">
                                Paga X lleva Y
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedType === "price_discount" && (
                    <FormField
                      control={form.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem className="col-span-2 w-fit">
                          <FormLabel>Descuento</FormLabel>
                          <FormControl>
                            <div className=" flex items-center gap-1">
                              <DollarSign size={16} />
                              <Input
                                type="number"
                                step="0.5"
                                placeholder="Descuento"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? parseFloat(e.target.value)
                                      : null
                                  )
                                }
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedType === "percentage_discount" && (
                    <FormField
                      control={form.control}
                      name="percentage"
                      render={({ field }) => (
                        <FormItem className="col-span-2 w-fit">
                          <FormLabel>Porcentaje</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                placeholder="Porcentaje"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? parseFloat(e.target.value)
                                      : null
                                  )
                                }
                              />
                              <Percent size={16} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {selectedType === "buy_x_get_y" && (
                    <div className="flex gap-12 col-span-2">
                      <FormField
                        control={form.control}
                        name="buy_quantity"
                        render={({ field }) => (
                          <FormItem className="w-fit">
                            <FormLabel>Lleva</FormLabel>
                            <FormControl>
                              <div className=" flex items-center">
                                <Input
                                  type="number"
                                  step="1.0"
                                  placeholder="Y"
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : null
                                    )
                                  }
                                />
                                <FormDescription className="ms-2">
                                  unidades
                                </FormDescription>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pay_quantity"
                        render={({ field }) => (
                          <FormItem className="w-fit">
                            <FormLabel>Paga</FormLabel>
                            <FormControl>
                              <div className=" flex items-center">
                                <Input
                                  type="number"
                                  step="1.0"
                                  placeholder="X"
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? parseFloat(e.target.value)
                                        : null
                                    )
                                  }
                                />
                                <FormDescription className="ms-2">
                                  unidades
                                </FormDescription>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {daysInSpanish.map((day, index) => (
                    <div
                      key={day}
                      className="flex flex-col sm:flex-row gap-4 sm:gap-2 items-center"
                    >
                      <div className="w-32 sm:w-20 text-sm font-medium">
                        {day}
                      </div>
                      <FormField
                        control={form.control}
                        name={`availability.${daysInEnglish[index]}.startTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="time"
                                className="w-full sm:w-auto"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <span className="font-medium sm:mx-2">a</span>

                      <FormField
                        control={form.control}
                        name={`availability.${daysInEnglish[index]}.endTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="time"
                                className="w-full sm:w-auto"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          form.setValue(
                            `availability.${daysInEnglish[index]}.startTime`,
                            null
                          );
                          form.setValue(
                            `availability.${daysInEnglish[index]}.endTime`,
                            null
                          );
                        }}
                      >
                        <Trash />
                      </Button>
                    </div>
                  ))}

                  {form.formState.errors.availability && (
                    <FormMessage>
                      {form.formState.errors.availability?.root?.message}
                    </FormMessage>
                  )}

                  <div className="flex gap-2 col-span-2">
                    <FormField
                      control={form.control}
                      name="always"
                      render={({ field }) => (
                        <FormItem className="flex w-1/2 flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              name="always"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Siempre</FormLabel>
                            <FormDescription>
                              ¿Esta promoción estará activa siempre?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="w-1/2 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              name="isActive"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Activo</FormLabel>
                            <FormDescription>
                              ¿Esta promoción está activa?
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
      {promos.length === 0 ? (
        <div className="text-center">No hay promociones</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHeadSet
                columns={tableHeaderColumns}
                sortConfig={sortConfig}
                sortFunction={sortPromos}
              />
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promos.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell>{promo.name}</TableCell>
                <TableCell>{promo.menuItemId}</TableCell>
                <TableCell>
                  {new Date(promo.startDate).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(promo.endDate).toLocaleString()}
                </TableCell>
                <TableCell>
                  {typesInSpanish[promo.type as keyof typeof typesInSpanish]}
                </TableCell>
                <TableCell
                  className={
                    promo.type === "price_discount" ? "text-green-600" : ""
                  }
                >
                  {promo.type === "price_discount" && `$${promo.discount}`}
                </TableCell>
                <TableCell
                  className={
                    promo.type === "buy_x_get_y" ? "text-green-600" : ""
                  }
                >
                  {promo.type === "buy_x_get_y" && promo.buy_quantity}
                </TableCell>
                <TableCell
                  className={
                    promo.type === "buy_x_get_y" ? "text-green-600" : ""
                  }
                >
                  {promo.type === "buy_x_get_y" && promo.pay_quantity}
                </TableCell>
                <TableCell
                  className={
                    promo.type === "percentage_discount" ? "text-green-600" : ""
                  }
                >
                  {promo.type === "percentage_discount" &&
                    `${promo.percentage}%`}
                </TableCell>
                <TableCell>{promo.always ? "Si" : "No"}</TableCell>
                <TableCell>
                  <Badge
                    className={promo.isActive ? "bg-green-600" : "bg-red-600"}
                  >
                    {promo.isActive ? "Activa" : "Inactiva"}
                    {new Date(promo.endDate) < new Date() && " (Expirada)"}
                  </Badge>
                </TableCell>

                <TableCell>
                  <ul>
                    {Object.entries(promo.availability)
                      .filter(
                        ([, { startTime, endTime }]) =>
                          startTime !== null && endTime !== null
                      )
                      .map(([day, { startTime, endTime }]) => (
                        <li key={day}>
                          {
                            daysTranslations[
                              day as keyof typeof daysTranslations
                            ]
                          }
                          : {startTime} - {endTime}
                        </li>
                      ))}
                  </ul>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(promo)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialogTrash
                      itemToDelete={promo}
                      handleDelete={handleDelete}
                    />
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
