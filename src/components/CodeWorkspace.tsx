import Editor from '@monaco-editor/react'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
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
  const [command, setCommand] = useState('')
  const [search, setSearch] = useState('')
  const [palette, setPalette] = useState(false)
  const [panel, setPanel] = useState<'explorer' | 'search'>('explorer')
  const [contextFile, setContextFile] = useState<string | null>(null)
  const [terminalHeight, setTerminalHeight] = useState(190)
  const [workspaceHeight, setWorkspaceHeight] = useState(() => Math.max(420, window.innerHeight - 220))
  const resizing = useRef<'workspace' | 'terminal' | null>(null)
  const editorRef = useRef<any>(null)
  useEffect(() => {
    const onResize = () => setWorkspaceHeight(Math.max(420, window.innerHeight - 220))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (resizing.current === 'workspace') setWorkspaceHeight(Math.max(420, event.clientY - 120))
      if (resizing.current === 'terminal') setTerminalHeight(Math.min(420, Math.max(120, window.innerHeight - event.clientY)))
    }
    const stop = () => { resizing.current = null; document.body.style.cursor = '' }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', stop)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', stop) }
  }, [])
  useEffect(() => { api.get(`/assessments/${assessmentId}/workspace`).then(d => { setFiles(d.files); setActive(d.files[0]?.path || '') }).catch(e => setOutput(e.message)) }, [assessmentId])
  const current = files.find(f => f.path === active)
  const groups = useMemo(() => [...new Set(files.map(f => parent(f.path)))], [files])
  const updateCurrent = (content: string) => setFiles(files.map(f => f.path === active ? { ...f, content } : f))
  const save = async () => { setBusy('save'); try { await api.put(`/assessments/${assessmentId}/workspace`, { files }); setOutput('Workspace saved.') } catch (e: any) { setOutput(`Save failed: ${e.message}`) } setBusy('') }
  const run = async (terminalCommand?: string) => { await save(); setBusy('run'); setOutput('Running in an isolated sandbox…'); try { const d = await api.post(`/assessments/${assessmentId}/workspace/run`, { files, entrypoint: active, command: terminalCommand }); setOutput([`Status: ${d.status || 'completed'}${d.durationMs ? ` · ${d.durationMs} ms` : ''}`, d.output, d.error].filter(Boolean).join('\n') || 'Process finished without output.') } catch (e: any) { setOutput(`Run failed: ${e.message}`) } setBusy('') }
  const stop = async () => { try { await api.post(`/assessments/${assessmentId}/workspace/stop`); setOutput('Process stopped.') } catch (e: any) { setOutput(`Stop failed: ${e.message}`) } setBusy('') }
  const submit = async () => { setBusy('submit'); try { await api.post(`/assessments/${assessmentId}/workspace/submit`, { files }); setOutput('Submitted successfully.'); onSubmitted() } catch (e: any) { setOutput(`Submit failed: ${e.message}`) } setBusy('') }
  const addFile = () => { const name = window.prompt('New file path', 'index.js')?.trim(); if (!name || files.some(f => f.path === name)) return; setFiles([...files, { path: name, content: '' }]); setActive(name) }
  const rename = () => { if (!active) return; const name = window.prompt('Rename file', active)?.trim(); if (!name || files.some(f => f.path === name)) return; setFiles(files.map(f => f.path === active ? { ...f, path: name } : f)); setActive(name) }
  const remove = (file = active) => { if (files.length === 1) return; if (window.confirm(`Delete ${file}?`)) { const next = files.filter(f => f.path !== file); setFiles(next); setActive(next[0].path) } }
  const renameFile = (file = active) => { const name = window.prompt('Rename file', file)?.trim(); if (!name || files.some(f => f.path === name)) return; setFiles(files.map(f => f.path === file ? { ...f, path: name } : f)); setActive(name); setContextFile(null) }
  const executeCommand = (event: FormEvent) => { event.preventDefault(); const value = command.trim(); if (!value) return; setCommand(''); run(value) }
  const filteredFiles = files.filter(f => !search || f.path.toLowerCase().includes(search.toLowerCase()) || f.content.toLowerCase().includes(search.toLowerCase()))
  return <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#1e1e1e] text-slate-200 shadow-xl" style={{ height: workspaceHeight }}>
    <div className="flex items-center justify-between border-b border-slate-700 bg-[#252526] px-3 py-2">
      <div className="flex items-center gap-2 text-sm"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Code workspace</div>
      <div className="flex gap-2"><Button variant="ghost" className="!h-8 !px-3 !text-xs text-slate-200 hover:bg-slate-700" onClick={addFile} disabled={disabled}>New file</Button><Button variant="ghost" className="!h-8 !px-3 !text-xs text-slate-200 hover:bg-slate-700" onClick={() => rename()} disabled={disabled || !active}>Rename</Button><Button variant="ghost" className="!h-8 !px-3 !text-xs text-slate-200 hover:bg-slate-700" onClick={() => remove()} disabled={disabled || files.length < 2}>Delete</Button></div>
    </div>
    <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)]">
      <aside className="flex border-r border-slate-700 bg-[#252526]">
        <div className="flex w-12 shrink-0 flex-col items-center gap-2 border-r border-slate-700 py-3"><button className={`p-2 ${panel === 'explorer' ? 'text-white' : 'text-slate-500'}`} title="Explorer" onClick={() => setPanel('explorer')}>▤</button><button className={`p-2 ${panel === 'search' ? 'text-white' : 'text-slate-500'}`} title="Search" onClick={() => setPanel('search')}>⌕</button><button className="p-2 text-slate-500" title="Command palette" onClick={() => setPalette(true)}>⌘</button></div>
        <div className="min-w-0 flex-1 p-3">
        <div className="mb-4 border-b border-slate-700 pb-4"><div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Assessment</div>{questions.map((q, i) => <div key={i} className="mb-3 text-xs"><div className="font-semibold text-slate-200">{i + 1}. {q.title}</div><p className="mt-1 whitespace-pre-wrap text-slate-400">{q.description} {q.instructions}</p></div>)}</div>
        {panel === 'search' ? <><div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Search</div><input autoFocus className="!border-slate-600 !bg-[#1e1e1e] !text-slate-200" placeholder="Search files" value={search} onChange={e => setSearch(e.target.value)} />{filteredFiles.map(f => <button key={f.path} className="mt-2 block w-full truncate text-left text-xs text-slate-300" onClick={() => { setActive(f.path); setPanel('explorer') }}>{f.path}</button>)}</> : <><div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Explorer</div>{groups.map(group => <div key={group} className="mb-2"><div className="px-2 py-1 text-xs text-slate-500">{group}</div>{filteredFiles.filter(f => parent(f.path) === group).map(f => <button key={f.path} onContextMenu={e => { e.preventDefault(); setContextFile(f.path) }} className={`block w-full truncate rounded px-2 py-1.5 text-left text-sm ${active === f.path ? 'bg-[#37373d] text-white' : 'text-slate-300 hover:bg-[#2d2d30]'}`} onClick={() => setActive(f.path)}>{f.path.split('/').pop()}</button>)}</div>)}</>}
        <div className="mt-6 border-t border-slate-700 pt-4 text-xs text-slate-500">JavaScript and JSON are supported with autocomplete, formatting, bracket matching, diagnostics, and syntax highlighting.</div>
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-col">
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden"><div className="flex h-9 overflow-x-auto border-b border-slate-700 bg-[#252526]">{files.map(f => <button key={f.path} className={`shrink-0 border-r border-slate-700 px-3 text-xs ${active === f.path ? 'bg-[#1e1e1e] text-white' : 'text-slate-400'}`} onClick={() => setActive(f.path)}>{f.path.split('/').pop()} ×</button>)}</div><div className="border-b border-slate-700 bg-[#1e1e1e] px-4 py-2 text-xs text-slate-400">{active || 'No file selected'}</div>{current && <Editor theme="vs-dark" path={current.path} language={languageFor(current.path)} value={current.content} onChange={v => updateCurrent(v ?? '')} onMount={editor => { editorRef.current = editor }} options={{ automaticLayout: true, minimap: { enabled: false }, tabSize: 2, formatOnPaste: true, formatOnType: true, suggestOnTriggerCharacters: true, bracketPairColorization: { enabled: true } }} />}</div>
        <div className="relative min-h-[160px] min-w-0 shrink-0 overflow-hidden border-t border-slate-700 bg-[#181818]" style={{ height: terminalHeight }}><button aria-label="Resize terminal" title="Drag to resize terminal" className="absolute -top-1 left-0 z-10 h-2 w-full cursor-row-resize bg-slate-600/50 hover:bg-blue-500" onMouseDown={() => { resizing.current = 'terminal'; document.body.style.cursor = 'row-resize' }} /><div className="flex h-[42px] shrink-0 items-center justify-between border-b border-slate-700 px-3 text-xs"><span className="font-semibold tracking-wide text-slate-300">TERMINAL</span><div className="flex gap-2"><button className="text-blue-400" onClick={() => editorRef.current?.getAction('editor.action.formatDocument')?.run()}>Format</button><button className="text-blue-400" onClick={() => run()} disabled={!!busy || disabled}>Run / Restart</button><button className="text-rose-400" onClick={stop} disabled={busy !== 'run'}>Stop</button><button className="text-blue-400" onClick={save} disabled={!!busy || disabled}>Save</button><button className="font-semibold text-emerald-400" onClick={submit} disabled={!!busy || disabled}>Submit code</button></div></div><pre className="h-[calc(100%-78px)] overflow-auto whitespace-pre-wrap p-3 font-mono text-xs text-slate-300">{output}</pre><form onSubmit={executeCommand} className="flex h-9 items-center border-t border-slate-700 px-3"><span className="mr-2 text-emerald-400">$</span><input className="!border-0 !bg-transparent !p-0 !text-xs !shadow-none !ring-0 !text-slate-200" value={command} onChange={e => setCommand(e.target.value)} placeholder="node index.js (sandboxed)" disabled={disabled || !!busy} /></form></div>
      </div>
    </div>
    <button aria-label="Resize workspace" title="Drag to resize workspace" className="h-2 w-full cursor-row-resize border-t border-slate-700 bg-slate-700/70 hover:bg-blue-500" onMouseDown={() => { resizing.current = 'workspace'; document.body.style.cursor = 'row-resize' }} />
    {contextFile && <div className="fixed z-50 rounded border border-slate-600 bg-[#252526] p-1 text-xs shadow-xl" style={{ left: 250, top: 180 }}><button className="block w-full px-3 py-2 text-left hover:bg-slate-700" onClick={() => renameFile(contextFile)}>Rename</button><button className="block w-full px-3 py-2 text-left hover:bg-slate-700" onClick={() => { remove(contextFile); setContextFile(null) }}>Delete</button></div>}
    {palette && <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setPalette(false)}><div className="mx-auto mt-24 w-96 rounded border border-slate-600 bg-[#252526] p-2 shadow-2xl" onClick={e => e.stopPropagation()}><input autoFocus className="!border-slate-600 !bg-[#1e1e1e] !text-slate-200" placeholder="Type a command…" onKeyDown={e => { if (e.key === 'Escape') setPalette(false) }} /><button className="mt-2 block w-full p-2 text-left text-sm hover:bg-slate-700" onClick={() => { addFile(); setPalette(false) }}>New file</button><button className="block w-full p-2 text-left text-sm hover:bg-slate-700" onClick={() => { save(); setPalette(false) }}>Save workspace</button><button className="block w-full p-2 text-left text-sm hover:bg-slate-700" onClick={() => { run(); setPalette(false) }}>Run active file</button></div></div>}
  </div>
}
