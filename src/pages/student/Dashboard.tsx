import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Badge, Card, PageHeader, statusTone } from '../../components/ui'
export default function Dashboard() {
  const [rows,setRows] = useState<any[]>([])
  useEffect(()=>{ api.get('/assessments').then(setRows) },[])
  return <><PageHeader title="My assessments" sub="Assessments assigned to you."/>
    <div className="grid gap-4 md:grid-cols-2">{rows.map(r=>{ const st = r.status ?? 'pending'
      return <Link key={r.id} to={`/student/${r.id}`}><Card className="transition hover:border-blue-300"><div className="flex items-start justify-between"><h3 className="font-medium">{r.title}</h3><Badge tone={statusTone[st]}>{st==='pending'?'Not submitted':st==='review'?'Under review':st}</Badge></div>
        <div className="mt-2 flex gap-2 text-xs text-zinc-500"><span>{r.language}</span><span>{r.difficulty}</span><span>Due {r.deadline?new Date(r.deadline).toLocaleDateString():'—'}</span></div>
        {r.total!=null && <div className="mt-3 text-sm font-medium text-blue-700">{r.total} / {r.max_marks} marks</div>}</Card></Link> })}
      {!rows.length && <Card className="col-span-2 py-10 text-center text-sm text-zinc-500">Nothing assigned yet. Your instructor will assign assessments here.</Card>}</div></>
}
