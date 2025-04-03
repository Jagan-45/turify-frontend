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
import "./index.css"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="turify-theme">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/problem/:id" element={<ProblemPage />} />
        <Route path="/contest/:id" element={<ContestPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
      <ToastActionElement />
    </ThemeProvider>
  )
}

export default App
