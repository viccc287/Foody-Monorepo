import {BrowserRouter as Router, Routes, Route, useLocation} from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import MenuItems from "@/pages/MenuItems";
import Agents from "@/pages/Agents";
import Stock from "@/pages/Stock";
import Categories from "@/pages/Categories";
import Suppliers from "@/pages/Suppliers";
import Promos from "@/pages/Promos";
import PrivateRoute from "@/components/PrivateRoute.tsx";
import Login from "@/pages/Login.tsx";
import Orders from "@/pages/Orders.tsx";

function AppLayout() {
    const location = useLocation();
    const isLoginRoute = location.pathname === "/login";

    return (
        <SidebarProvider>
            <Toaster />
            {!isLoginRoute && <AppSidebar />}
            <main className="w-full p-4 overflow-auto">
                {!isLoginRoute && <SidebarTrigger />}
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
                    <Route
                        path="/agents"
                        element={
                            <PrivateRoute allowedRoles={['manager']}>
                                <Agents />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/stock" element={<Stock />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/promos" element={<Promos />} />
                    <Route path="/login" element={<Login />} />
                    <Route path='/orders' element={<Orders />} />
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
