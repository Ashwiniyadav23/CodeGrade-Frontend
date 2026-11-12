import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button, Card, PageHeader } from '../../components/ui'
type S = { id:string; full_name:string; email:string; batch:string|null }
export default function Assign() {
  const { id } = useParams(); const nav = useNavigate(); const [students,setStudents] = useState<S[]>([]); const [sel,setSel] = useState<Set<string>>(new Set())
  useEffect(()=>{ (async()=>{ setStudents(await api.get('/students')); setSel(new Set(await api.get(`/assessments/${id}/assignments`))) })() },[id])
  const batches = [...new Set(students.map(s=>s.batch).filter(Boolean))] as string[]
  const toggle = (sid:string) => setSel(p=>{ const n = new Set(p); n.has(sid)?n.delete(sid):n.add(sid); return n })
  const batch = (b:string) => setSel(p=>{ const n = new Set(p); students.filter(s=>s.batch===b).forEach(s=>n.add(s.id)); return n })
  const save = async () => { try { await api.put(`/assessments/${id}/assignments`,{ studentIds:[...sel] }); nav('/admin') } catch(e:any){ alert(e.message) } }
  return <><PageHeader title="Assign assessment" sub={`${sel.size} student(s) selected`} action={<Button onClick={save}>Save assignments</Button>}/>
    <Card className="mb-4 flex flex-wrap items-center gap-2"><span className="text-sm text-zinc-500">Add a whole batch:</span>{batches.map(b=><Button key={b} variant="outline" onClick={()=>batch(b)}>{b}</Button>)}
      <Button variant="ghost" onClick={()=>setSel(new Set())}>Clear</Button></Card>
    <Card className="p-0"><table className="w-full text-sm"><tbody>{students.map(s=><tr key={s.id} className="border-b border-zinc-100 last:border-0"><td className="w-10 p-3"><input type="checkbox" checked={sel.has(s.id)} onChange={()=>toggle(s.id)}/></td>
      <td className="font-medium">{s.full_name}</td><td className="text-zinc-500">{s.email}</td><td className="text-zinc-500">{s.batch}</td></tr>)}
      {!students.length && <tr><td className="p-8 text-center text-zinc-500">No students have signed up yet.</td></tr>}</tbody></table></Card></>
}
