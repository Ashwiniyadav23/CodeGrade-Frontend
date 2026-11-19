import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Badge, Card, PageHeader, statusTone } from '../../components/ui'

export default function Dashboard() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/assessments').then(setRows).finally(() => setLoading(false)) }, [])
  const active = rows.filter(row => !row.status || row.status === 'pending' || row.status === 'submitted' || row.status === 'evaluating').length
  const reviewed = rows.filter(row => row.total != null).length

  return <>
    <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 px-6 py-7 text-white shadow-lg shadow-blue-950/10 sm:px-8 sm:py-9">
      <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end"><div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-100"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300"/>Student workspace</div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Keep your momentum.</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100/75">Your assignments and feedback, all in one place. Pick a challenge and take the next step.</p>
      </div><div className="grid grid-cols-2 gap-3 sm:min-w-64"><div className="rounded-2xl border border-white/10 bg-white/[.08] p-4"><div className="text-2xl font-semibold">{rows.length}</div><div className="mt-1 text-xs text-blue-100/70">Total assigned</div></div><div className="rounded-2xl border border-white/10 bg-white/[.08] p-4"><div className="text-2xl font-semibold">{reviewed}</div><div className="mt-1 text-xs text-blue-100/70">Feedback received</div></div></div></div>
    </div>
    <PageHeader title="My assessments" sub={`${active} ${active === 1 ? 'assignment needs' : 'assignments need'} your attention.`}/>
    {loading ? <div className="grid gap-4 md:grid-cols-2"><div className="h-40 animate-pulse rounded-2xl bg-slate-200/70"/><div className="h-40 animate-pulse rounded-2xl bg-slate-200/70"/></div>
      : rows.length ? <div className="grid gap-4 lg:grid-cols-2">{rows.map(row => {
        const status = row.status ?? 'pending'
        return <Link key={row.id} to={`/student/${row.id}`} className="group rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20"><Card className="h-full border-slate-200/80 p-5 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-blue-200 group-hover:shadow-lg group-hover:shadow-blue-950/5 sm:p-6">
          <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-700">{row.language} <span className="px-1 text-slate-300">/</span> {row.difficulty}</div><h2 className="truncate text-lg font-semibold tracking-tight text-slate-900">{row.title}</h2></div><Badge tone={statusTone[status]}>{status === 'pending' ? 'Not submitted' : status === 'review' ? 'Under review' : status}</Badge></div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500"><span>Due {row.deadline ? new Date(row.deadline).toLocaleDateString() : 'No deadline'}</span><span>Up to {row.max_marks ?? row.max ?? '—'} marks</span></div>
          {row.total != null && <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-3.5 py-3"><div><div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Your result</div><div className="mt-0.5 text-sm font-semibold text-emerald-900">{row.total} <span className="font-normal text-emerald-700">/ {row.max_marks} marks</span></div></div><span className="text-emerald-700 transition group-hover:translate-x-1">→</span></div>}
          {row.total == null && <div className="mt-4 flex items-center justify-between text-sm font-semibold text-blue-700">Open assessment <span className="transition group-hover:translate-x-1">→</span></div>}
        </Card></Link>
      })}</div>
      : <Card className="border-dashed py-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-700">✓</div><h2 className="mt-4 font-semibold text-slate-900">You’re all caught up</h2><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">There are no assessments assigned to you right now. New work from your instructor will show up here.</p></Card>}
  </>
}
