import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import MenuItems from "@/pages/MenuItems";
import Agents from "@/pages/Agents";
import Stock from "@/pages/Stock";
import Categories from "@/pages/Categories";
import Suppliers from "@/pages/Suppliers";
import Promos from "@/pages/Promos";
import Orders from "@/pages/Orders";

export default function Layout() {
  return (
    <SidebarProvider>
      <Router>
        <Toaster />
        <AppSidebar />
        <main className="w-full p-4 overflow-auto max-h-[100svh]">
          <div className="flex flex-col grow h-full">
          <SidebarTrigger />
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
            <Route path='/orders' element={<Orders />} />
          </Routes>
          </div>
          
        </main>
      </Router>
    </SidebarProvider>
  );
}
