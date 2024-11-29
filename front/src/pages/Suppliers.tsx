import SortableTableHeader from "@/components/SortableTableHeadSet";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import useSortConfig from "@/lib/useSortConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import ConfirmActionDialogButton from "@/components/ConfirmActionDialogButton";
import { NewSupplier, SortableColumn, Supplier } from "@/types";

const formSchema = z.object({
  name: z.string().trim().min(1, "Nombre requerido"),
  phone: z.string().trim().optional(),
  email: z.union([z.literal(""), z.string().email("Email inválido")]),
  address: z.string().trim().optional(),
});

const FETCH_BASE_URL = import.meta.env.VITE_SERVER_URL + "/suppliers";

const fetchSuppliers = async (): Promise<Supplier[]> => {
  const response = await fetch(FETCH_BASE_URL);
  if (!response.ok) throw new Error("Error al obtener los proveedores");
  const data: Supplier[] = await response.json();
  return data;
};

const saveSupplier = async (supplier: Supplier): Promise<Supplier> => {
  const response = await fetch(`${FETCH_BASE_URL}/${supplier.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(supplier),
  });
  if (!response.ok) throw new Error("Error al guardar el proveedor");
  return supplier;
};

const createSupplier = async (values: NewSupplier): Promise<Supplier> => {
  const response = await fetch(FETCH_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
  if (!response.ok) throw new Error("Error al crear el proveedor");
  const data = await response.json();
  return { ...values, id: data.id };
};

const deleteSupplier = async (id: number): Promise<void> => {
  const response = await fetch(`${FETCH_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Error al eliminar el proveedor");
};

const tableHeaderColumns: SortableColumn<Supplier>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Nombre" },
  { key: "phone", label: "Teléfono" },
  { key: "email", label: "Email" },
  { key: "address", label: "Dirección" },
];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const { sortConfig, sortItems: sortSuppliers } =
    useSortConfig<Supplier>(setSuppliers);

  const { toast } = useToast();

  const alert = (title: string, description: string, status?: string) =>
    toast({
      title,
      description,
      variant: status === "error" ? "destructive" : "default",
    });

  const defaultValues: NewSupplier = {
    name: "",
    phone: "",
    email: "",
    address: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    fetchSuppliers()
      .then(setSuppliers)
      .catch((error) => {
        alert("Error", error.message, "error");
      });
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!editingSupplier) {
        const newSupplier = await createSupplier(values);
        setSuppliers([...suppliers, newSupplier]);
        alert(
          "Proveedor agregado",
          "El proveedor ha sido agregado correctamente"
        );
      } else {
        const updatedSupplier = await saveSupplier({
          ...values,
          id: editingSupplier.id,
        });
        setSuppliers((prev) =>
          prev.map((sup) =>
            sup.id === updatedSupplier.id ? updatedSupplier : sup
          )
        );
        alert(
          "Proveedor actualizado",
          "El proveedor ha sido actualizado correctamente"
        );
      }
      setIsDialogOpen(false);
      setEditingSupplier(null);
      form.reset(defaultValues);
    } catch (error) {
      alert(
        "Error",
        error instanceof Error ? error.message : String(error),
        "error"
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSupplier(id);
      setSuppliers((prev) => prev.filter((sup) => sup.id !== id));
      alert(
        "Proveedor eliminado",
        "El proveedor ha sido eliminado correctamente"
      );
    } catch (error) {
      alert(
        "Error",
        error instanceof Error ? error.message : String(error),
        "error"
      );
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.reset(supplier);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Proveedores</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingSupplier(null);
                form.reset(defaultValues);
                setIsDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar proveedor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1000px] overflow-y-auto max-h-[90svh]">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? "Editar" : "Agregar"} proveedor
              </DialogTitle>
              <DialogDescription>
                {editingSupplier
                  ? "Edita los detalles del proveedor"
                  : "Agrega un nuevo proveedor"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del proveedor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Teléfono del proveedor"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email del proveedor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Dirección del proveedor"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="submit">
                    {editingSupplier ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      {suppliers.length === 0 ? (
        <div className="text-center">No hay proveedores disponibles</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHeader<Supplier>
                columns={tableHeaderColumns}
                sortConfig={sortConfig}
                sortFunction={sortSuppliers}
              />
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.id}</TableCell>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.address}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(supplier)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <ConfirmActionDialogButton
                      onConfirm={() => handleDelete(supplier.id)}
                      title="Eliminar proveedor"
                      description="¿Estás seguro de que deseas eliminar este proveedor?"
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
