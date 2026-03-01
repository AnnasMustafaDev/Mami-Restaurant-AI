import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../stores/useAdminAuth';
import { LogOut, CalendarDays, MessageSquare, UtensilsCrossed, Info, Phone } from 'lucide-react';

const adminNav = [
  { to: '/admin/dashboard', label: 'Reservations', icon: CalendarDays },
  { to: '/admin/chats', label: 'Chat Sessions', icon: MessageSquare },
  { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/admin/about', label: 'About', icon: Info },
  { to: '/admin/contact', label: 'Contact', icon: Phone },
];

export default function AdminLayout() {
  const location = useLocation();
  const logout = useAdminAuth((s) => s.logout);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-white/10">
          <p className="font-bold text-lg">MaMi's Admin</p>
          <p className="text-xs text-gray-400 mt-0.5">Management Panel</p>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {adminNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.to
                  ? 'bg-white/15 text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-2 py-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-colors w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
