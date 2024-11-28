import {
  Boxes,
  ChevronUp,
  CupSoda,
  Handshake,
  History,
  Home,
  List,
  ListTodo,
  PercentCircle,
  Shapes,
  Truck,
  User,
  Users,
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import tokenService from "@/services/tokenService.ts";
import { useEffect, useState } from "react";

import logoUrl from "@/assets/yuru.jpg";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    allowedRoles: ["manager", "cashier", "waiter", "cook"],
  },
  {
    title: "Artículos del menú",
    url: "menu-items",
    icon: CupSoda,
    allowedRoles: ["manager"],
  },
  {
    title: "Inventario/Insumos",
    url: "stock",
    icon: Boxes,
    allowedRoles: ["manager"],
  },
  {
    title: "Agentes",
    url: "agents",
    icon: Users,
    allowedRoles: ["manager"],
  },
  {
    title: "Categorías",
    url: "categories",
    icon: Shapes,
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
    icon: PercentCircle,
    allowedRoles: ["manager"],
  },
  {
    title: "Órdenes",
    url: "orders",
    icon: ListTodo,
    allowedRoles: ["manager", "cashier", "waiter"],
  },
  {
    title: "Histórico",
    url: "history",
    icon: History,
    allowedRoles: ["manager", "cashier"],
  }
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
    <TooltipProvider>
      <Sidebar collapsible="icon">
        <SidebarContent>
     
          <SidebarGroup>
            
            <SidebarGroupLabel>Restaurante</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map(
                  (item) =>
                    item.allowedRoles.includes(userInfo?.role) && (
                      <Tooltip key={item.title}>
                        <TooltipTrigger>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                              <Link to={item.url}>
                                <item.icon />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      </Tooltip>
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
    </TooltipProvider>
  );
}
