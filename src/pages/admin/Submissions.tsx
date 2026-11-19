import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Badge, Button, Card, PageHeader, statusTone } from '../../components/ui'
export default function Submissions() {
  const [rows,setRows] = useState<any[]>([])
  const load = () => api.get('/submissions').then(setRows)
  useEffect(()=>{ load() },[])
  const remove = async (id:string) => {
    if (!confirm('Permanently delete this submission, its evaluation, and uploaded files? This cannot be undone.')) return
    try { await api.del(`/submissions/${id}`); await load() } catch (e:any) { alert(e.message) }
  }
  return <><PageHeader title="Submissions" sub="Track student work, then review and publish AI evaluations."/>
    <div className="mb-4 flex items-center justify-between text-xs text-slate-500"><span>All student work</span><span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600 ring-1 ring-slate-200">{rows.length} submissions</span></div>
    <Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3.5">Student</th><th className="py-3.5">Assessment</th><th className="py-3.5">Submitted</th><th className="py-3.5">Status</th><th className="py-3.5">Score</th><th className="px-5 py-3.5 text-right">Actions</th></tr></thead>
      <tbody>{rows.map(r=><tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
        <td className="px-5 py-4"><div className="font-semibold text-slate-900">{r.student?.full_name}</div><div className="mt-0.5 text-xs text-slate-500">{r.student?.email}</div></td><td className="font-medium text-slate-700">{r.assessment?.title}</td><td className="text-slate-500">{new Date(r.created_at).toLocaleDateString()}<div className="mt-0.5 text-xs">{new Date(r.created_at).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</div></td>
        <td><Badge tone={statusTone[r.status]}>{r.status}</Badge></td><td className="font-semibold text-slate-700">{r.total!=null ? `${r.total} / ${r.assessment?.max_marks}` : '—'}</td>
        <td className="px-5 py-3.5"><div className="flex justify-end gap-2"><Link to={`/admin/submissions/${r.id}`}><Button className="h-9 px-3" variant="outline">Review</Button></Link><Button className="h-9 px-3" variant="ghost" onClick={()=>remove(r.id)}>Delete</Button></div></td></tr>)}
        {!rows.length && <tr><td colSpan={6} className="px-5 py-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-500">↥</div><div className="mt-3 font-semibold text-slate-800">No submissions yet</div><p className="mt-1 text-sm text-slate-500">Submitted student work will appear here.</p></td></tr>}</tbody></table></div></Card></>
}
