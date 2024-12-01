import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import Agents from "@/pages/Agents";
import Categories from "@/pages/Categories";
import Login from "@/pages/Login";
import MenuItems from "@/pages/MenuItems";
import Orders from "@/pages/Orders";
import Promos from "@/pages/Promos";
import Stock from "@/pages/Stock";
import Suppliers from "@/pages/Suppliers";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import TokenService from "./services/tokenService";

const ROUTE_ROLES = {
  "/menu-items": ["manager"],
  "/agents": ["manager"],
  "/stock": ["manager"],
  "/categories": ["manager"],
  "/suppliers": ["manager"],
  "/promos": ["manager"],
  "/history": ["manager", "cashier"],
  "/orders": ["manager", "cashier", "waiter", "cook"],
};

import { ReactNode } from "react";
import { useIsMobile } from "./hooks/use-mobile";

interface RoleBasedRouteProps {
  children: ReactNode;
  path: keyof typeof ROUTE_ROLES;
}

function RoleBasedRoute({ children, path }: RoleBasedRouteProps) {
  const userInfo = TokenService.getUserInfo();
  const userRole = userInfo?.role || "";
  if (!ROUTE_ROLES[path]?.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const userInfo = TokenService.getUserInfo();
  return userInfo ? children : <Navigate to="/login" replace />;
}

function AppLayout() {
  const location = useLocation();
  const isLoginRoute = location.pathname === "/login";
  const userInfo = TokenService.getUserInfo();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <Toaster />
      {!isLoginRoute && userInfo && <AppSidebar />}
      <main className="w-full h-[100svh] p-6 flex overflow-auto ">
        <div className="size-full">
          {isMobile && <SidebarTrigger />}
          
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="*"
              element={
                <PrivateRoute>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route
                      path="/menu-items"
                      element={
                        <RoleBasedRoute path="/menu-items">
                          <MenuItems />
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/agents"
                      element={
                        <RoleBasedRoute path="/agents">
                          <Agents />
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/stock"
                      element={
                        <RoleBasedRoute path="/stock">
                          <Stock />
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/categories"
                      element={
                        <RoleBasedRoute path="/categories">
                          <Categories />
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/suppliers"
                      element={
                        <RoleBasedRoute path="/suppliers">
                          <Suppliers />
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/promos"
                      element={
                        <RoleBasedRoute path="/promos">
                          <Promos />
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <RoleBasedRoute path="/orders">
                          <Orders />
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="/history"
                      element={
                        <RoleBasedRoute path="/history">
                          <History />
                        </RoleBasedRoute>
                      }
                    />
                  </Routes>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </main>
    </SidebarProvider>
  );
}

export default function Layout() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
