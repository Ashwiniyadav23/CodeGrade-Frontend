export const LEVELS = ['excellent','good','average','needs_improvement'] as const
export const LEVEL_LABEL: Record<string,string> = { excellent:'Excellent', good:'Good', average:'Average', needs_improvement:'Needs Improvement' }
export type Criterion = { id:string; name:string; description:string; marks:number }
export type Question = { id:string; title:string; description:string; instructions:string }
export type Assessment = { id:string; title:string; description:string; language:string; difficulty:string; deadline:string|null; max_marks:number; allow_resubmit:boolean; theory_enabled:boolean; theory_question_count:number; practical_marks:number; theory_marks:number; starter_url:string|null; questions:Question[]; rubric:Criterion[] }
export type EvalCriterion = { criterion_id:string; name:string; max:number; score:number; level:string; feedback:string; evidence:string }
export type TheoryCriterion = { question_id:string; question:string; answer:string; max:number; score:number; feedback:string }
export type Evaluation = { id:string; criteria:EvalCriterion[]; theory_criteria?:TheoryCriterion[]; practical_total?:number; practical_max?:number; theory_total?:number; theory_max?:number; total:number; max:number; strengths:string[]; weaknesses:string[]; suggestions:string[]; mentor_recommendations:string; performance_level:'Basic'|'Average'|'Good'|'Excellent'; summary:string; status:'draft'|'published' }
export const uid = () => crypto.randomUUID()
export const token = { get:()=>localStorage.getItem('token'), set:(t:string)=>localStorage.setItem('token',t), clear:()=>localStorage.removeItem('token') }
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
async function raw(path:string, opts:RequestInit={}) {
  const headers:Record<string,string> = { ...(token.get() ? { Authorization:`Bearer ${token.get()}` } : {}) }
  if(opts.body && !(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json'
  const res = await fetch(API_BASE + path, { ...opts, headers })
  if(!res.ok){ const d = await res.json().catch(()=>({})); throw new Error(d.error ?? res.statusText) }
  return res
}
const json = async (p:string, o?:RequestInit) => (await raw(p,o)).json()
export const api = {
  get:(p:string)=>json(p), post:(p:string,b?:any)=>json(p,{ method:'POST', body:b instanceof FormData?b:JSON.stringify(b ?? {}) }),
  put:(p:string,b:any)=>json(p,{ method:'PUT', body:JSON.stringify(b) }), del:(p:string)=>json(p,{ method:'DELETE' }),
  download: async (p:string, name:string) => { const b = await (await raw(p)).blob(); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click() },
}
