import { Outlet } from "react-router-dom";
import { Sidebar } from "../Sidebar/Sidebar"

export const SidebarLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        <Outlet />
      </main>

    </div>
  );
};
