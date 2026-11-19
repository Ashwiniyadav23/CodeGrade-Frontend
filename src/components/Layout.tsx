import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { cn } from './ui'
export default function Layout() {
  const { profile, signOut } = useAuth()
  const nav: [string, string][] = profile?.role === 'admin'
    ? [['/admin', 'Assessments'], ['/admin/submissions', 'Submissions'], ['/admin/access-requests', 'Access requests']]
    : [['/student', 'My assessments'], ['/student/admin-access', 'Admin access']]
  const links = (mobile = false) => nav.map(([to, label]) => <NavLink key={to} to={to} end className={({ isActive }) => cn(
    mobile ? 'shrink-0 rounded-lg px-3 py-2 text-xs font-medium' : 'rounded-xl px-3.5 py-2.5 text-sm font-medium',
    'transition hover:bg-slate-100 hover:text-slate-900',
    isActive ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-500'
  )}>{label}</NavLink>)

  return <div className="min-h-screen bg-slate-50/70 md:flex">
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white p-5 md:flex">
      <div className="mb-10 flex items-center gap-3 px-1"><div className="brand-mark">CG</div><div><div className="font-bold tracking-tight text-slate-900">CodeGrade</div><div className="text-[11px] font-medium text-slate-400">Learn. Build. Grow.</div></div></div>
      <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">{profile?.role === 'admin' ? 'Workspace' : 'Learning'}</div>
      <nav className="flex flex-1 flex-col gap-1.5">{links()}</nav>
      <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-3.5 text-xs text-slate-500"><div className="truncate font-semibold text-slate-800">{profile?.full_name}</div><div className="mt-1 capitalize">{profile?.role} account</div>
        <button onClick={signOut} className="mt-3 font-semibold text-blue-700 hover:text-blue-800">Sign out</button></div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="border-b border-slate-200/80 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center justify-between"><div className="flex items-center gap-2.5"><div className="brand-mark h-8 w-8 rounded-lg text-xs">CG</div><span className="text-sm font-bold tracking-tight">CodeGrade</span></div><button onClick={signOut} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100">Sign out</button></div>
        <nav className="mt-3 flex gap-1 overflow-x-auto">{links(true)}</nav>
      </header>
      <main className="mx-auto w-full max-w-6xl p-5 sm:p-8 lg:p-10"><Outlet/></main>
    </div>
  </div>
}
