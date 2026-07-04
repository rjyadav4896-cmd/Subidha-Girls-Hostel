import { FormEvent, ReactNode, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Home, Loader2, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { Button } from './Button';

type AuthRole = 'admin' | 'student';

type LoginResponse = {
  token: string;
  user?: {
    name?: string;
    username?: string;
    role?: AuthRole;
  };
};

type AuthLoginCardProps = {
  role: AuthRole;
  title: string;
  eyebrow: string;
  description: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  endpoint: string;
  dashboardPath: string;
  alternatePath: string;
  alternateLabel: string;
  setToken: (token: string) => void;
  helper?: ReactNode;
};

const roleStyles = {
  admin: {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    button: 'primary' as const,
    panel: 'from-slate-950 via-indigo-950 to-slate-900',
    ring: 'ring-indigo-100'
  },
  student: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    button: 'secondary' as const,
    panel: 'from-slate-950 via-sky-950 to-emerald-950',
    ring: 'ring-sky-100'
  }
};

function getRedirectTarget(state: unknown, fallback: string) {
  if (state && typeof state === 'object' && 'from' in state) {
    const from = (state as { from?: unknown }).from;
    if (typeof from === 'string' && from.startsWith('/')) return from;
  }
  return fallback;
}

export function AuthLoginCard({
  role,
  title,
  eyebrow,
  description,
  usernameLabel,
  usernamePlaceholder,
  endpoint,
  dashboardPath,
  alternatePath,
  alternateLabel,
  setToken,
  helper
}: AuthLoginCardProps) {
  const nav = useNavigate();
  const location = useLocation();
  const styles = roleStyles[role];
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => username.trim().length > 0 && password.length > 0 && !loading, [loading, password, username]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<LoginResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password })
      });
      setToken(res.token);
      nav(getRedirectTarget(location.state, dashboardPath), { replace: true });
    } catch (e: any) {
      setError(e?.message ?? 'We could not sign you in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl lg:grid-cols-[1fr_440px]">
        <section className={`hidden bg-gradient-to-br ${styles.panel} px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between`}>
          <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-white">
            <Home size={17} />
            Subidha Girls Hostel
          </Link>

          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-semibold text-white/90">
              <ShieldCheck size={16} />
              Secure hostel management
            </div>
            <h1 className="text-4xl font-black leading-tight">Welcome back to your hostel portal.</h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/75">
              Manage applications, fees, leave, and student records from one focused dashboard built for daily hostel work.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-white/10 p-3">
              <div className="font-black">24/7</div>
              <div className="text-white/65">Portal access</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-3">
              <div className="font-black">Secure</div>
              <div className="text-white/65">Protected sessions</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/10 p-3">
              <div className="font-black">Ready</div>
              <div className="text-white/65">Live operations</div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center px-5 py-8 sm:px-8">
          <div className="w-full">
            <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 lg:hidden">
              <Home size={17} />
              Subidha Girls Hostel
            </Link>

            <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-8 ${styles.ring} sm:p-7`}>
              <div className="mb-6">
                <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${styles.badge}`}>
                  <LockKeyhole size={14} />
                  {eyebrow}
                </div>
                <h2 className="text-2xl font-black text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </div>

              <form className="space-y-4" onSubmit={login}>
                <label className="block" htmlFor={`${role}-username`}>
                  <div className="mb-1 text-xs font-semibold text-slate-600">{usernameLabel}</div>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      id={`${role}-username`}
                      autoComplete="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder={usernamePlaceholder}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                    />
                  </div>
                </label>

                <label className="block" htmlFor={`${role}-password`}>
                  <div className="mb-1 text-xs font-semibold text-slate-600">Password</div>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      id={`${role}-password`}
                      autoComplete="current-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-secondary focus:ring-2 focus:ring-secondary/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800" role="alert">
                    {error}
                  </div>
                )}

                <Button className="min-h-11 w-full" variant={styles.button} disabled={!canSubmit} type="submit">
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <span>{helper ?? 'Use the account details provided by the hostel office.'}</span>
                <Link className="font-bold text-primary transition hover:text-slate-950" to={alternatePath}>
                  {alternateLabel}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
