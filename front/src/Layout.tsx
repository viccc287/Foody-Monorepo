import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/toaster"
import Items from "@/pages/Items";
import Agents from "@/pages/Agents";


export default function Layout() {
  return (
    <SidebarProvider>
      <Router>
        <Toaster />
        <AppSidebar />
        <main className="w-full p-4 overflow-auto">
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
            <Route path="/items" element={<Items />} />
            <Route path="/agents" element={<Agents />} />
          </Routes>
        </main>
      </Router>
    </SidebarProvider>
  );
}
