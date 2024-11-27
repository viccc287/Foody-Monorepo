import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { ChevronsUpDown, Edit2, PlusCircle, Trash2 } from "lucide-react";

import { Category, NewCategory, SortableColumn } from "@/types";
import useSortConfig from "@/lib/useSortConfig";
import SortableTableHeadSet from "@/components/SortableTableHeadSet";

const types = ["menu", "stock"];

const formSchema = z.object({
  name: z.string().trim().min(1, "Nombre requerido"),
  description: z.string().trim().optional(),
  type: z.string().trim().min(1, "Tipo requerido"),
});

const FETCH_BASE_URL = "http://localhost:3000/categories";

const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch(FETCH_BASE_URL);
  const data: Category[] = await response.json();
  return data;
};

const saveCategory = async (category: Category): Promise<Category> => {
  const response = await fetch(`${FETCH_BASE_URL}/${category.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(category),
  });
  if (!response.ok) throw new Error("Error al guardar la categoría");
  return category;
};

const createCategory = async (values: NewCategory): Promise<Category> => {
  const response = await fetch(FETCH_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) throw new Error("Error al crear la categoría");
  const data = await response.json();

  return { ...values, id: data.id };
};

const deleteCategory = async (id: number): Promise<void> => {
  const response = await fetch(`${FETCH_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Error al eliminar la categoría");
};

const tableHeaderColumns: SortableColumn<Category>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Nombre" },
  { key: "description", label: "Descripción" },
  { key: "type", label: "Tipo" },
];

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { sortConfig, sortItems: sortCategories } =
    useSortConfig<Category>(setCategories);

  const { toast } = useToast();

  const alert = (title: string, description: string, status?: string) =>
    toast({
      title,
      description,
      variant: status === "error" ? "destructive" : "default",
    });

  const toggleSortOrder = useCallback(() => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    setCategories((prevCategories) =>
      [...prevCategories].sort((a, b) => {
        const comparison = a.type.localeCompare(b.type);
        return newOrder === "asc" ? comparison : -comparison;
      })
    );
  }, [sortOrder]);

  const defaultValues: NewCategory = {
    name: "",
    description: "",
    type: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((error) => {
        alert("Error", error.message, "error");
      });
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!editingCategory) {
        const newCategory = await createCategory(values);
        setCategories([...categories, newCategory]);
        alert(
          "Categoría agregada",
          "La categoría ha sido agregada correctamente"
        );
      } else {
        const updatedCategory = await saveCategory({
          ...values,
          id: editingCategory.id,
        });
        const updatedCategories = categories.map((category) =>
          category.id === updatedCategory.id ? updatedCategory : category
        );
        setCategories(updatedCategories);
        alert(
          "Categoría actualizada",
          "La categoría ha sido actualizada correctamente"
        );
      }
      setIsDialogOpen(false);
      setEditingCategory(null);
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
      await deleteCategory(id);
      setCategories((prev) => prev.filter((category) => category.id !== id));
      alert(
        "Categoría eliminada",
        "La categoría ha sido eliminada correctamente"
      );
    } catch (error) {
      let message = "Error inesperado";
      if (error instanceof Error) {
        message = error.message;
      }
      alert("Error", message, "error");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset(category);
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categorías</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCategory(null);
                form.reset(defaultValues);
                setIsDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[1000px] overflow-y-auto max-h-[90svh]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar" : "Agregar"} categoría
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Edita los detalles de la categoría"
                  : "Agrega una nueva categoría"}
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
                        <Input
                          placeholder="Nombre de la categoría"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Descripción de la categoría"
                          {...field}
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
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {types.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type === "menu"
                                  ? "Categoría de menú"
                                  : "Categoría de inventario"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingCategory ? "Guardar cambios" : "Agregar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      {categories.length === 0 ? (
        <div className="text-center">No hay categorías disponibles</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHeadSet
                sortFunction={sortCategories}
                sortConfig={sortConfig}
                columns={tableHeaderColumns}
              />
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  {category.type === "menu" ? "Menú" : "Inventario"}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
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
