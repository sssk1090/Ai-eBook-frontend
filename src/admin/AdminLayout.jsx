import {
  LayoutDashboard,
  Users,
  BookOpen,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useState } from "react";

import {
  NavLink,
  Outlet,
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "eBooks",
      path: "/admin/books",
      icon: BookOpen,
    },
    {
      name: "AI Usage",
      path: "/admin/ai-usage",
      icon: Sparkles,
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },
  ];

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =========================================
          MOBILE HEADER
      ========================================= */}

      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950 px-5 lg:hidden">

        <Link
          to="/admin"
          className="flex items-center gap-3"
        >

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600">
            <BookOpen size={19} />
          </div>

          <div>
            <p className="text-sm font-bold">
              AI eBook Creator
            </p>

            <p className="text-xs text-violet-400">
              Admin Panel
            </p>
          </div>

        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
        >
          {mobileMenuOpen ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>

      </header>

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-40 w-64 border-r border-white/10 bg-slate-950 transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* Logo */}

        <div className="flex h-20 items-center border-b border-white/10 px-6">

          <Link
            to="/admin"
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
              <BookOpen size={21} />
            </div>

            <div>

              <p className="font-bold">
                AI eBook Creator
              </p>

              <p className="text-xs text-violet-400">
                Admin Panel
              </p>

            </div>

          </Link>

        </div>

        {/* Navigation */}

        <div className="flex h-[calc(100%-5rem)] flex-col">

          <div className="flex-1 overflow-y-auto p-4">

            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-600">
              Management
            </p>

            <nav className="space-y-1">

              {navigation.map((item) => {

                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/admin"}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-violet-600/10 text-violet-400"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >

                    <Icon size={18} />

                    {item.name}

                  </NavLink>
                );

              })}

            </nav>

          </div>

          {/* Bottom section */}

          <div className="border-t border-white/10 p-4">

            {/* Admin profile */}

            <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-sm font-bold text-violet-400">

                {user?.fullName
                  ? user.fullName.charAt(0).toUpperCase()
                  : "A"}

              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-medium">
                  {user?.fullName || "Administrator"}
                </p>

                <p className="truncate text-xs text-slate-600">
                  {user?.email || "admin@aebookcreator.com"}
                </p>

              </div>

            </div>

            {/* Logout */}

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
            >

              <LogOut size={18} />

              Logout

            </button>

          </div>

        </div>

      </aside>

      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="min-h-screen lg:ml-64">

        {/* Mobile spacing */}

        <div className="pt-16 lg:pt-0">

          <Outlet />

        </div>

      </main>

    </div>
  );
}

export default AdminLayout;