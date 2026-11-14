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
    <Card className="p-0"><table className="w-full text-sm"><thead className="border-b border-zinc-200 text-left text-xs text-zinc-500"><tr><th className="p-3">Student</th><th>Assessment</th><th>Submitted</th><th>Status</th><th>Score</th><th></th></tr></thead>
      <tbody>{rows.map(r=><tr key={r.id} className="border-b border-zinc-100 last:border-0">
        <td className="p-3 font-medium">{r.student?.full_name}<div className="text-xs font-normal text-zinc-500">{r.student?.batch}</div></td><td>{r.assessment?.title}</td><td>{new Date(r.created_at).toLocaleString()}</td>
        <td><Badge tone={statusTone[r.status]}>{r.status}</Badge></td><td>{r.total!=null ? `${r.total} / ${r.assessment?.max_marks}` : '—'}</td>
        <td className="p-3 text-right"><div className="flex justify-end gap-2"><Link to={`/admin/submissions/${r.id}`}><Button variant="outline">Open</Button></Link><Button variant="danger" onClick={()=>remove(r.id)}>Delete</Button></div></td></tr>)}
        {!rows.length && <tr><td colSpan={6} className="p-8 text-center text-zinc-500">No submissions yet.</td></tr>}</tbody></table></Card></>
}
