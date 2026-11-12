import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CodeWorkspace from '../../components/CodeWorkspace'
import { api, Assessment } from '../../lib/api'
import { Badge, Button, PageHeader, statusTone } from '../../components/ui'

export default function CodeWorkspacePage() {
  const { id } = useParams()
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [submission, setSubmission] = useState<any>(null)
  const load = async () => {
    const data = await api.get(`/assessments/${id}/my`)
    setAssessment(data.assessment)
    setSubmission(data.submission)
  }
  useEffect(() => { load() }, [id])
  if (!assessment) return <div className="text-sm text-slate-500">Loading workspace…</div>
  const late = !!assessment.deadline && new Date(assessment.deadline) < new Date()
  const disabled = late || (!!submission && !assessment.allow_resubmit)
  return <>
    <PageHeader
      title={`${assessment.title} · Code workspace`}
      sub={`${assessment.language} · ${assessment.difficulty} · Due ${assessment.deadline ? new Date(assessment.deadline).toLocaleString() : 'no deadline'}`}
      action={<div className="flex items-center gap-2"><Link to={`/student/${assessment.id}`}><Button variant="outline">Back to assessment</Button></Link>{submission && <Badge tone={statusTone[submission.status]}>{submission.status}</Badge>}</div>}
    />
    <CodeWorkspace assessmentId={assessment.id} questions={assessment.questions} disabled={disabled} onSubmitted={load} />
  </>
}
