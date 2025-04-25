"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import {
  Award,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code,
  Code2,
  ExternalLink,
  LogOut,
  Settings,
  Trophy,
  User,
  Loader2,
} from "lucide-react"

import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { ModeToggle } from "./mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { toast } from "react-toastify"
import useValidToken from "../components/hooks/useValidToken"
import { useLocation } from "react-router-dom"

// Fetch profile data

function StudentDashboard() {
  const navigate = useNavigate()
  const isValidToken = useValidToken()

  const [activeTab, setActiveTab] = useState("contests")
  const [contestsTab, setContestsTab] = useState("ongoing")
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [completingTask, setCompletingTask] = useState(null)
  const [isStudent, setIsStudent] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const location = useLocation()
  

  const [contests, setContests] = useState({
    active: [],
    scheduled: [],
    closed: [],
  })
  const [isLoadingContests, setIsLoadingContests] = useState(false)

  // Function to format date for display
  const formatDate = (date) => {
    const validDate = new Date(date)
    return validDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  // Function to format date for API request (YYYY-MM-DD)
  const formatDateForApi = (date) => {
    return date.toISOString().split("T")[0]
  }

  // Function to navigate calendar
  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  // Calculate time remaining for ongoing contest
  const calculateTimeRemaining = (endTime) => {
    const end = new Date(endTime)
    const now = new Date()
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return "Contest ended"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m remaining`
  }

  // Calculate contest duration
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diff = end.getTime() - start.getTime()

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  // Generate contest name based on day of week
  const generateContestName = (startTime) => {
    const date = new Date(startTime)
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayName = days[date.getDay()]
    return `${dayName} Contest`
  }

  // Mark task as complete
  const markTaskAsComplete = async (taskId, problemId) => {
    setCompletingTask(`${taskId}-${problemId}`)

    try {
      const response = await fetch(
        `http://localhost:8081/api/v0/tasks/track-status?taskId=${taskId}&problemId=${problemId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      )

      if (response.ok) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                problemLinks: task.problemLinks.map((problem) => {
                  if (problem.id === problemId) {
                    return { ...problem, solved: true }
                  }
                  return problem
                }),
              }
            }
            return task
          }),
        )

        toast.success("Task marked as complete")
      } else if (response.status === 400) {
        toast.error("cannot mark as complete, solve the problem first")
      } else {
        toast.error("something went wrong")
      }
    } catch (error) {
      console.error("Error marking task as complete:", error)
      toast.error("Failed to update task status.")
    } finally {
      setCompletingTask(null)
    }
  }

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken")
    localStorage.removeItem("accessToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userProfile")
    if(localStorage.getItem("problems")){
      localStorage.removeItem("problems")
    }

    try {
      const response = await fetch("http://localhost:8081/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("Logged out successfully")
        navigate("/login")
      } else {
        toast.error("Logout failed")
      }
    } catch (error) {
      console.error("Error during logout:", error)
      toast.error("Logout failed")
    }
  }

  // Fetch contests
  const fetchContests = async () => {
    setIsLoadingContests(true)
    try {
      const response = await fetch("http://localhost:8081/api/v0/contest/assigned-contests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (response.ok) {
        const result = await response.json()

        // Segregate contests by status
        const active = []
        const scheduled = []
        const closed = []

        result.data.forEach((contest) => {
          switch (contest.status) {
            case "ACTIVE":
              active.push(contest)
              break
            case "SCHEDULED":
              scheduled.push(contest)
              break
            case "CLOSED":
              closed.push(contest)
              break
            default:
              break
          }
        })

        active.forEach((contest) => {
         
          localStorage.setItem(contest.contestID, false);
          
        });

        setContests({
          active,
          scheduled,
          closed,
        })
      } else {
        console.error("Failed to fetch contests")
        toast.error("Failed to fetch contests")
      }
    } catch (error) {
      console.error("Error fetching contests:", error)
      toast.error("Error fetching contests")
    } finally {
      setIsLoadingContests(false)
    }
  }



  // Check authentication and fetch tasks
  useEffect(() => {
    if (!isValidToken) {
      if(localStorage.getItem("userProfile")){
        localStorage.removeItem("userProfile")
      }
      navigate("/login")
      return
    }

    const userRole = localStorage.getItem("userRole")
    if (userRole === "ROLE_STUDENT") {
      setIsStudent(true)
    } else {
      setIsStudent(false)
      setAccessDenied(true)
    }
  }, [isValidToken, navigate])

  // Fetch contests when component mounts
  useEffect(() => {
    if (isStudent) {
      fetchContests()
    }
  }, [isStudent])

  useEffect(() => {
    if (isStudent) {
      fetchContests()
    }
  }, [isStudent, location])

  // Fetch tasks for the current date
  useEffect(() => {
    if (!isStudent) return

    const fetchTasks = async () => {
      setIsLoading(true)
      try {
        
        const response = await fetch(
          `http://localhost:8081/api/v0/tasks/assigned-task/${formatDateForApi(currentDate)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          },
        )

        if (response.status === 500) {
          // No tasks assigned for this day
          setTasks([])
          return
        }

        if (response.ok) {
          const result = await response.json()
          setTasks(result.data || [])
        } else {
          console.error("Failed to fetch tasks")
          setTasks([])
        }
      } catch (error) {
        console.error("Error fetching tasks:", error)
        setTasks([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [currentDate, isStudent, location])

  if (accessDenied) {
    return <h1>Access Denied</h1>
  }

 

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Code2 className="h-6 w-6" />
            <span>Turify</span>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt={JSON.parse(localStorage.getItem("userProfile")).username} />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your coding journey stats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg" alt={JSON.parse(localStorage.getItem("userProfile")).username} />
                  <AvatarFallback className="text-xl">AS</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-medium text-lg">{JSON.parse(localStorage.getItem("userProfile")).username}</h3>
                  <p className="text-sm text-muted-foreground">@{JSON.parse(localStorage.getItem("userProfile")).username}</p>
                </div>
                <Badge variant="outline" className="bg-primary/10">
                  {JSON.parse(localStorage.getItem("userProfile")).rating}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium">{JSON.parse(localStorage.getItem("userProfile")).dept}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Year</span>
                  <span className="font-medium">{JSON.parse(localStorage.getItem("userProfile")).year}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Problems Solved</span>
                  <span className="font-medium">{JSON.parse(localStorage.getItem("userProfile")).problemSolved}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Streak</span>
                  <span className="font-medium">{JSON.parse(localStorage.getItem("userProfile")).taskStreak} days</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button variant="outline" size="sm" className="w-full gap-2 cursor-pointer" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </CardFooter>
          </Card>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="contests">Contests</TabsTrigger>
                <TabsTrigger value="tasks">Daily Tasks</TabsTrigger>
              </TabsList>

              {/* Contests Tab */}
              <TabsContent value="contests" className="space-y-4">
                <Tabs value={contestsTab} onValueChange={setContestsTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                    <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                  </TabsList>

                  {/* Ongoing Contests */}
                  <TabsContent value="ongoing" className="space-y-4">
                    {isLoadingContests ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" />
                        <h3 className="font-medium text-lg">Loading contests...</h3>
                      </div>
                    ) : contests.active.length > 0 ? (
                      contests.active.map((contest) => (
                        <motion.div
                          key={contest.contestID}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{generateContestName(contest.startTime)}</CardTitle>
                                  <CardDescription>{contest.contestName}</CardDescription>
                                </div>
                                <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Time Remaining
                                </span>
                                <span className="font-medium">{calculateTimeRemaining(contest.endTime)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Duration</span>
                                <span className="font-medium">
                                  {calculateDuration(contest.startTime, contest.endTime)}
                                </span>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Link to={`/contest/${contest.contestID}`} className="w-full">
                                <Button className="w-full">Continue Contest</Button>
                              </Link>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Code className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-medium text-lg">No Ongoing Contests</h3>
                        <p className="text-muted-foreground">Check scheduled contests for upcoming challenges.</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Scheduled Contests */}
                  <TabsContent value="scheduled" className="space-y-4">
                    {isLoadingContests ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" />
                        <h3 className="font-medium text-lg">Loading contests...</h3>
                      </div>
                    ) : contests.scheduled.length > 0 ? (
                      contests.scheduled.map((contest) => (
                        <motion.div
                          key={contest.contestID}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{generateContestName(contest.startTime)}</CardTitle>
                                  <CardDescription>{contest.contestName}</CardDescription>
                                </div>
                                <Badge variant="outline">Upcoming</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Start Date
                                </span>
                                <span className="font-medium">{new Date(contest.startTime).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Start Time
                                </span>
                                <span className="font-medium">
                                  {new Date(contest.startTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Duration</span>
                                <span className="font-medium">
                                  {calculateDuration(contest.startTime, contest.endTime)}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Code className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-medium text-lg">No Scheduled Contests</h3>
                        <p className="text-muted-foreground">Check back later for upcoming contests.</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Past Contests */}
                  <TabsContent value="past" className="space-y-4">
                    {isLoadingContests ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" />
                        <h3 className="font-medium text-lg">Loading contests...</h3>
                      </div>
                    ) : contests.closed.length > 0 ? (
                      contests.closed.map((contest) => (
                        <motion.div
                          key={contest.contestID}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{generateContestName(contest.startTime)}</CardTitle>
                                  <CardDescription>{contest.contestName}</CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-gray-200 dark:bg-gray-700">
                                  Closed
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Date
                                </span>
                                <span className="font-medium">{new Date(contest.startTime).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Duration</span>
                                <span className="font-medium">
                                  {calculateDuration(contest.startTime, contest.endTime)}
                                </span>
                              </div>
                            </CardContent>
                            
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Code className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-medium text-lg">No Past Contests</h3>
                        <p className="text-muted-foreground">You haven't participated in any contests yet.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Daily Tasks Tab */}
              <TabsContent value="tasks" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="icon" onClick={() => navigateCalendar("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-medium">{formatDate(currentDate)}</h3>
                  <Button variant="outline" size="icon" onClick={() => navigateCalendar("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" />
                    <h3 className="font-medium text-lg">Loading tasks...</h3>
                  </div>
                ) : tasks.length > 0 ? (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className={task.completed ? "border-green-500" : ""}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  {task.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                                  Task {task.id.substring(0, 8)}
                                </CardTitle>
                              </div>
                              <Badge
                                variant={task.completed ? "outline" : "secondary"}
                                className={task.completed ? "border-green-500 text-green-500" : ""}
                              >
                                {task.completed ? "Completed" : "Pending"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {task.problemLinks.map((problem) => (
                              <div
                                key={problem.id}
                                className={`p-4 rounded-lg border ${problem.solved ? "border-green-500" : ""}`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium flex items-center gap-2">
                                    {problem.solved && <CheckCircle className="h-4 w-4 text-green-500" />}
                                    {problem.link.split("/").pop().replace(/-/g, " ")}
                                  </h4>
                                  <Badge
                                    className={
                                      problem.difficulty === "Easy"
                                        ? "bg-green-500 hover:bg-green-600"
                                        : problem.difficulty === "Medium"
                                          ? "bg-yellow-500 hover:bg-yellow-600"
                                          : "bg-red-500 hover:bg-red-600"
                                    }
                                  >
                                    {problem.difficulty}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">Status:</span>
                                    <span
                                      className={
                                        problem.solved ? "text-green-500 font-medium" : "text-yellow-500 font-medium"
                                      }
                                    >
                                      {problem.solved ? "Solved" : "Pending"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">Accuracy:</span>
                                    <span className="font-medium">{problem.acRate.toFixed(2)}%</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">Attempted:</span>
                                    <span className="font-medium">{problem.attempted ? "Yes" : "No"}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <a href={problem.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                                    <Button variant="outline" className="w-full gap-2">
                                      <ExternalLink className="h-4 w-4" />
                                      Open Problem
                                    </Button>
                                  </a>
                                  <Button
                                    className="flex-1"
                                    variant={problem.solved ? "outline" : "default"}
                                    disabled={problem.solved || completingTask === `${task.id}-${problem.id}`}
                                    onClick={() => markTaskAsComplete(task.id, problem.id)}
                                  >
                                    {completingTask === `${task.id}-${problem.id}` ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                      </>
                                    ) : problem.solved ? (
                                      "Completed"
                                    ) : (
                                      "Mark as Complete"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Code className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg">No Tasks Assigned</h3>
                    <p className="text-muted-foreground">There are no tasks assigned for this date.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center justify-center p-3 border rounded-lg">
                    <Award className="h-8 w-8 text-primary mb-2" />
                    <span className="text-2xl font-bold">{JSON.parse(localStorage.getItem("userProfile")).rating}</span>
                    <span className="text-xs text-muted-foreground">Rating</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border rounded-lg">
                    <Code className="h-8 w-8 text-primary mb-2" />
                    <span className="text-2xl font-bold">{JSON.parse(localStorage.getItem("userProfile")).problemSolved}</span>
                    <span className="text-xs text-muted-foreground">Problems Solved</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border rounded-lg">
                    <Trophy className="h-8 w-8 text-primary mb-2" />
                    <span className="text-2xl font-bold">{contests.closed.length}</span>
                    <span className="text-xs text-muted-foreground">Contests</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border rounded-lg">
                    <User className="h-8 w-8 text-primary mb-2" />
                    <span className="text-2xl font-bold">{JSON.parse(localStorage.getItem("userProfile")).globalRank}</span>
                    <span className="text-xs text-muted-foreground">Global Rank</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link to="/leaderboard" className="w-full">
                  <Button variant="outline" className="w-full">
                    View Leaderboard
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default StudentDashboard
