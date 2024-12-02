import { ScrollArea } from "@/components/ui/scroll-area";
import { useCallback, useRef, useState } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";

import type { Category, MenuItem, Order } from "@/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";

interface ItemSearchSidebarProps {
  menuItems: MenuItem[];
  categories: Category[];
  addItemToOrder: (item: MenuItem, comments?: string) => Promise<void>;
  selectedOrder: Order | null;
}

const commentSchema = z.object({
  comments: z.string(),
});

function ItemSearchSidebar({
  menuItems,
  categories,
  addItemToOrder,
  selectedOrder,
}: ItemSearchSidebarProps) {
  const [menuItemSearchQuery, setMenuItemSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [itemToAdd, setItemToAdd] = useState<MenuItem | null>(null);

  const firstItemActionRef = useRef<HTMLButtonElement>(null);

  const commentForm = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      comments: "",
    },
  });

  const onCommentSubmit = async (values: z.infer<typeof commentSchema>) => {
    if (!itemToAdd) return;

    await addItemToOrder(itemToAdd, values.comments);
    setCommentDialogOpen(false);
    commentForm.reset();
    setItemToAdd(null);
  };

  const getMenuItemsByCategory = useCallback(
    (categoryId: number) => {
      return menuItems.filter((item) => item.categoryId === categoryId);
    },
    [menuItems]
  );

  const filterMenuItemsByName = useCallback(
    (name: string) => {
      const filtered = menuItems.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(name.toLowerCase());
        if (selectedCategory) {
          return nameMatch && item.categoryId === selectedCategory.id;
        }
        return nameMatch;
      });
      setFilteredMenuItems(filtered);
    },
    [menuItems, selectedCategory] // Add selectedCategory to dependencies
  );

  return (
    <div className="flex flex-col  md:max-w-56 lg:max-w-72 grow border-l p-4 h-full">
      <div className="flex flex-col mb-4 gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {selectedCategory ? selectedCategory.name : "Todas las categorías"}
          </h2>

          {selectedCategory && (
            <Button variant="ghost" onClick={() => setSelectedCategory(null)}>
              <X />
            </Button>
          )}
        </div>
        <div className="flex gap-1">
          <Input
            type="text"
            value={menuItemSearchQuery}
            onChange={(e) => {
              setMenuItemSearchQuery(e.target.value);
              filterMenuItemsByName(e.target.value);
   
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setMenuItemSearchQuery("");
              } 
            }}
            placeholder="Buscar artículo"
          />
          {menuItemSearchQuery && (
            <Button
              onClick={() => {
                setMenuItemSearchQuery("");
              }}
              variant="ghost"
            >
              <X />
            </Button>
          )}
        </div>
      </div>
      <ScrollArea className="h-72 md:h-full">
        <div className="grid gap-2">
          {menuItemSearchQuery
            ? // Show filtered items across all categories when searching
              filteredMenuItems.map((item, index) => (
                <Card key={item.id}>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-center gap-4 h-fit sm:flex-wrap">
                      <div>
                        <CardTitle className="text-sm">{item.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          ${item.price}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap xl:max-w-min">
                        <Button
                          className="grow"
                          size="sm"
                          onClick={() => addItemToOrder(item)}
                          disabled={!selectedOrder}
                          ref={index === 0 ? firstItemActionRef : null}
                        >
                          Agregar
                        </Button>
                        <Button
                          className="grow"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setItemToAdd(item);
                            setCommentDialogOpen(true);
                          }}
                          disabled={!selectedOrder}
                        >
                          Con comentario
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            : !selectedCategory
            ? // Show categories when no search and no category selected
              categories.map((category) => (
                <Card
                  key={category.id}
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setSelectedCategory(category)}
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">{category.name}</CardTitle>
                  </CardHeader>
                </Card>
              ))
            : // Show menu items for selected category when no search
              getMenuItemsByCategory(selectedCategory.id).map((item, index) => (
                <Card key={item.id}>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-center gap-4 flex-wrap xl:flex-nowrap">
                      <div>
                        <CardTitle className="text-sm">{item.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          ${item.price}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap xl:max-w-min">
                        <Button
                          className="grow"
                          size="sm"
                          onClick={() => addItemToOrder(item)}
                          disabled={!selectedOrder}
                          ref={index === 0 ? firstItemActionRef : null}
                        >
                          Agregar
                        </Button>
                        <Button
                          className="grow"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setItemToAdd(item);
                            setCommentDialogOpen(true);
                          }}
                          disabled={!selectedOrder}
                        >
                          Con comentario
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
        </div>
        <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar con comentarios</DialogTitle>
              <DialogDescription>
                Agregar {itemToAdd?.name} a la orden de{" "}
                {selectedOrder?.customer || "l cliente"} con comentarios
              </DialogDescription>
            </DialogHeader>
            <Form {...commentForm}>
              <form
                onSubmit={commentForm.handleSubmit(onCommentSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={commentForm.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Comentarios" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCommentDialogOpen(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Agregar con comentario</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </ScrollArea>
    </div>
  );
}

export default ItemSearchSidebar;
