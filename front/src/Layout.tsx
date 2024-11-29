import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import MenuItems from "@/pages/MenuItems";
import Agents from "@/pages/Agents";
import Stock from "@/pages/Stock";
import Categories from "@/pages/Categories";
import Suppliers from "@/pages/Suppliers";
import Promos from "@/pages/Promos";
import Login from "@/pages/Login";
import Orders from "@/pages/Orders";
import TokenService from "./services/tokenService";
import History from "./pages/History";
import Dashboard from "./pages/Dashboard";

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

function RoleBasedRoute({ children, path }) {
  const userInfo = TokenService.getUserInfo();
  const userRole = userInfo?.role || "";

  if (!ROUTE_ROLES[path]?.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function PrivateRoute({ children }) {
  const userInfo = TokenService.getUserInfo();
  return userInfo ? children : <Navigate to="/login" replace />;
}

function AppLayout() {
  const location = useLocation();
  const isLoginRoute = location.pathname === "/login";
  const userInfo = TokenService.getUserInfo();

  return (
    <SidebarProvider>
      <Toaster />
      {!isLoginRoute && userInfo && <AppSidebar />}
      <main className="w-full p-4 h-[100svh] overflow-auto">
        <div className="flex flex-col h-full ">
          {!isLoginRoute && userInfo && <SidebarTrigger />}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="*"
              element={
                <PrivateRoute>
                  <Routes>
                    <Route
                      path="/"
                      element={
                       <Dashboard/>
                      }
                    />
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
