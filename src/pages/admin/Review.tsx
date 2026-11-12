import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, Evaluation } from '../../lib/api'
import Report from '../../components/Report'
import { Button, Card, Badge, PageHeader, statusTone } from '../../components/ui'
export default function Review() {
  const { id } = useParams(); const [s,setS] = useState<any>(null); const [ev,setEv] = useState<Evaluation|null>(null); const [busy,setBusy] = useState(''); const [err,setErr] = useState('')
  const load = async () => { const d = await api.get('/submissions/'+id); setS(d.submission); setEv(d.evaluation) }
  useEffect(()=>{ load() },[id])
  const run = async () => { setBusy('ai'); setErr(''); try { await api.post(`/submissions/${id}/evaluate`) } catch(e:any){ setErr(e.message) } await load(); setBusy('') }
  const save = async (publish:boolean) => { if(!ev) return; setBusy('save'); try { await api.put(`/submissions/${id}/evaluation`,{ ...ev, publish }) } catch(e:any){ alert(e.message) } await load(); setBusy('') }
  if(!s) return null
  return <><PageHeader title={s.assessment?.title} sub={`${s.student?.full_name} · ${s.student?.email} · version ${s.version}`} action={<Badge tone={statusTone[s.status]}>{s.status}</Badge>}/>
    <Card className="mb-4 flex flex-wrap items-center gap-2 text-sm">
      {(s.zip_path || s.file_id) && <Button variant="outline" onClick={()=>api.download(`/submissions/${id}/download`,'submission.zip')}>Download ZIP</Button>}
      {s.github_url && <a className="text-blue-600 hover:underline" href={s.github_url} target="_blank">GitHub repository</a>}
      <div className="ml-auto flex gap-2"><Button variant="outline" onClick={run} disabled={!!busy}>{busy==='ai'?'Evaluating…':ev?'Re-run AI evaluation':'Run AI evaluation'}</Button>
        {ev && <><Button variant="outline" onClick={()=>save(false)} disabled={!!busy}>Save feedback</Button><Button onClick={()=>save(true)} disabled={!!busy}>Approve & publish</Button></>}</div></Card>
    {err && <p className="mb-4 text-sm text-red-600">{err}</p>}
    {ev ? <Report ev={ev} editable onChange={setEv}/> : <Card className="py-10 text-center text-sm text-zinc-500">No evaluation yet. Run the AI evaluation to generate a draft you can review.</Card>}</>
}
