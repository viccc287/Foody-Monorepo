import {
  Box,
  ChevronUp,
  ClipboardList,
  History,
  Home,
  Tags,
  Ticket,
  Truck,
  User,
  Users,
  Utensils
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import tokenService from "@/services/tokenService.ts";
import { useEffect, useState } from "react";

import logoUrl from "/restaurantlogo.jpg";

const mainItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    allowedRoles: ["manager", "cashier", "waiter", "cook"],
  },
  {
    title: "Órdenes",
    url: "orders",
    icon: ClipboardList,
    allowedRoles: ["manager", "cashier", "waiter"],
  },
];

const managementItems = [
  {
    title: "Artículos del menú",
    url: "menu-items",
    icon: Utensils,
    allowedRoles: ["manager"],
  },
  {
    title: "Inventario/Insumos",
    url: "stock",
    icon: Box,
    allowedRoles: ["manager"],
  },
  {
    title: "Categorías",
    url: "categories",
    icon: Tags,
    allowedRoles: ["manager"],
  },
  {
    title: "Proveedores",
    url: "suppliers",
    icon: Truck,
    allowedRoles: ["manager"],
  },
  {
    title: "Promociones",
    url: "promos",
    icon: Ticket,
    allowedRoles: ["manager"],
  },
  {
    title: "Personal",
    url: "agents",
    icon: Users,
    allowedRoles: ["manager"],
  },
];

const historyItems = [
  {
    title: "Histórico",
    url: "history",
    icon: History,
    allowedRoles: ["manager", "cashier"],
  },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(tokenService.getUserInfo());

  useEffect(() => {
    const updatedUserInfo = tokenService.getUserInfo();
    setUserInfo(updatedUserInfo);
  }, []);

  const handleLogout = () => {
    tokenService.clearToken();
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Restaurante</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map(
                (item) =>
                  item.allowedRoles.includes(userInfo?.role ?? "") && (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map(
                (item) =>
                  item.allowedRoles.includes(userInfo?.role ?? "") && (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Histórico</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {historyItems.map(
                (item) =>
                  item.allowedRoles.includes(userInfo?.role ?? "") && (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild>
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {open && (
          <img
            className="aspect-square p-4 rounded-[25px] size-36"
            src={logoUrl}
          />
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User />
                  <span>
                    {userInfo?.name} {userInfo?.lastName}
                  </span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Perfil de agente</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}