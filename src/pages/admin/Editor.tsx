import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, uid, LEVELS, LEVEL_LABEL, Assessment, Criterion, Question } from '../../lib/api'
import { Button, Card, Label, PageHeader } from '../../components/ui'
const blank = { title:'', description:'', language:'Python', difficulty:'Medium', deadline:'', max_marks:0, allow_resubmit:false, starter_url:null as string|null, questions:[] as Question[], rubric:[] as Criterion[] }
export default function Editor() {
  const { id } = useParams(); const nav = useNavigate(); const [a,setA] = useState<any>(blank); const [busy,setBusy] = useState(false)
  useEffect(()=>{ if(id) api.get('/assessments/'+id).then(data=>setA({ ...data, deadline: data.deadline ? new Date(data.deadline).toISOString().slice(0,16) : '' })) },[id])
  const total = a.rubric.reduce((s:number,c:Criterion)=>s+Number(c.marks||0),0)
  const set = (k:string,v:any) => setA((p:any)=>({ ...p, [k]:v }))
  const upd = (k:'questions'|'rubric', i:number, patch:any) => set(k, a[k].map((x:any,j:number)=>j===i?{ ...x, ...patch }:x))
  const upload = async (f:File) => { const fd = new FormData(); fd.append('file',f); try { const r = await api.post('/upload/starter',fd); set('starter_url', r.url) } catch(e:any){ alert(e.message) } }
  const save = async () => { if(!a.title) return alert('Title is required'); setBusy(true)
    const row = { title:a.title, description:a.description, language:a.language, difficulty:a.difficulty, deadline:a.deadline?new Date(a.deadline).toISOString():null,
      max_marks: total || Number(a.max_marks), allow_resubmit:a.allow_resubmit, starter_url:a.starter_url, questions:a.questions, rubric:a.rubric }
    try { id ? await api.put('/assessments/'+id,row) : await api.post('/assessments',row); nav('/admin') } catch(e:any){ alert(e.message) } setBusy(false) }
  return <><PageHeader title={id?'Edit assessment':'New assessment'} action={<Button onClick={save} disabled={busy}>Save assessment</Button>}/>
    <div className="space-y-4">
      <Card className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2"><Label>Title</Label><input value={a.title} onChange={e=>set('title',e.target.value)}/></div>
        <div className="md:col-span-2"><Label>Description</Label><textarea rows={3} value={a.description} onChange={e=>set('description',e.target.value)}/></div>
        <div><Label>Language</Label><select value={a.language} onChange={e=>set('language',e.target.value)}>{['Python','JavaScript','TypeScript','Java','C++','C#','Go','Rust','PHP','MERN','Backend','Frontend','AI/ML'].map(l=><option key={l}>{l}</option>)}</select></div>
        <div><Label>Difficulty</Label><select value={a.difficulty} onChange={e=>set('difficulty',e.target.value)}>{['Easy','Medium','Hard'].map(l=><option key={l}>{l}</option>)}</select></div>
        <div><Label>Deadline</Label><input type="datetime-local" value={a.deadline} onChange={e=>set('deadline',e.target.value)}/></div>
        <div><Label>Maximum marks {total>0 && '(auto from rubric)'}</Label><input type="number" value={total||a.max_marks} disabled={total>0} onChange={e=>set('max_marks',e.target.value)}/></div>
        <div><Label>Starter files (ZIP, optional)</Label><input type="file" onChange={e=>e.target.files?.[0]&&upload(e.target.files[0])}/>{a.starter_url && <p className="mt-1 text-xs text-emerald-600">Starter file uploaded</p>}</div>
        <label className="flex items-center gap-2 pt-5 text-sm"><input type="checkbox" checked={a.allow_resubmit} onChange={e=>set('allow_resubmit',e.target.checked)}/>Allow resubmission before the deadline</label></Card>
      <Card><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Questions</h2><Button variant="outline" onClick={()=>set('questions',[...a.questions,{ id:uid(), title:'', description:'', instructions:'' }])}>Add question</Button></div>
        <div className="space-y-3">{a.questions.map((q:Question,i:number)=><div key={q.id} className="space-y-2 rounded-md border border-zinc-200 p-3">
          <div className="flex gap-2"><textarea className="min-h-24" rows={4} placeholder={`Question ${i+1}`} value={q.title} onChange={e=>upd('questions',i,{ title:e.target.value })}/><Button variant="ghost" onClick={()=>set('questions',a.questions.filter((_:any,j:number)=>j!==i))}>Remove</Button></div>
          <textarea rows={2} placeholder="Description" value={q.description} onChange={e=>upd('questions',i,{ description:e.target.value })}/>
          <textarea rows={2} placeholder="Instructions" value={q.instructions} onChange={e=>upd('questions',i,{ instructions:e.target.value })}/></div>)}</div></Card>
      <Card><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Rubric <span className="ml-2 text-sm font-normal text-zinc-500">Total: {total} marks</span></h2>
        <Button variant="outline" onClick={()=>set('rubric',[...a.rubric,{ id:uid(), name:'', description:'', marks:10, levels:{ excellent:'', good:'', average:'', needs_improvement:'' } }])}>Add criterion</Button></div>
        <div className="space-y-3">{a.rubric.map((c:Criterion,i:number)=><div key={c.id} className="space-y-2 rounded-md border border-zinc-200 p-3">
          <div className="flex gap-2"><input placeholder="Criterion name (e.g. Code quality)" value={c.name} onChange={e=>upd('rubric',i,{ name:e.target.value })}/><input className="!w-24" type="number" min={0} value={c.marks} onChange={e=>upd('rubric',i,{ marks:Number(e.target.value) })}/><Button variant="ghost" onClick={()=>set('rubric',a.rubric.filter((_:any,j:number)=>j!==i))}>Remove</Button></div>
          <textarea rows={5} placeholder="Describe what this criterion assesses. You can write multiple paragraphs." value={c.description} onChange={e=>upd('rubric',i,{ description:e.target.value })}/>
          <div className="grid gap-2 md:grid-cols-2">{LEVELS.map(l=><div key={l}><Label>{LEVEL_LABEL[l]}</Label><textarea rows={4} placeholder={`Describe the expectations for ${LEVEL_LABEL[l].toLowerCase()} performance.`} value={c.levels[l]} onChange={e=>upd('rubric',i,{ levels:{ ...c.levels, [l]:e.target.value } })}/></div>)}</div></div>)}</div></Card></div></>
}
