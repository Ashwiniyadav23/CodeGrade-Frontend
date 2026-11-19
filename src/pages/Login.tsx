import { useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Button, Label } from '../components/ui'

export default function Login() {
  const { login } = useAuth()
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [form, setForm] = useState({ email: '', password: '', full_name: '', batch: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await api.post(mode === 'in' ? '/auth/login' : '/auth/register', form)
      await login(result.token)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }))

  return <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,.95fr)]">
    <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20 xl:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_15%,rgba(59,130,246,.36),transparent_45%),radial-gradient(ellipse_at_85%_85%,rgba(99,102,241,.24),transparent_42%)]" />
      <div className="absolute -right-32 top-1/4 h-96 w-96 rounded-full border border-white/10" />
      <div className="absolute -right-16 top-[30%] h-64 w-64 rounded-full border border-white/10" />
      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-blue-700 shadow-lg shadow-blue-950/30">CG</div>
        <div><div className="font-semibold tracking-tight">CodeGrade</div><div className="text-xs text-slate-400">Assessment workspace</div></div>
      </div>
      <div className="relative max-w-xl py-16">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1.5 text-xs font-medium text-blue-100"><span className="h-1.5 w-1.5 rounded-full bg-blue-300"/>A better way to learn by building</div>
        <h1 className="text-4xl font-semibold leading-tight tracking-[-.035em] xl:text-5xl">Turn your code into <span className="text-blue-300">clear progress.</span></h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">Practice real assignments, understand your feedback, and keep improving one thoughtful iteration at a time.</p>
        <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
          {[['01', 'Build'], ['02', 'Submit'], ['03', 'Improve']].map(([number, label]) => <div key={number} className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><div className="text-xs font-semibold text-blue-300">{number}</div><div className="mt-2 text-sm font-medium text-slate-100">{label}</div></div>)}
        </div>
      </div>
      <div className="relative text-xs text-slate-500">A focused space for students and instructors.</div>
    </section>

    <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-12 xl:px-20">
      <div className="flex items-center gap-3 lg:hidden"><div className="brand-mark">CG</div><span className="font-semibold tracking-tight">CodeGrade</span></div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold text-blue-700">{mode === 'in' ? 'Welcome back' : 'Get started'}</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">{mode === 'in' ? 'Sign in to CodeGrade' : 'Create your account'}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{mode === 'in' ? 'Pick up where you left off and continue learning.' : 'Join your learning workspace in just a few steps.'}</p>
        </div>

        <div className="mb-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Account access">
          <button type="button" role="tab" aria-selected={mode === 'in'} onClick={() => { setMode('in'); setError('') }} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === 'in' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Sign in</button>
          <button type="button" role="tab" aria-selected={mode === 'up'} onClick={() => { setMode('up'); setError('') }} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === 'up' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Create account</button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {mode === 'up' && <>
            <div><Label>Full name</Label><input autoComplete="name" required value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Your name"/></div>
            <div><Label>Batch <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span></Label><input value={form.batch} onChange={e => update('batch', e.target.value)} placeholder="e.g. 2025-A"/></div>
            <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">i</span>
              <p className="text-xs leading-5 text-slate-600"><span className="font-semibold text-slate-800">Your account starts as a student.</span> You can request admin access later from your account whenever you need it.</p>
            </div>
          </>}
          <div><Label>Email address</Label><input type="email" autoComplete="email" required value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com"/></div>
          <div><Label>Password</Label><input type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} minLength={6} required value={form.password} onChange={e => update('password', e.target.value)} placeholder={mode === 'up' ? 'At least 6 characters' : 'Enter your password'}/></div>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
          <Button className="h-11 w-full rounded-xl bg-blue-700 text-sm shadow-md shadow-blue-700/15 hover:bg-blue-800" disabled={busy}>{busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Create student account'}</Button>
        </form>
        <p className="mt-6 text-center text-xs leading-5 text-slate-400">By continuing, you agree to use this workspace responsibly.</p>
      </div>
      <div className="py-2 text-center text-xs text-slate-400">CodeGrade · Learn, build, grow</div>
    </section>
  </main>
}
