import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, Assessment, Evaluation } from '../../lib/api'
import Report from '../../components/Report'
import { Badge, Button, Card, Label, PageHeader, statusTone } from '../../components/ui'
export default function AssessmentView() {
  const { id } = useParams();
  const [a,setA] = useState<Assessment|null>(null); const [sub,setSub] = useState<any>(null); const [ev,setEv] = useState<Evaluation|null>(null)
  const [file,setFile] = useState<File|null>(null); const [gh,setGh] = useState(''); const [busy,setBusy] = useState(false)
  const load = async () => { const d = await api.get(`/assessments/${id}/my`); setA(d.assessment); setSub(d.submission); setEv(d.evaluation) }
  useEffect(()=>{ load() },[id])
  if(!a) return null
  const late = !!a.deadline && new Date(a.deadline) < new Date()
  const canSubmit = !late && (!sub || a.allow_resubmit)
  const submit = async () => {
    if(!file && !gh) return alert('Upload a ZIP file or add a GitHub link.')
    if(file && !file.name.toLowerCase().endsWith('.zip')) return alert('Please upload a .zip file.')
    setBusy(true); const fd = new FormData(); if(file) fd.append('file',file); fd.append('github_url',gh)
    try { await api.post(`/assessments/${a.id}/submissions`,fd); setFile(null); setGh(''); await load() } catch(e:any){ alert(e.message) } setBusy(false) }
  return <><PageHeader title={a.title} sub={`${a.language} · ${a.difficulty} · Due ${a.deadline?new Date(a.deadline).toLocaleString():'no deadline'} · ${a.max_marks} marks`} action={sub && <Badge tone={statusTone[sub.status]}>{sub.status==='review'?'Under review':sub.status}</Badge>}/>
    <div className="space-y-4">
      {a.description && <Card><p className="whitespace-pre-wrap text-sm text-zinc-700">{a.description}</p>{a.starter_url && <a href={a.starter_url} target="_blank"><Button variant="outline" className="mt-3">Download starter files</Button></a>}</Card>}
      {a.questions.map((q,i)=><Card key={q.id}><div className="whitespace-pre-wrap font-medium">{i+1}. {q.title}</div><p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{q.description}</p>
        {q.instructions && <p className="mt-2 whitespace-pre-wrap rounded-md bg-zinc-50 p-3 text-sm text-zinc-600">{q.instructions}</p>}</Card>)}
      <Card><h3 className="mb-3 font-semibold">Evaluation rubric</h3><div className="space-y-3">{a.rubric.map(c=><details key={c.id} className="rounded-md border border-zinc-200 p-3"><summary className="cursor-pointer text-sm font-medium">{c.name} <span className="text-zinc-500">({c.marks} marks)</span></summary>
        <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600">{c.description}</p></details>)}</div></Card>
      <Card><h3 className="mb-2 font-semibold">VS Code workspace</h3><p className="mb-3 text-sm text-zinc-600">Write, run, and submit your project in the browser without uploading a ZIP.</p><Link to={`/student/${a.id}/code`}><Button>Open coding workspace</Button></Link></Card>
      <Card><h3 className="mb-3 font-semibold">Legacy submission (optional)</h3>
        {sub && <p className="mb-3 text-sm text-zinc-500">Version {sub.version} submitted {new Date(sub.created_at).toLocaleString()}.</p>}
        {canSubmit ? <div className="space-y-3">        <div><Label>Project folder as ZIP (images included)</Label><p className="mb-1 text-xs text-zinc-500">Include images inside the ZIP with your project files.</p><input type="file" accept=".zip,application/zip" onChange={e=>setFile(e.target.files?.[0]??null)}/></div>
          <div><Label>GitHub repository link (optional)</Label><input placeholder="https://github.com/you/project" value={gh} onChange={e=>setGh(e.target.value)}/></div>
          <Button onClick={submit} disabled={busy}>{busy?'Uploading and evaluating…':sub?'Resubmit':'Submit assignment'}</Button></div>
          : <p className="text-sm text-zinc-500">{late?'The deadline has passed.':'Resubmission is not enabled for this assessment.'}</p>}</Card>
      {ev ? <><h2 className="pt-2 text-lg font-semibold">Evaluation feedback</h2><Report ev={ev}/></> : sub && <Card className="text-sm text-zinc-500">Your evaluation feedback will appear here once your instructor reviews it.</Card>}</div></>
}
