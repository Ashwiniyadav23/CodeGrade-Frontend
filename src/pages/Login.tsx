import { useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Button, Card, Label } from '../components/ui'
export default function Login() {
  const { login } = useAuth(); const [mode,setMode] = useState<'in'|'up'>('in'); const [f,setF] = useState({ email:'', password:'', full_name:'', batch:'' }); const [err,setErr] = useState(''); const [busy,setBusy] = useState(false)
  const submit = async (e:React.FormEvent) => { e.preventDefault(); setBusy(true); setErr('')
    try { const r = await api.post(mode==='in'?'/auth/login':'/auth/register', f); await login(r.token) } catch(e:any){ setErr(e.message) } setBusy(false) }
  return <div className="flex min-h-screen items-center justify-center overflow-hidden p-4"><div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl"/><div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl"/><Card className="relative w-full max-w-md p-8 shadow-xl shadow-slate-200/60">
    <div className="mb-8 flex items-center gap-3"><div className="brand-mark">C</div><div><div className="font-bold tracking-tight">CodeGrade</div><div className="text-xs text-slate-400">AI-powered assessments</div></div></div>
    <div className="mb-6"><h1 className="text-2xl font-bold tracking-tight">{mode==='in'?'Welcome back':'Create your account'}</h1><p className="mt-1 text-sm text-slate-500">{mode==='in'?'Sign in to continue to your workspace.':'Start building your skills with CodeGrade.'}</p></div>
    <form onSubmit={submit} className="space-y-4">
      {mode==='up' && <><div><Label>Full name</Label><input required value={f.full_name} onChange={e=>setF({ ...f, full_name:e.target.value })}/></div>
        <div><Label>Batch (e.g. 2025-A)</Label><input value={f.batch} onChange={e=>setF({ ...f, batch:e.target.value })}/></div></>}
      <div><Label>Email</Label><input type="email" required value={f.email} onChange={e=>setF({ ...f, email:e.target.value })}/></div>
      <div><Label>Password</Label><input type="password" minLength={6} required value={f.password} onChange={e=>setF({ ...f, password:e.target.value })}/></div>
      {err && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{err}</p>}
      <Button className="w-full" disabled={busy}>{mode==='in'?'Sign in':'Create account'}</Button></form>
    <button className="mt-5 w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700" onClick={()=>setMode(mode==='in'?'up':'in')}>{mode==='in'?'New student? Create an account':'Have an account? Sign in'}</button></Card></div>
}
