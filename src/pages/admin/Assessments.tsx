import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, Assessment } from '../../lib/api'
import { Button, Card, Badge, PageHeader } from '../../components/ui'
export default function Assessments() {
  const [rows,setRows] = useState<Assessment[]>([])
  const load = () => api.get('/assessments').then(setRows)
  useEffect(()=>{ load() },[])
  const del = async (id:string) => { if(confirm('Delete this assessment and all its submissions?')){ await api.del('/assessments/'+id); load() } }
  return <><PageHeader title="Assessments" sub="Create, assign and manage coding assessments." action={<Link to="/admin/new"><Button><span aria-hidden="true">＋</span> New assessment</Button></Link>}/>
    <div className="mb-4 flex items-center justify-between text-xs text-slate-500"><span>Assessment library</span><span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600 ring-1 ring-slate-200">{rows.length} total</span></div>
    <Card className="overflow-hidden p-0"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3.5">Assessment</th><th className="py-3.5">Language</th><th className="py-3.5">Difficulty</th><th className="py-3.5">Deadline</th><th className="py-3.5">Marks</th><th className="px-5 py-3.5 text-right">Actions</th></tr></thead>
      <tbody>{rows.map(a=><tr key={a.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"><td className="px-5 py-4"><div className="font-semibold text-slate-900">{a.title}</div></td><td className="text-slate-600">{a.language}</td><td><Badge tone="blue">{a.difficulty}</Badge></td>
        <td className="text-slate-600">{a.deadline ? new Date(a.deadline).toLocaleDateString() : 'No deadline'}</td><td className="font-medium text-slate-700">{a.max_marks}</td>
        <td className="px-5 py-3.5"><div className="flex justify-end gap-2"><Link to={`/admin/${a.id}/assign`}><Button className="h-9 px-3" variant="outline">Assign</Button></Link><Link to={`/admin/${a.id}/edit`}><Button className="h-9 px-3" variant="outline">Edit</Button></Link><Button className="h-9 px-3" variant="ghost" onClick={()=>del(a.id)}>Delete</Button></div></td></tr>)}
        {!rows.length && <tr><td colSpan={6} className="px-5 py-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-700">＋</div><div className="mt-3 font-semibold text-slate-800">No assessments yet</div><p className="mt-1 text-sm text-slate-500">Create your first assessment to get started.</p></td></tr>}</tbody></table></div></Card></>
}
