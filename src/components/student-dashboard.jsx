"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
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
} from "lucide-react"

import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { ModeToggle } from "./mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { useToast } from "../components/hooks/use-toast"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useValidToken from "../components/hooks/useValidToken"

// Mock data
const mockContests = {
  scheduled: [
    {
      id: 1,
      title: "Weekly Algorithm Challenge",
      date: "2023-04-10",
      time: "14:00",
      duration: "2 hours",
      batch: "Batch 1",
      problems: 5,
    },
    {
      id: 2,
      title: "Data Structures Deep Dive",
      date: "2023-04-15",
      time: "10:00",
      duration: "3 hours",
      batch: "Batch 1",
      problems: 6,
    },
  ],
  ongoing: [
    {
      id: 3,
      title: "Dynamic Programming Contest",
      endTime: "2023-04-05T15:30:00",
      duration: "2 hours",
      batch: "Batch 1",
      problems: 4,
      completed: 1,
    },
  ],
  past: [
    {
      id: 4,
      title: "Graph Theory Challenge",
      date: "2023-03-28",
      duration: "2.5 hours",
      batch: "Batch 1",
      problems: 5,
      score: 85,
      rank: 3,
    },
    {
      id: 5,
      title: "Sorting Algorithms Contest",
      date: "2023-03-20",
      duration: "1.5 hours",
      batch: "Batch 1",
      problems: 4,
      score: 92,
      rank: 2,
    },
    {
      id: 6,
      title: "Recursion and Backtracking",
      date: "2023-03-15",
      duration: "2 hours",
      batch: "Batch 1",
      problems: 5,
      score: 78,
      rank: 5,
    },
  ],
}

const mockTasks = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Arrays", "Hash Table"],
    completed: true,
    link: "https://leetcode.com/problems/two-sum/",
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    completed: false,
    link: "https://leetcode.com/problems/valid-parentheses/",
  },
  {
    id: 3,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    tags: ["Linked List", "Recursion"],
    completed: false,
    link: "https://leetcode.com/problems/merge-two-sorted-lists/",
  },
]

const mockProfile = {
  name: "Aditya Singh",
  username: "aditya_singh",
  department: "Computer Science",
  year: 3,
  problemsSolved: 127,
  rating: 1842,
  level: "Expert",
  streak: 15,
}


