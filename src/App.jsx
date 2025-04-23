import { Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import LandingPage from "./components/landing-page"
import LoginForm from "./components/login-form"
import SignupForm from "./components/signup-form"
import StudentDashboard from "./components/student-dashboard"
import TeacherDashboard from "./components/teacher-dashboard"
import ProblemPage from "./components/problem-page"
import ContestPage from "./components/contest-page"
import Leaderboard from "./components/leaderboard"
import { ToastActionElement } from "./components/ui/toast"
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { ToastContainer } from 'react-toastify';
import "./index.css"
import EmailVerification from "./components/EmailVerification"
import TokenVerification from "./components/TokenVerification"

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
    <ThemeProvider defaultTheme="system" storageKey="turify-theme">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/student-dashboard/:user" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard/:user" element={<TeacherDashboard />} />
        <Route path="/contest/problem/:contestId/:problemId" element={<ProblemPage />} />
        <Route path="/contest/:id" element={<ContestPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/api/v0/auth/verify-user" element={<TokenVerification />} />
      </Routes>
      <ToastContainer/>
    </ThemeProvider>
    </LocalizationProvider>
  )
}

export default App
