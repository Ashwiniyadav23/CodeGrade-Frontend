import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './lib/auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Assessments from './pages/admin/Assessments'
import Editor from './pages/admin/Editor'
import Assign from './pages/admin/Assign'
import Submissions from './pages/admin/Submissions'
import Review from './pages/admin/Review'
import Dashboard from './pages/student/Dashboard'
import AssessmentView from './pages/student/AssessmentView'
export default function App() {
  const { profile, loading } = useAuth()
  if(loading) return <div className="p-8 text-sm text-zinc-500">Loading…</div>
  if(!profile) return <Routes><Route path="*" element={<Login/>}/></Routes>
  const admin = profile.role==='admin'
  return <Routes><Route element={<Layout/>}>
    <Route path="/" element={<Navigate to={admin?'/admin':'/student'} replace/>}/>
    {admin ? <>
      <Route path="/admin" element={<Assessments/>}/><Route path="/admin/new" element={<Editor/>}/><Route path="/admin/:id/edit" element={<Editor/>}/>
      <Route path="/admin/:id/assign" element={<Assign/>}/><Route path="/admin/submissions" element={<Submissions/>}/><Route path="/admin/submissions/:id" element={<Review/>}/>
    </> : <>
      <Route path="/student" element={<Dashboard/>}/><Route path="/student/:id" element={<AssessmentView/>}/>
    </>}
    <Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes>
}
