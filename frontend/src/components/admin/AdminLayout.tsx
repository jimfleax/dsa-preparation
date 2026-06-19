import { Outlet, NavLink } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { LogOut, LayoutDashboard, Users, Map, FileText, BarChart } from "lucide-react";

export default function AdminLayout() {
  const { adminLogout, adminUser } = useAdminAuth();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Users", href: "/users", icon: Users },
    { name: "Tracks", href: "/tracks", icon: Map },
    { name: "Docs", href: "/docs", icon: FileText },
    { name: "Analytics", href: "/analytics", icon: BarChart },
  ];

  return (
    <div className="flex h-screen bg-neutral-50/50 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-neutral-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="h-20 flex items-center px-6 border-b border-neutral-100">
          <h1 className="text-xl font-extrabold text-neutral-900 tracking-tight">Admin</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === "/"}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-sm"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`mr-3 h-5 w-5 transition-colors ${
                        isActive ? "text-indigo-600" : "text-neutral-400 group-hover:text-neutral-600"
                      }`}
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-100 bg-neutral-50/30">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex flex-col truncate">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Logged in as</span>
              <span className="text-sm font-bold text-neutral-800 truncate">
                {adminUser?.email || "Admin"}
              </span>
            </div>
          </div>
          <button
            onClick={adminLogout}
            className="group flex items-center w-full px-3 py-2.5 text-sm font-semibold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-rose-400 group-hover:text-rose-600 transition-colors" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto relative">
        <main className="p-6 md:p-10 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
