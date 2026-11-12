import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { cn } from './ui'
export default function Layout() {
  const { profile, signOut } = useAuth()
  const nav = profile?.role==='admin' ? [['/admin','Assessments'],['/admin/submissions','Submissions']] : [['/student','My assessments']]
  return <div className="flex min-h-screen">
    <aside className="sticky top-0 flex h-screen w-56 flex-col border-r border-zinc-200 bg-white p-4">
      <div className="mb-6 flex items-center gap-2 font-semibold"><div className="h-5 w-5 rounded bg-blue-600"/>CodeGrade</div>
      <nav className="flex flex-1 flex-col gap-1">{nav.map(([to,l])=><NavLink key={to} to={to} end className={({isActive})=>cn('rounded-md px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100',isActive&&'bg-blue-50 font-medium text-blue-700')}>{l}</NavLink>)}</nav>
      <div className="border-t border-zinc-200 pt-3 text-xs text-zinc-500"><div className="truncate font-medium text-zinc-800">{profile?.full_name}</div><div className="capitalize">{profile?.role}</div>
        <button onClick={signOut} className="mt-2 text-blue-600 hover:underline">Sign out</button></div>
    </aside>
    <main className="mx-auto w-full max-w-5xl flex-1 p-8"><Outlet/></main></div>
}
