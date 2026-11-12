import { useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Button, Card, Label } from '../components/ui'
export default function Login() {
  const { login } = useAuth(); const [mode,setMode] = useState<'in'|'up'>('in'); const [f,setF] = useState({ email:'', password:'', full_name:'', batch:'' }); const [err,setErr] = useState(''); const [busy,setBusy] = useState(false)
  const submit = async (e:React.FormEvent) => { e.preventDefault(); setBusy(true); setErr('')
    try { const r = await api.post(mode==='in'?'/auth/login':'/auth/register', f); await login(r.token) } catch(e:any){ setErr(e.message) } setBusy(false) }
  return <div className="flex min-h-screen items-center justify-center p-4"><Card className="w-full max-w-sm">
    <div className="mb-5 flex items-center gap-2 font-semibold"><div className="h-5 w-5 rounded bg-blue-600"/>CodeGrade</div>
    <h1 className="mb-4 text-lg font-semibold">{mode==='in'?'Sign in to your account':'Create a student account'}</h1>
    <form onSubmit={submit} className="space-y-3">
      {mode==='up' && <><div><Label>Full name</Label><input required value={f.full_name} onChange={e=>setF({ ...f, full_name:e.target.value })}/></div>
        <div><Label>Batch (e.g. 2025-A)</Label><input value={f.batch} onChange={e=>setF({ ...f, batch:e.target.value })}/></div></>}
      <div><Label>Email</Label><input type="email" required value={f.email} onChange={e=>setF({ ...f, email:e.target.value })}/></div>
      <div><Label>Password</Label><input type="password" minLength={6} required value={f.password} onChange={e=>setF({ ...f, password:e.target.value })}/></div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <Button className="w-full" disabled={busy}>{mode==='in'?'Sign in':'Create account'}</Button></form>
    <button className="mt-4 text-sm text-blue-600 hover:underline" onClick={()=>setMode(mode==='in'?'up':'in')}>{mode==='in'?'New student? Create an account':'Have an account? Sign in'}</button></Card></div>
}
