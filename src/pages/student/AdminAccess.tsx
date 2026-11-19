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
  return <><PageHeader title="Admin access" sub="Request permission to manage CodeGrade." />
    <Card className="space-y-4"><p className="text-sm text-zinc-700">{text}</p>
      {error && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">{error}</p>}
      {status === 'none' && <Button onClick={request} disabled={busy}>{busy ? 'Sending request…' : 'Request admin access'}</Button>}
    </Card>
  </>
}
