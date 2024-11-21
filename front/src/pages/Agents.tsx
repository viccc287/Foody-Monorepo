"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeClosed, PlusCircle, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Agent } from "@/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formSchema = z.object({
  id: z.number(),
  name: z.string().trim().min(1, "Nombre requerido"),
  lastName: z.string().trim().min(1, "Apellidos requeridos"),
  image: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      `El tamaño máximo de archivo es 5MB.`
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Solo se aceptan archivos .jpg, .png, .webp"
    )
    .or(z.string().url("URL de imagen inválida"))
    .or(z.string()),
  address: z.string().trim().min(1, "Dirección requerida"),
  phone: z
    .string()
    .regex(/^(\+?\d{1,3})?[-.●\s]?(\d{10})$/, "Número telefónico inválido"),
  rfc: z.string().trim().min(12, "RFC debe tener al menos 12 caracteres"),
  email: z.string().trim().email("Correo electrónico inválido"),
  pin: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "El PIN debe tener exactamente 4 dígitos"),
  role: z.string().trim().min(1, "Rol requerido"),
  isActive: z.boolean(),
});

const initialAgents: Agent[] = [
  {
    id: "1",
    name: "Ángeles",
    lastName: "Altez",
    image:
      "https://www.georgetown.edu/wp-content/uploads/2022/02/Jkramerheadshot-scaled-e1645036825432-1050x1050-c-default.jpg",
    address: "Brisas 123, Col. Centro, Ciudad",
    phone: "1234567890",
    rfc: "ABCD123456XYZ",
    email: "angie@example.com",
    pin: "1234",
    role: "admin",
    isActive: true,
  },
  {
    id: "2",
    name: "Eugenia",
    lastName: "Morales",
    image: "",
    address: "Brisas 123, Col. Centro, Ciudad",
    phone: "0987654321",
    rfc: "EFGH789012UVW",
    email: "euge@example.com",
    pin: "5678",
    role: "cashier",
    isActive: true,
  },
  {
    id: "3",
    name: "Marcos",
    lastName: "Cruz",
    image: "https://www.despejandodudas.co/images/2021/Noviembre/Mesero_2.jpg",
    address: "Pinos 123, Col. Centro, Ciudad",
    phone: "0987654321",
    rfc: "EFGH789012UVW",
    email: "marquitos@example.com",
    pin: "5678",
    role: "waiter",
    isActive: true,
  },
];

const roles = [
  { name: "Administrador", value: "admin" },
  { name: "Cajero", value: "cashier" },
  { name: "Mesero", value: "waiter" },
  { name: "Cocinero", value: "cook" },
];

const fetchAgents = async (): Promise<Agent[]> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  return initialAgents;
};

const saveAgent = async (agent: Agent): Promise<Agent> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ...agent, id: agent.id || initialAgents.length + 1 };
};

export default function AgentPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  const defaultValues = {
    name: "",
    lastName: "",
    image: "",
    address: "",
    phone: "",
    rfc: "",
    email: "",
    pin: "",
    role: "waiter",
    isActive: true,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    fetchAgents().then(setAgents);
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let imageUrl = values.image;

    if (values.image instanceof File) {
      // Here you would typically upload the file to your server or a cloud storage service
      // and get back the URL. For this example, we'll create a local object URL.
      imageUrl = URL.createObjectURL(values.image);
    }

    const savedAgent = await saveAgent({
      ...values,
      id: editingAgent?.id || initialAgents.length + 1,
      image: imageUrl as string,
    });

    setAgents((prev) =>
      editingAgent
        ? prev.map((agent) => (agent.id === savedAgent.id ? savedAgent : agent))
        : [...prev, savedAgent]
    );
    setIsDialogOpen(false);
    setEditingAgent(null);
    setImagePreview(null);
    form.reset(defaultValues);
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    form.reset(agent);
    setImagePreview(agent.image ?? "");
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Agentes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingAgent(null);
                setImagePreview(null);
                form.reset(defaultValues);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Agregar agente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[720px]">
            <DialogHeader>
              <DialogTitle>
                {editingAgent ? "Editar" : "Agregar"} agente
              </DialogTitle>
              <DialogDescription>
                {editingAgent
                  ? "Edita los detalles del agente"
                  : "Agrega un nuevo agente"}
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
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellidos</FormLabel>
                        <FormControl>
                          <Input placeholder="Apellidos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>Imagen</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                onChange(file);
                                setImagePreview(URL.createObjectURL(file));
                              }
                            }}
                            {...field}
                          />
                        </FormControl>
                        {imagePreview && (
                          <div className="w-full flex justify-center">
                            <img
                              src={imagePreview}
                              alt="Vista previa"
                              className="mt-2 w-32 h-32 object-cover rounded-full"
                            />
                          </div>
                        )}
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
                          <Input placeholder="Teléfono" {...field} />
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
                          <Input placeholder="Dirección" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rfc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RFC</FormLabel>
                        <FormControl>
                          <Input placeholder="RFC" {...field} />
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
                        <FormLabel>Correo electrónico</FormLabel>
                        <FormControl>
                          <Input placeholder="correo@ejemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PIN de acceso</FormLabel>
                        <FormControl>
                          <div className="flex w-full max-w-xs items-center space-x-2">
                            <Input
                              placeholder="1234"
                              type={showPin ? "text" : "password"}
                              {...field}
                            />
                            <Button
                              type="button"
                              onClick={() => setShowPin(!showPin)}
                            >
                              {showPin ? <EyeClosed /> : <Eye />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rol</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          name="role"
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.name}
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
                            ¿Esta persona está activa?
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card
            key={agent.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleEdit(agent)}
          >
            <CardHeader>
              <CardTitle>{`${agent.name} ${agent.lastName}`}</CardTitle>
              <CardDescription>
                {roles.find((role) => role.value === agent.role)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {agent.image ? (
                  <img
                    src={agent.image}
                    alt={`${agent.name} ${agent.lastName}`}
                    className="size-16 rounded-full object-cover"
                  />
                ) : (
                  <User size={64} />
                )}

                <div>
                  <p className="text-sm text-gray-500">{agent.phone}</p>
                  <p className="text-sm text-gray-500">{agent.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