function StudentDashboard() {
      const navigate = useNavigate()
      const isValidToken = useValidToken()

      if (!isValidToken) {
        console.log(isValidToken)
        navigate("/login")
      }
      
        const userRole = localStorage.getItem("userRole")
        if (userRole !== "ROLE_STUDENT" || !userRole) {
          return <h1>Access Denied</h1>
        }

        
        
   

      const [activeTab, setActiveTab] = useState("contests")
      const [contestsTab, setContestsTab] = useState("ongoing")
      const [currentDate, setCurrentDate] = useState(new Date())
      const [tasks, setTasks] = useState(mockTasks)

      // Function to format date
      const formatDate = (date) => {
        return date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
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
  

  // Toggle task completion
  const toggleTaskCompletion = (taskId) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))

    const task = tasks.find((t) => t.id === taskId)

    useToast({
      title: task.completed ? "Task marked as incomplete" : "Task completed!",
      description: `${task.title} has been ${task.completed ? "marked as incomplete" : "marked as complete"}`,
    })
  }

  const handleLogout = async () => {
    const token=localStorage.getItem("token")
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")

    const response= await fetch("http://localhost:8081/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    if (response.ok) {
      toast.success("Logout successful")
      navigate("/login")
    } else {
      toast.error("Logout failed")
    }

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
              <AvatarImage src="" alt={mockProfile.name} />
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
                  <AvatarImage src="" alt={mockProfile.name} />
                  <AvatarFallback className="text-xl">AS</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-medium text-lg">{mockProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">@{mockProfile.username}</p>
                </div>
                <Badge variant="outline" className="bg-primary/10">
                  {mockProfile.level}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium">{mockProfile.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Year</span>
                  <span className="font-medium">{mockProfile.year}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Problems Solved</span>
                  <span className="font-medium">{mockProfile.problemsSolved}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium">{mockProfile.rating}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Streak</span>
                  <span className="font-medium">{mockProfile.streak} days</span>
                </div>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress to next level</span>
                  <span className="font-medium">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button variant="outline" size="sm" className="w-full gap-2 cursor-pointer" onClick={() => handleLogout()}>
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
                    {mockContests.ongoing.length > 0 ? (
                      mockContests.ongoing.map((contest) => (
                        <motion.div
                          key={contest.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{contest.title}</CardTitle>
                                  <CardDescription>{contest.batch}</CardDescription>
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
                                <span className="font-medium">{contest.duration}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Problems</span>
                                <span className="font-medium">
                                  {contest.completed}/{contest.problems} completed
                                </span>
                              </div>
                              <div className="pt-2">
                                <Progress value={(contest.completed / contest.problems) * 100} className="h-2" />
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Link to={`/contest/${contest.id}`} className="w-full">
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
                    {mockContests.scheduled.map((contest) => (
                      <motion.div
                        key={contest.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{contest.title}</CardTitle>
                                <CardDescription>{contest.batch}</CardDescription>
                              </div>
                              <Badge variant="outline">Upcoming</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Date
                              </span>
                              <span className="font-medium">{contest.date}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Time
                              </span>
                              <span className="font-medium">{contest.time}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Duration</span>
                              <span className="font-medium">{contest.duration}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Problems</span>
                              <span className="font-medium">{contest.problems}</span>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" className="w-full">
                              Set Reminder
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </TabsContent>

                  {/* Past Contests */}
                  <TabsContent value="past" className="space-y-4">
                    {mockContests.past.map((contest) => (
                      <motion.div
                        key={contest.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{contest.title}</CardTitle>
                                <CardDescription>{contest.batch}</CardDescription>
                              </div>
                              <div className="flex items-center gap-1">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <span className="font-medium">Rank: {contest.rank}</span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Date
                              </span>
                              <span className="font-medium">{contest.date}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Duration</span>
                              <span className="font-medium">{contest.duration}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Problems</span>
                              <span className="font-medium">{contest.problems}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Score</span>
                              <span className="font-medium">{contest.score}/100</span>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Link to={`/contest/${contest.id}`} className="w-full">
                              <Button variant="outline" className="w-full">
                                View Solutions
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
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
                                {task.title}
                              </CardTitle>
                              <div className="flex gap-2 mt-1">
                                {task.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Badge
                              className={
                                task.difficulty === "Easy"
                                  ? "bg-green-500 hover:bg-green-600"
                                  : task.difficulty === "Medium"
                                    ? "bg-yellow-500 hover:bg-yellow-600"
                                    : "bg-red-500 hover:bg-red-600"
                              }
                            >
                              {task.difficulty}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <span
                              className={`text-sm font-medium ${task.completed ? "text-green-500" : "text-yellow-500"}`}
                            >
                              {task.completed ? "Completed" : "Pending"}
                            </span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <a href={task.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button variant="outline" className="w-full gap-2">
                              <ExternalLink className="h-4 w-4" />
                              Open Problem
                            </Button>
                          </a>
                          <Button
                            className="flex-1"
                            variant={task.completed ? "outline" : "default"}
                            onClick={() => toggleTaskCompletion(task.id)}
                          >
                            {task.completed ? "Mark Incomplete" : "Mark Complete"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
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
                    <span className="text-2xl font-bold">{mockProfile.rating}</span>
                    <span className="text-xs text-muted-foreground">Rating</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border rounded-lg">
                    <Code className="h-8 w-8 text-primary mb-2" />
                    <span className="text-2xl font-bold">{mockProfile.problemsSolved}</span>
                    <span className="text-xs text-muted-foreground">Problems Solved</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border rounded-lg">
                    <Trophy className="h-8 w-8 text-primary mb-2" />
                    <span className="text-2xl font-bold">12</span>
                    <span className="text-xs text-muted-foreground">Contests</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border rounded-lg">
                    <User className="h-8 w-8 text-primary mb-2" />
                    <span className="text-2xl font-bold">24</span>
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

