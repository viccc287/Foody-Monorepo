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
      <main className="w-full p-4 overflow-auto">
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
                      <div>
                        <h1>HOME</h1>
                      </div>
                    }
                  />
                  <Route path="/menu-items" element={<MenuItems />} />
                  <Route path="/agents" element={<Agents />} />
                  <Route path="/stock" element={<Stock />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/promos" element={<Promos />} />
                  <Route path="/orders" element={<Orders />} />
                </Routes>
              </PrivateRoute>
            }
          />
        </Routes>
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