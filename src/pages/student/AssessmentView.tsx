import { useEffect, useRef, useState, SyntheticEvent, KeyboardEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, Assessment, Evaluation } from '../../lib/api'
import Report from '../../components/Report'
import { Badge, Button, Card, Label, PageHeader, statusTone } from '../../components/ui'

type SpeechRecognitionResultEvent = Event & {
  results: { [index: number]: { [index: number]: { transcript: string } } }
}

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  onend: (() => void) | null
  onerror: (() => void) | null
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  start: () => void
  stop: () => void
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
}

export default function AssessmentView() {
  const { id } = useParams();
  const [a,setA] = useState<Assessment|null>(null); const [sub,setSub] = useState<any>(null); const [ev,setEv] = useState<Evaluation|null>(null)
  const [file,setFile] = useState<File|null>(null); const [gh,setGh] = useState(''); const [busy,setBusy] = useState(false)
  const [answers,setAnswers] = useState<string[]>([])
  const [listeningIndex, setListeningIndex] = useState<number|null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance|null>(null)
  const load = async () => { const d = await api.get(`/assessments/${id}/my`); setA(d.assessment); setSub(d.submission); setEv(d.evaluation) }
  useEffect(()=>{ load() },[id])
  useEffect(()=>{ if (sub?.theory_questions) setAnswers(sub.theory_questions.map((_:any,i:number)=>sub.theory_answers?.[i] || '')) },[sub])
  useEffect(() => () => { recognitionRef.current?.stop() }, [])
  if(!a) return null
  const late = !!a.deadline && new Date(a.deadline) < new Date()
  const canSubmit = !late && (!sub || a.allow_resubmit)
  const speechSupported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  const toggleSpeech = (index: number) => {
    if (!speechSupported) return
    if (listeningIndex === index) {
      recognitionRef.current?.stop()
      setListeningIndex(null)
      return
    }
    recognitionRef.current?.stop()
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) return
    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = navigator.language
    recognition.onresult = event => {
      const transcript = Object.values(event.results).map(result => result[0].transcript).join(' ')
      setAnswers(previous => previous.map((answer, answerIndex) => answerIndex === index
        ? `${answer}${answer ? ' ' : ''}${transcript}`
        : answer))
    }
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return
      recognitionRef.current = null
      setListeningIndex(null)
    }
    recognition.onerror = () => {
      if (recognitionRef.current !== recognition) return
      recognitionRef.current = null
      setListeningIndex(null)
      alert('Speech recognition could not hear you. Please try again or type your answer.')
    }
    recognitionRef.current = recognition
    setListeningIndex(index)
    try {
      recognition.start()
    } catch {
      recognitionRef.current = null
      setListeningIndex(null)
      alert('Speech recognition could not start. Please try again or type your answer.')
    }
  }
  const submit = async () => {
    if(!file && !gh) return alert('Upload a ZIP file or add a GitHub link.')
    if(file && !file.name.toLowerCase().endsWith('.zip')) return alert('Please upload a .zip file.')
    setBusy(true); const fd = new FormData(); if(file) fd.append('file',file); fd.append('github_url',gh)
    try { await api.post(`/assessments/${a.id}/submissions`,fd); setFile(null); setGh(''); await load() } catch(e:any){ alert(e.message) } setBusy(false) }
  const submitTheory = async () => { if (!answers.length || answers.some(answer => !answer.trim())) return alert('Answer every theory question before submitting.'); setBusy(true); try { await api.post(`/assessments/${a.id}/theory`, { answers }); await load() } catch(e:any) { alert(e.message) } setBusy(false) }
  const blockQuestionCopy = (event: SyntheticEvent) => { if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) return; event.preventDefault() }
  const blockQuestionKey = (event: KeyboardEvent) => { if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) return; if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'c') event.preventDefault() }
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
      {sub?.theory_questions?.length > 0 && !ev && <Card><h3 className="mb-2 font-semibold">Theory assessment</h3><p className="mb-4 text-sm text-zinc-600">Answer every question based on your submitted implementation. You can type or use the microphone to speak your answer.</p><div className="space-y-4" onCopy={blockQuestionCopy} onContextMenu={blockQuestionCopy} onKeyDown={blockQuestionKey}>{sub.theory_questions.map((q:any,i:number)=><div key={q.id} className="rounded-md border border-zinc-200 p-3"><div className="select-none text-sm font-medium">{i+1}. {q.question}</div><div className="mt-2 flex items-start gap-2"><textarea className="mt-0" rows={4} value={answers[i] || ''} onChange={e=>setAnswers(previous=>previous.map((answer,j)=>j===i?e.target.value:answer))} placeholder="Explain your answer..." /><Button type="button" variant={listeningIndex === i ? 'danger' : 'outline'} className="shrink-0 px-3" onClick={()=>toggleSpeech(i)} disabled={!speechSupported || busy} aria-label={listeningIndex === i ? 'Stop speaking' : 'Speak your answer'} title={speechSupported ? 'Speak your answer' : 'Speech recognition is not supported in this browser'}>{listeningIndex === i ? 'Stop' : '🎤'}</Button></div></div>)}</div><Button className="mt-4" onClick={submitTheory} disabled={busy}>{busy?'Submitting answers…':'Submit theory answers'}</Button>{!speechSupported && <p className="mt-2 text-xs text-zinc-500">Voice answers are not supported in this browser. You can still type your answers.</p>}</Card>}
      {ev ? <><h2 className="pt-2 text-lg font-semibold">Evaluation feedback</h2><Report ev={ev}/></> : sub && <Card className="text-sm text-zinc-500">Your evaluation feedback will appear here once your instructor reviews it.</Card>}</div></>
}
