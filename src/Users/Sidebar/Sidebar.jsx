import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiMic,
  FiTrendingUp,
  FiBookmark,
  FiVideo,
  FiUser,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: FiHome,
    },
    {
      name: "Resume Analyzer",
      path: "/resume",
      icon: FiFileText,
    },
    {
      name: "Interview Assistant",
      path: "/interview-practice",
      icon: FiMic,
    },
    {
      name: "Progress",
      icon: FiTrendingUp,
    },
    {
      name: "Saved Questions",
      icon: FiBookmark,
    },
    {
      name: "Mock Interviews",
      icon: FiVideo,
    },
    {
      name: "Profile",
      icon: FiUser,
    },
    {
      name: "Settings",
      icon: FiSettings,
    },
  ];

  return (
    <aside className="w-[270px] min-h-screen bg-[#1C1241] text-white flex flex-col">
      
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-purple-900">
        <img
          src="/interview/Logo.jpeg"
          alt="InterviAI"
          className="w-11 h-11 rounded-xl"
        />

        <span className="text-2xl font-bold">
          Intervi<span className="text-purple-400">AI</span>
        </span>
      </div>

      {/* Menu */}
      <nav className="px-4 py-6 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const active = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 mb-2 rounded-lg transition ${
                active
                  ? "bg-[#6040C9] text-white"
                  : "text-gray-200 hover:bg-purple-900"
              }`}
            >
              <Icon className="text-xl" />

              <span className="font-medium">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 pb-6 border-t border-purple-900 pt-4">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          className="flex items-center gap-4 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-purple-900"
        >
          <FiLogOut className="text-xl" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
