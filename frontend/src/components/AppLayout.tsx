import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  LogOut,
  Building2,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { cx } from "../lib/format";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] },
  { to: "/customers", label: "Customers", icon: Users, roles: ["ADMIN", "SALES", "ACCOUNTS"] },
  { to: "/products", label: "Products & Stock", icon: Package, roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] },
  { to: "/challans", label: "Sales Challans", icon: FileText, roles: ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTS"] },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const visibleItems = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Building2 size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-tight">Wholesale ERP</p>
            <p className="text-xs text-slate-400 leading-tight">Operations Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                )
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
