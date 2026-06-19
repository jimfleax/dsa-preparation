import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { LogOut, LayoutDashboard, Users, Map, FileText, BarChart, Menu, X } from "lucide-react";

export default function AdminLayout() {
  const { adminLogout, adminUser } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Tracks", href: "/admin/tracks", icon: Map },
    { name: "Docs", href: "/admin/docs", icon: FileText },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart },
  ];

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans overflow-hidden">
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200/60 flex items-center justify-between px-4 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm shadow-indigo-200">
            A
          </div>
          <h1 className="text-lg font-extrabold text-neutral-900 tracking-tight">Admin</h1>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -mr-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 bg-white/90 backdrop-blur-xl md:bg-white border-r border-neutral-200/60 
        flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.03)]
        transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Desktop Header */}
        <div className="h-16 md:h-24 flex items-center justify-between px-6 border-b border-neutral-100/50">
          <div className="flex items-center gap-3">
            <div className="hidden md:flex w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-200 items-center justify-center font-extrabold text-lg">
              A
            </div>
            <h1 className="text-xl font-extrabold text-neutral-900 tracking-tight">Control Panel</h1>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-2 -mr-2 text-neutral-400 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-hide">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === "/admin"}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3.5 text-[15px] font-semibold rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`mr-4 h-[22px] w-[22px] transition-all duration-300 ${
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

        {/* Footer profile */}
        <div className="p-5 border-t border-neutral-100/80 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-5 px-1">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-sm">
              {adminUser?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Authenticated</span>
              <span className="text-sm font-bold text-neutral-800 truncate">
                {adminUser?.email || "Super Admin"}
              </span>
            </div>
          </div>
          <button
            onClick={adminLogout}
            className="group flex items-center justify-center w-full px-4 py-3 text-sm font-bold text-rose-600 bg-rose-50/50 rounded-2xl hover:bg-rose-100 border border-transparent hover:border-rose-200 transition-all duration-200 active:scale-[0.98]"
          >
            <LogOut className="mr-2 h-[18px] w-[18px]" />
            Sign Out Securely
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto relative md:pt-0 pt-16 scrollbar-hide">
        <main className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full min-h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
