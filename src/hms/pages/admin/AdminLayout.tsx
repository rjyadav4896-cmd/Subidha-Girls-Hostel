import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { clearAdminToken } from '../../lib/storage';
import { Button } from '../../components/Button';

const linkBase = 'block rounded-xl px-3 py-2 text-sm font-semibold';

export function AdminLayout() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto grid md:grid-cols-[260px_1fr] gap-6 p-6">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 h-fit sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-black text-slate-900">Hostel Admin</div>
            <Button
              variant="ghost"
              onClick={() => {
                clearAdminToken();
                void apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
                nav('/admin/login');
              }}
            >
              Logout
            </Button>
          </div>
          <nav className="space-y-1">
            <NavLink
              to="applications"
              className={({ isActive }) => `${linkBase} ${isActive ? 'bg-secondary/10 text-secondary' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              Applications
            </NavLink>
            <NavLink
              to="students"
              className={({ isActive }) => `${linkBase} ${isActive ? 'bg-secondary/10 text-secondary' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              Students
            </NavLink>
            <NavLink
              to="leave"
              className={({ isActive }) => `${linkBase} ${isActive ? 'bg-secondary/10 text-secondary' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              Leave Management
            </NavLink>
            <NavLink
              to="payments"
              className={({ isActive }) => `${linkBase} ${isActive ? 'bg-secondary/10 text-secondary' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              Payments
            </NavLink>
            <NavLink
              to="settings"
              className={({ isActive }) => `${linkBase} ${isActive ? 'bg-secondary/10 text-secondary' : 'text-slate-700 hover:bg-slate-100'}`}
            >
              Settings
            </NavLink>
          </nav>
        </aside>
        <main className="space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
