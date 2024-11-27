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
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { NewPromo, Promo, SortableColumn } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Pencil, Percent, PlusCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
import useSortConfig from "@/lib/useSortConfig";
import SortableTableHeadSet from "@/components/SortableTableHeadSet";

type DaysOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

interface FormValues {
  menuItemId: number;
  startDate: Date;
  endDate: Date;
  type: string;
  discount?: number;
  buy_quantity?: number;
  pay_quantity?: number;
  percentage?: number;
  always: boolean;
  isActive: boolean;
  recurrentDateId?: number;
  name: string;
  availability: {
    [key: string]: {
      startTime: string | null; // Permitir null
      endTime: string | null; // Permitir null
    };
  };
}
const availabilitySchema = z.object({
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
});

const formSchema = z
  .object({
    menuItemId: z
      .number()
      .int("Debe ser un número entero")
      .min(1, "El ID del elemento del menú es requerido"),
    startDate: z
      .date()
      .refine((value) => !isNaN(value.getTime()), "Fecha de inicio inválida"),
    endDate: z
      .date()
      .refine((value) => !isNaN(value.getTime()), "Fecha de término inválida"),
    type: z.string().trim().min(1, "El tipo es requerido"),
    discount: z
      .number()
      .min(0, "El descuento no puede ser negativo")
      .optional(),
    buy_quantity: z
      .number({ invalid_type_error: "Debe ser un número válido" })
      .int("Debe ser un número entero")
      .min(1, "La cantidad de compra mínima es 1")
      .optional(),
    pay_quantity: z
      .number({ invalid_type_error: "Debe ser un número válido" })
      .int("Debe ser un número entero")
      .min(1, "La cantidad de pago mínima es 1")
      .optional(),
    percentage: z
      .number({ invalid_type_error: "Debe ser un número válido" })
      .min(0.01, "El porcentaje debe ser mayor a 0.01")
      .max(100, "El porcentaje no puede ser mayor al 100%")
      .optional(),
    always: z.boolean(),
    isActive: z.boolean(),
    recurrentDateId: z
      .number()
      .int("Debe ser un número entero")
      .min(0, "El ID de fecha recurrente no puede ser negativo")
      .optional(),
    name: z.string().trim().min(1, "El nombre es requerido"),
    availability: z.record(z.string(), availabilitySchema).default({}), // Permitir cualquier combinación de días y horarios
  })
  .refine((data) => data.buy_quantity > data.pay_quantity, {
    message: "La cantidad de compra debe ser menor que la cantidad de pago",
    path: ["pay_quantity"], // Indica el campo que causa el error
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
      Object.values(data.availability).some(
        (day) => day.startTime || day.endTime
      ),
    {
      message: "Al menos un día debe tener un horario definido.",
      path: ["availability"],
    }
  );

const fetchPromos = async (): Promise<Promo[]> => {
  const response = await fetch(
    "http://localhost:3000/promos/promos-with-availability"
  );
  const data: Promo[] = await response.json();

  data.forEach((promo) => {
    promo.startDate = new Date(promo.startDate);
    promo.endDate = new Date(promo.endDate);
  });

  console.log("Datos de promociones con fecha convertida:", data);

  return data;
};

const createPromo = async (values: FormValues): Promise<Promo> => {
  const payload: Promo = {
    ...values,
  };

  console.log("estoy en createPromo y esta es la availability ", values);

  const response = await fetch(
    "http://localhost:3000/promos/promos-with-availability",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

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
    console.log("Datos enviados en savePromo:", JSON.stringify(promo, null, 2));

    const response = await fetch(
      `http://localhost:3000/promos/promos-with-availability/${promo.id}`,
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
    console.log("Promoción actualizada:", data);

    return { ...promo, id: data.id };
  } catch (error) {
    console.error("Error en savePromo:", error);
    throw error;
  }
};

// const deletePromo = async (id: number): Promise<void> => {
//    const response = await fetch(`${FETCH_BASE_URL}/menu-item/${id}`, {
//       method: "DELETE",
//    });
//    if (!response.ok) throw new Error("Error al eliminar la promoción");
// };

const tableHeaderColumns: SortableColumn<Promo>[] = [
  { key: "menuItemId", label: "Artículo" },
  { key: "name", label: "Nombre" },
  { key: "startDate", label: "Fecha de inicio" },
  { key: "endDate", label: "Fecha de fin" },
  { key: "type", label: "Tipo" },
  { key: "discount", label: "Descuento" },
  { key: "buy_quantity", label: "Compra" },
  { key: "pay_quantity", label: "Paga" },
  { key: "percentage", label: "Porcentaje" },
  { key: "always", label: "¿Siempre activo?" },
  { key: "isActive", label: "Estado" },
  { key: "availability", label: "Días" },
];

export default function Promos() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [selectedType, setSelectedType] = useState("");
  const { toast } = useToast();
  const { sortConfig, sortItems: sortPromos } = useSortConfig<Promo>(setPromos);

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

  const alert = (title: string, description: string, status?: string) =>
    toast({
      title,
      description,
      variant: status === "error" ? "destructive" : "default",
    });

  const defaultValues: FormValues = {
    menuItemId: 0,
    startDate: new Date(), // no null, solo un Date válido
    endDate: new Date(),
    type: "",
    always: false,
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
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema), // Desactiva la validación temporalmente
    defaultValues,
  });

  useEffect(() => {
    fetchPromos().then(setPromos);
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("editingPromo:", editingPromo);

    try {
      console.log("Enviando datos originales desde el formulario:", values);

      // Si no estamos editando una promoción, creamos una nueva
      if (!editingPromo) {
        const newPromo = await createPromo(values);
        console.log("Nueva promoción creada:", newPromo);

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
      console.log(
        "Error al crear promoción",
        "Por favor, verifica los datos ingresados.",
        "error"
      );
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

          <DialogContent className="sm:max-w-[1000px] max-h-[95vh] overflow-y-auto">
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
                              field.onChange(new Date(e.target.value));
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
                              field.onChange(new Date(e.target.value));
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
                        <FormLabel>Artículo</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Id"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
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
                            <div className=" flex items-center">
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
                            <div className="flex items-center">
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
                        name={`availability.${daysInEnglish[index]}.startTime`} // Índice numérico en lugar de daysInEnglish[index]
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="time"
                                className="w-full sm:w-auto"
                                {...field}
                                value={field.value || ""} // Proporcionamos un valor predeterminado si field.value es undefined
                                onChange={(e) => field.onChange(e.target.value)} // Aseguramos que el valor se actualice correctamente
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <span className="font-medium sm:mx-2">a</span>

                      <FormField
                        control={form.control}
                        name={`availability.${daysInEnglish[index]}.endTime`} // Índice numérico en lugar de daysInEnglish[index]
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="time"
                                className="w-full sm:w-auto"
                                {...field}
                                value={field.value || ""} // Proporcionamos un valor predeterminado si field.value es undefined
                                onChange={(e) => field.onChange(e.target.value)} // Aseguramos que el valor se actualice correctamente
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}

                  <div className="invisible"></div>

                  <FormField
                    control={form.control}
                    name="always"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {promos.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell>{promo.menuItemId}</TableCell>
                <TableCell>{promo.name}</TableCell>
                <TableCell>
                  {new Date(promo.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(promo.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{promo.type}</TableCell>
                <TableCell>{promo.discount}</TableCell>
                <TableCell>{promo.buy_quantity}</TableCell>
                <TableCell>{promo.pay_quantity}</TableCell>
                <TableCell>{promo.percentage}</TableCell>
                <TableCell>{promo.always ? "Si" : "No"}</TableCell>
                <TableCell>{promo.isActive ? "Activo" : "Inactivo"}</TableCell>
                <TableCell>
                  {Object.entries(promo.availability)
                    .filter(
                      ([day, { startTime, endTime }]) =>
                        startTime !== null && endTime !== null
                    )
                    .map(([day, { startTime, endTime }]) => (
                      <div key={day}>
                        {day}: {startTime} - {endTime}
                      </div>
                    ))}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(promo)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(promo.id)}
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
