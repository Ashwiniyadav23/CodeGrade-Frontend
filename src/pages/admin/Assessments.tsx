import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, Assessment } from '../../lib/api'
import { Button, Card, Badge, PageHeader } from '../../components/ui'
export default function Assessments() {
  const [rows,setRows] = useState<Assessment[]>([])
  const load = () => api.get('/assessments').then(setRows)
  useEffect(()=>{ load() },[])
  const del = async (id:string) => { if(confirm('Delete this assessment and all its submissions?')){ await api.del('/assessments/'+id); load() } }
  return <><PageHeader title="Assessments" sub="Create, assign and manage coding assessments." action={<Link to="/admin/new"><Button>New assessment</Button></Link>}/>
    <Card className="p-0"><table className="w-full text-sm"><thead className="border-b border-zinc-200 text-left text-xs text-zinc-500"><tr><th className="p-3">Title</th><th>Language</th><th>Difficulty</th><th>Deadline</th><th>Marks</th><th></th></tr></thead>
      <tbody>{rows.map(a=><tr key={a.id} className="border-b border-zinc-100 last:border-0"><td className="p-3 font-medium">{a.title}</td><td>{a.language}</td><td><Badge tone="blue">{a.difficulty}</Badge></td>
        <td>{a.deadline ? new Date(a.deadline).toLocaleDateString() : '—'}</td><td>{a.max_marks}</td>
        <td className="space-x-1 p-3 text-right"><Link to={`/admin/${a.id}/assign`}><Button variant="outline">Assign</Button></Link><Link to={`/admin/${a.id}/edit`}><Button variant="outline">Edit</Button></Link><Button variant="danger" onClick={()=>del(a.id)}>Delete</Button></td></tr>)}
        {!rows.length && <tr><td colSpan={6} className="p-8 text-center text-zinc-500">No assessments yet. Create your first one.</td></tr>}</tbody></table></Card></>
}
