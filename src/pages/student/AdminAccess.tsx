import { useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { Button, Card, PageHeader } from '../../components/ui'

export default function AdminAccess() {
  const { profile } = useAuth()
  const [status, setStatus] = useState(profile?.admin_access_status || 'none')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const request = async () => {
    setBusy(true); setError('')
    try { const result = await api.post('/admin-access/request'); setStatus(result.admin_access_status) }
    catch (e:any) { setError(e.message) }
    setBusy(false)
  }
  const text = status === 'pending'
    ? 'Your request is pending review by an admin.'
    : status === 'declined'
    ? 'Your request was declined. Admin access is unavailable for this account.'
    : status === 'approved'
    ? 'Your request was approved. Sign out and sign back in to open the admin workspace.'
    : 'Request admin access to manage assessments and review submissions. An existing admin must approve your request.'
  return <><PageHeader title="Admin access" sub="Student accounts are all you need to take part in assessments. Request elevated tools only if your role requires them." />
    <Card className="max-w-2xl overflow-hidden p-0">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/70 px-6 py-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg text-blue-700 shadow-sm">↗</div><div><h2 className="font-semibold text-slate-900">Instructor workspace</h2><p className="mt-0.5 text-xs text-slate-500">Assessment management and submission review</p></div></div></div>
      <div className="space-y-4 p-6"><p className="text-sm leading-6 text-slate-600">{text}</p>
        {status !== 'none' && <div className={`rounded-xl border px-3.5 py-3 text-sm ${status === 'approved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : status === 'declined' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{status === 'pending' ? 'Request under review' : status === 'approved' ? 'Access approved' : 'Request declined'}</div>}
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
        {status === 'none' && <Button onClick={request} disabled={busy}>{busy ? 'Sending request…' : 'Request admin access'}</Button>}
      </div>
    </Card>
  </>
}
