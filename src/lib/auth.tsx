import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api, token } from './api'
type Profile = { id:string; email:string; full_name:string; role:'admin'|'student'; batch:string|null }
const Ctx = createContext<{ profile:Profile|null; loading:boolean; login:(t:string)=>Promise<void>; signOut:()=>void }>({ profile:null, loading:true, login:async()=>{}, signOut:()=>{} })
export const useAuth = () => useContext(Ctx)
export function AuthProvider({ children }:{ children:ReactNode }) {
  const [profile,setProfile] = useState<Profile|null>(null); const [loading,setLoading] = useState(true)
  const load = async () => { if(!token.get()){ setLoading(false); return } try { setProfile(await api.get('/auth/me')) } catch { token.clear() } setLoading(false) }
  useEffect(()=>{ load() },[])
  return <Ctx.Provider value={{ profile, loading, login: async t=>{ token.set(t); await load() }, signOut:()=>{ token.clear(); setProfile(null) } }}>{children}</Ctx.Provider>
}
