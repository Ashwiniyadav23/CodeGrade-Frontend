import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Button, Card, PageHeader } from '../../components/ui'

type Request = { id:string; full_name:string; email:string; batch?:string; admin_access_status:string }

export default function AccessRequests() {
  const [rows, setRows] = useState<Request[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const load = async () => { try { setRows(await api.get('/admin-access/requests')); setError('') } catch (e:any) { setError(e.message) } }
  useEffect(() => { load() }, [])
  const decide = async (id:string, decision:'approve'|'decline') => {
    setBusy(id)
    try { await api.put(`/admin-access/requests/${id}`, { decision }); await load() }
    catch (e:any) { setError(e.message) }
    setBusy(null)
  }
  return <><PageHeader title="Admin access requests" sub="Approve users who need admin tools, or decline their requests." />
    {error && <p className="mb-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{error}</p>}
    <div className="space-y-3">{rows.map(user=><Card key={user.id} className="flex flex-wrap items-center justify-between gap-4">
      <div><div className="font-semibold">{user.full_name}</div><div className="text-sm text-zinc-600">{user.email}{user.batch ? ` · ${user.batch}` : ''}</div></div>
      <div className="flex gap-2"><Button onClick={()=>decide(user.id,'approve')} disabled={!!busy}>Approve</Button><Button variant="danger" onClick={()=>decide(user.id,'decline')} disabled={!!busy}>Decline</Button></div>
    </Card>)}
    {!rows.length && !error && <Card className="py-10 text-center text-sm text-zinc-500">No pending admin access requests.</Card>}</div>
  </>
}
