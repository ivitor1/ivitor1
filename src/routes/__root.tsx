import { createRootRoute, Outlet, Link } from '@tanstack/react-router';
import { Activity, Flame } from 'lucide-react';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20">
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                NXA <span className="text-emerald-400 font-extrabold">FIT</span>
              </h1>
              <p className="text-xs text-slate-400">Plataforma de Treino & Nutrição</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-200 transition-colors"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Painel</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 bg-slate-900/40">
        <p>© NXA Fit — Performance & Saúde Integrada</p>
      </footer>
    </div>
  );
}