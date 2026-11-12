import { Evaluation, EvalCriterion, LEVEL_LABEL, LEVELS } from '../lib/api'
import { Card, Badge } from './ui'
type Props = { ev:Evaluation; editable?:boolean; onChange?:(e:Evaluation)=>void }
export default function Report({ ev, editable, onChange }:Props) {
  const levelFor = (total:number):Evaluation['performance_level'] => { const percentage = ev.max ? total / ev.max * 100 : 0; return percentage < 30 ? 'Basic' : percentage < 70 ? 'Average' : percentage < 85 ? 'Good' : 'Excellent' }
  const setCrit = (i:number, patch:Partial<EvalCriterion>) => {
    const criteria = ev.criteria.map((c,j)=> j===i ? { ...c, ...patch, score: Math.min(Math.max(Number(patch.score ?? c.score),0), c.max) } : c)
    const total = criteria.reduce((s,c)=>s+Number(c.score),0)
    onChange?.({ ...ev, criteria, total, performance_level: levelFor(total) })
  }
  const list = (k:'strengths'|'weaknesses'|'suggestions', title:string) => <Card><h3 className="mb-2 text-sm font-semibold">{title}</h3>
    {editable ? <textarea rows={5} value={ev[k].join('\n')} onChange={e=>onChange?.({ ...ev, [k]: e.target.value.split('\n').filter(Boolean) })}/>
    : <ul className="list-disc space-y-1 pl-4 text-sm text-zinc-700">{ev[k].map((s,i)=><li key={i}>{s}</li>)}</ul>}</Card>
  return <div className="space-y-4">
    <Card className="flex items-center justify-between"><div><div className="text-sm text-zinc-500">Total marks</div><div className="text-3xl font-semibold">{ev.total}<span className="text-lg text-zinc-400"> / {ev.max}</span></div><div className="mt-1 text-sm text-zinc-600">Performance: <span className="font-medium">{ev.performance_level}</span></div></div>
      <Badge tone={ev.status==='published'?'green':'amber'}>{ev.status==='published'?'Published':'Draft'}</Badge></Card>
    <Card><h3 className="mb-1 text-sm font-semibold">Summary</h3>{editable ? <textarea rows={3} value={ev.summary} onChange={e=>onChange?.({ ...ev, summary:e.target.value })}/> : <p className="text-sm text-zinc-700">{ev.summary}</p>}</Card>
    <Card className="divide-y divide-zinc-100 p-0">{ev.criteria.map((c,i)=><div key={c.criterion_id} className="p-5">
      <div className="flex items-center justify-between"><div className="font-medium">{c.name}</div>
        <div className="flex items-center gap-2">{editable ? <><select className="!w-40" value={c.level} onChange={e=>setCrit(i,{ level:e.target.value })}>{LEVELS.map(l=><option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}</select>
          <input className="!w-16" type="number" value={c.score} onChange={e=>setCrit(i,{ score:Number(e.target.value) })}/></> : <><Badge tone="blue">{LEVEL_LABEL[c.level] ?? c.level}</Badge><span className="text-sm font-medium">{c.score}</span></>}
          <span className="text-sm text-zinc-500">/ {c.max}</span></div></div>
      {editable ? <textarea className="mt-2" rows={3} value={c.feedback} onChange={e=>setCrit(i,{ feedback:e.target.value })}/> : <p className="mt-2 text-sm text-zinc-700">{c.feedback}</p>}
      {editable ? <textarea className="mt-2" rows={2} placeholder="Evidence supporting this score" value={c.evidence} onChange={e=>setCrit(i,{ evidence:e.target.value })}/> : c.evidence && <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-md bg-zinc-50 p-2 text-xs text-zinc-600">{c.evidence}</pre>}</div>)}</Card>
    {editable ? <Card><h3 className="mb-2 text-sm font-semibold">Mentor recommendations</h3><textarea rows={5} value={ev.mentor_recommendations} onChange={e=>onChange?.({ ...ev, mentor_recommendations:e.target.value })}/></Card>
      : <Card><h3 className="mb-2 text-sm font-semibold">Mentor recommendations</h3><p className="whitespace-pre-wrap text-sm text-zinc-700">{ev.mentor_recommendations}</p></Card>}
    <div className="grid gap-4 md:grid-cols-3">{list('strengths','Strengths')}{list('weaknesses','Weaknesses')}{list('suggestions','Improvement suggestions')}</div></div>
}
