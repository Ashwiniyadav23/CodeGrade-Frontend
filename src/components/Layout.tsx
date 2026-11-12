import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { cn } from './ui'
export default function Layout() {
  const { profile, signOut } = useAuth()
  const nav = profile?.role==='admin' ? [['/admin','Assessments'],['/admin/submissions','Submissions']] : [['/student','My assessments']]
  return <div className="flex min-h-screen">
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white/90 p-5 backdrop-blur">
      <div className="mb-10 flex items-center gap-3"><div className="brand-mark">C</div><div><div className="font-bold tracking-tight text-slate-900">CodeGrade</div><div className="text-[11px] font-medium text-slate-400">Learn. Build. Grow.</div></div></div>
      <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">{profile?.role === 'admin' ? 'Workspace' : 'Learning'}</div>
      <nav className="flex flex-1 flex-col gap-1.5">{nav.map(([to,l])=><NavLink key={to} to={to} end className={({isActive})=>cn('rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900',isActive&&'bg-blue-50 font-semibold text-blue-700 shadow-sm')}>{l}</NavLink>)}</nav>
      <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500"><div className="truncate font-semibold text-slate-800">{profile?.full_name}</div><div className="mt-0.5 capitalize">{profile?.role}</div>
        <button onClick={signOut} className="mt-3 font-semibold text-blue-600 hover:text-blue-700">Sign out</button></div>
    </aside>
    <main className="mx-auto w-full max-w-6xl flex-1 p-5 sm:p-8 lg:p-10"><Outlet/></main></div>
}
