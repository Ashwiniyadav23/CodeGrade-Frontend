import Editor from '@monaco-editor/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api'
import { Button } from './ui'

type CodeFile = { path: string; content: string }
type Props = { assessmentId: string; questions: { title: string; description: string; instructions: string }[]; disabled?: boolean; onSubmitted: () => void }

const languageFor = (file: string) => file.endsWith('.json') ? 'json' : file.endsWith('.ts') || file.endsWith('.tsx') ? 'typescript' : 'javascript'
const parent = (file: string) => file.includes('/') ? file.slice(0, file.lastIndexOf('/')) : 'root'

export default function CodeWorkspace({ assessmentId, questions, disabled, onSubmitted }: Props) {
  const [files, setFiles] = useState<CodeFile[]>([])
  const [active, setActive] = useState('')
  const [output, setOutput] = useState('Ready. Run your code to see output here.')
  const [busy, setBusy] = useState('')
  const editorRef = useRef<any>(null)
  useEffect(() => { api.get(`/assessments/${assessmentId}/workspace`).then(d => { setFiles(d.files); setActive(d.files[0]?.path || '') }).catch(e => setOutput(e.message)) }, [assessmentId])
  const current = files.find(f => f.path === active)
  const groups = useMemo(() => [...new Set(files.map(f => parent(f.path)))], [files])
  const updateCurrent = (content: string) => setFiles(files.map(f => f.path === active ? { ...f, content } : f))
  const save = async () => { setBusy('save'); try { await api.put(`/assessments/${assessmentId}/workspace`, { files }); setOutput('Workspace saved.') } catch (e: any) { setOutput(`Save failed: ${e.message}`) } setBusy('') }
  const run = async () => { await save(); setBusy('run'); setOutput('Running in an isolated sandbox…'); try { const d = await api.post(`/assessments/${assessmentId}/workspace/run`, { files, entrypoint: active }); setOutput([d.output, d.error].filter(Boolean).join('\n') || 'Process finished without output.') } catch (e: any) { setOutput(`Run failed: ${e.message}`) } setBusy('') }
  const stop = async () => { try { await api.post(`/assessments/${assessmentId}/workspace/stop`); setOutput('Process stopped.') } catch (e: any) { setOutput(`Stop failed: ${e.message}`) } setBusy('') }
  const submit = async () => { setBusy('submit'); try { await api.post(`/assessments/${assessmentId}/workspace/submit`, { files }); setOutput('Submitted successfully.'); onSubmitted() } catch (e: any) { setOutput(`Submit failed: ${e.message}`) } setBusy('') }
  const addFile = () => { const name = window.prompt('New file path', 'index.js')?.trim(); if (!name || files.some(f => f.path === name)) return; setFiles([...files, { path: name, content: '' }]); setActive(name) }
  const rename = () => { if (!active) return; const name = window.prompt('Rename file', active)?.trim(); if (!name || files.some(f => f.path === name)) return; setFiles(files.map(f => f.path === active ? { ...f, path: name } : f)); setActive(name) }
  const remove = () => { if (files.length === 1) return; if (window.confirm(`Delete ${active}?`)) { const next = files.filter(f => f.path !== active); setFiles(next); setActive(next[0].path) } }
  return <div className="flex h-[calc(100vh-220px)] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#1e1e1e] text-slate-200 shadow-xl">
    <div className="flex items-center justify-between border-b border-slate-700 bg-[#252526] px-3 py-2">
      <div className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Code workspace</div>
      <div className="flex gap-2"><Button variant="ghost" className="!h-8 !px-3 !text-xs text-slate-200 hover:bg-slate-700" onClick={addFile} disabled={disabled}>New file</Button><Button variant="ghost" className="!h-8 !px-3 !text-xs text-slate-200 hover:bg-slate-700" onClick={rename} disabled={disabled || !active}>Rename</Button><Button variant="ghost" className="!h-8 !px-3 !text-xs text-slate-200 hover:bg-slate-700" onClick={remove} disabled={disabled || files.length < 2}>Delete</Button></div>
    </div>
    <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)]">
      <aside className="border-r border-slate-700 bg-[#252526] p-3">
        <div className="mb-4 border-b border-slate-700 pb-4"><div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Assessment</div>{questions.map((q, i) => <div key={i} className="mb-3 text-xs"><div className="font-semibold text-slate-200">{i + 1}. {q.title}</div><p className="mt-1 whitespace-pre-wrap text-slate-400">{q.description} {q.instructions}</p></div>)}</div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Explorer</div>
        {groups.map(group => <div key={group} className="mb-2"><div className="px-2 py-1 text-xs text-slate-500">{group}</div>{files.filter(f => parent(f.path) === group).map(f => <button key={f.path} className={`block w-full truncate rounded px-2 py-1.5 text-left text-sm ${active === f.path ? 'bg-[#37373d] text-white' : 'text-slate-300 hover:bg-[#2d2d30]'}`} onClick={() => setActive(f.path)}>{f.path.split('/').pop()}</button>)}</div>)}
        <div className="mt-6 border-t border-slate-700 pt-4 text-xs text-slate-500">JavaScript and JSON are supported with autocomplete, formatting, bracket matching, diagnostics, and syntax highlighting.</div>
      </aside>
      <div className="grid min-w-0 grid-rows-[minmax(300px,1fr)_190px]">
        <div className="min-h-0"><div className="border-b border-slate-700 bg-[#1e1e1e] px-4 py-2 text-xs text-slate-400">{active || 'No file selected'}</div>{current && <Editor theme="vs-dark" path={current.path} language={languageFor(current.path)} value={current.content} onChange={v => updateCurrent(v ?? '')} onMount={editor => { editorRef.current = editor }} options={{ automaticLayout: true, minimap: { enabled: false }, tabSize: 2, formatOnPaste: true, formatOnType: true, suggestOnTriggerCharacters: true, bracketPairColorization: { enabled: true } }} />}</div>
        <div className="border-t border-slate-700 bg-[#181818]"><div className="flex items-center justify-between border-b border-slate-700 px-3 py-2 text-xs"><span>TERMINAL</span><div className="flex gap-2"><button className="text-blue-400" onClick={() => editorRef.current?.getAction('editor.action.formatDocument')?.run()}>Format</button><button className="text-blue-400" onClick={run} disabled={!!busy || disabled}>Run / Restart</button><button className="text-rose-400" onClick={stop} disabled={busy !== 'run'}>Stop</button><button className="text-blue-400" onClick={save} disabled={!!busy || disabled}>Save</button><button className="font-semibold text-emerald-400" onClick={submit} disabled={!!busy || disabled}>Submit code</button></div></div><pre className="h-[145px] overflow-auto whitespace-pre-wrap p-3 font-mono text-xs text-slate-300">{output}</pre></div>
      </div>
    </div>
  </div>
}
