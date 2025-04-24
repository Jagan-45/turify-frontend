"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import {
  Calendar,
  Code2,
  Edit,
  FileText,
  GraduationCap,
  LogOut,
  MoreHorizontal,
  Plus,
  Settings,
  Trash,
  Users,
  ChevronDown,
  ChevronUp,
  Clock,
  CalendarIcon,
  RefreshCw,
} from "lucide-react"

import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { ModeToggle } from "./mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { CreateBatch } from "./create-batch"
import { CreateContest } from "./create-contest"
import { CreateTask } from "./create-task"
import useValidToken from "./hooks/useValidToken"
import { Loader } from "./ui/loader"

// Mock data
const mockProfile = {
  name: "Dr. Aldo stalin JL",
  username: "Aldo stalin",
  department: "Information Technology",
  email: "alsostalin@sonatech.ac.in",
  batches: 4,
  contests: 12,
  tasks: 45,
}

function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("batches")
  const [openCreateBatch, setOpenCreateBatch] = useState(false)
  const [openCreateContest, setOpenCreateContest] = useState(false)
  const [openUpdateContest, setOpenUpdateContest] = useState(false) // New state for updating contests
  const [openCreateTask, setOpenCreateTask] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [openStudentDialog, setOpenStudentDialog] = useState(false)
  const [batchCreated, setBatchCreated] = useState(false)
  const [batchName, setBatchName] = useState("")
  const [method, setMethod] = useState("POST")
  const [batches, setBatches] = useState([])
  const [batchDetails, setBatchDetails] = useState([])
  const [tasks, setTasks] = useState([])
  const [contests, setContests] = useState([]) // State for contests
  const [updateBatches, setUpdateBatches] = useState([])
  const [taskId, setTaskId] = useState("")
  const [loading, setLoading] = useState({
    batches: true,
    tasks: true,
    contests: true, // Set to true for loading contests
  })

  // View more state
  const [viewMore, setViewMore] = useState({
    batches: false,
    tasks: false,
    contests: false,
  })

  // Items to display initially
  const itemsToShow = 5

  const navigate = useNavigate()
  const isValidToken = useValidToken()

  const userRole = localStorage.getItem("userRole")
  const isLoggedIn = userRole === "ROLE_STAFF" && isValidToken

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login")
      return
    }

    const fetchBatches = async () => {
      setLoading((prev) => ({ ...prev, batches: true }))
      const token = localStorage.getItem("accessToken")
      const temp = []
      try {
        const response = await fetch("http://localhost:8081/api/v0/batches", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          toast.error("Failed to fetch batches.")
          setLoading((prev) => ({ ...prev, batches: false }))
          return
        }

        const data = await response.json()
        const processedBatches = data.data.map((batch) => {
          temp.push(batch["batch name"])
          return {
            name: batch["batch name"],
            students: batch.students.length,
            studentList: batch.students,
          }
        })
        setBatchDetails(processedBatches)
        setBatches(temp)
        setLoading((prev) => ({ ...prev, batches: false }))
      } catch (error) {
        console.error("Error fetching batches:", error)
        toast.error("Failed to load batches.")
        setLoading((prev) => ({ ...prev, batches: false }))
      }
    }

    const fetchTasks = async () => {
      setLoading((prev) => ({ ...prev, tasks: true }))
      const token = localStorage.getItem("accessToken")
      try {
        const response = await fetch("http://localhost:8081/api/v0/tasks", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          toast.error("Failed to fetch tasks.")
          setLoading((prev) => ({ ...prev, tasks: false }))
          return
        }

        const data = await response.json()
        const processedTasks = data.data.map((task, index) => ({
          id: task.taskCreatedID,
          fromDate: new Date(task.fromDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          toDate: new Date(task.toDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          scheduleTime: task.scheduleTime,
          repeat: task.repeat,
          batches: task.batches.map((batch) => batch.batchName).join(", "),
          taskName: `Task ${index + 1}`, 
        }))
        setTasks(processedTasks)
        setLoading((prev) => ({ ...prev, tasks: false }))
      } catch (error) {
        console.error("Error fetching tasks:", error)
        toast.error("Failed to load tasks.")
        setLoading((prev) => ({ ...prev, tasks: false }))
      }
    }

    const fetchContests = async () => {
      setLoading((prev) => ({ ...prev, contests: true }))
      const token = localStorage.getItem("accessToken")
      try {
        const response = await fetch("http://localhost:8081/api/v0/contest/created-contests", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          toast.error("Failed to fetch contests.")
          setLoading((prev) => ({ ...prev, contests: false }))
          return
        }

        const data = await response.json()
        setContests(data.data)
        setLoading((prev) => ({ ...prev, contests: false }))
      } catch (error) {
        console.error("Error fetching contests:", error)
        toast.error("Failed to load contests.")
        setLoading((prev) => ({ ...prev, contests: false }))
      }
    }

    fetchBatches()
    fetchTasks()
    fetchContests()
  }, [batchCreated, isLoggedIn, navigate, updateBatches]) // Added updateBatches as a dependency

  const handleCreateContest = (contestData) => {
    console.log("Creating contest:", contestData)
    toast({
      title: "Contest created",
      description: `${contestData.title} has been scheduled successfully.`,
    })
  }

  const handleUpdateContest = (contest) => {
    setOpenUpdateContest(true)
    setMethod("PUT")
    // Set any other necessary state for updating the contest
  }

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken")
    localStorage.removeItem("accessToken")
    localStorage.removeItem("userRole")

    const response = await fetch("http://localhost:8081/logout", {
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

  const handleViewStudents = (students) => {
    setSelectedStudents(students)
    setOpenStudentDialog(true)
  }

  const handleEditBatch = (batchName) => {
    setOpenCreateBatch(true)
    setBatchName(batchName)
    setMethod("PUT")
  }

  const handleDeleteBatch = async (batchId) => {
    const token = localStorage.getItem("accessToken")
    try {
      const response = await fetch(`http://localhost:8081/api/v0/batches/${batchId}`, {
 method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        toast.error("Failed to delete batch.")
        return
      }

      setBatches((prevBatches) => prevBatches.filter((batch) => batch.name !== batchId))
      setBatchCreated((prev) => !prev)
      toast.success("Batch deleted successfully.")
    } catch (error) {
      console.error("Error deleting batch:", error)
      toast.error("Failed to delete batch.")
    }
  }

  const toggleViewMore = (section) => {
    setViewMore((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleEditTask = (taskId, batches) => {
    setTaskId(taskId)
    setMethod("PUT")
    setUpdateBatches(batches)
    setOpenCreateTask(true)
  }

  const handleDeleteTask = async (taskId) => {
    console.log("Deleting task with ID:", taskId)
    const token = localStorage.getItem("accessToken")
    try {
      const response = await fetch(`http://localhost:8081/api/v0/tasks/${taskId}`, {
        method: "DELETE",
        headers: {  
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        toast.error("Failed to delete task.")
        return
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
      toast.success("Task deleted successfully.")
    } catch (error) {
      console.error("Error deleting task:", error)
      toast.error("Failed to delete task.")
    }
  }

  const renderStatusBadge = (status) => {
    switch (status) {
      case "Live":
        return <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>
      case "Scheduled":
        return <Badge>Scheduled</Badge>
      case "Completed":
        return <Badge variant="outline">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Code2 className="h-6 w-6" />
            <span>Turify</span>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Avatar>
              <AvatarImage src="/placeholder.svg" alt={mockProfile.name} />
              <AvatarFallback>RK</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="h-fit">
            <CardHeader className="pb-2">
              <CardTitle>Teacher Profile</CardTitle>
              <CardDescription>Manage your classes and assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg" alt={mockProfile.name} />
                  <AvatarFallback className="text-xl">RK</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-medium text-lg">{mockProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">@{mockProfile.username}</p>
                </div>
                <Badge variant="outline" className="bg-primary/10">
                  Teacher
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium">{mockProfile.department}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{mockProfile.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Batches</span>
                  <span className="font-medium">{mockProfile.batches}</span>
                </div>
                < div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contests Created</span>
                  <span className="font-medium">{mockProfile.contests}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tasks Assigned</span>
                  <span className="font-medium">{mockProfile.tasks}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => handleLogout()}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </CardFooter>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="w-full gap-2" onClick={() => {setMethod('POST'); setOpenCreateBatch(true)}}>
                <Users className="h-4 w-4" />
                Create Batch
              </Button>
              <Button className="w-full gap-2" onClick={() => {setMethod('POST'); setOpenCreateContest(true)}}>
                <Calendar className="h-4 w-4" />
                Create Contest
              </Button>
              <Button className="w-full gap-2" onClick={() => {setMethod('POST'); setOpenCreateTask(true)}}>
                <FileText className="h-4 w-4" />
                Assign Task
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="batches">Batches</TabsTrigger>
                <TabsTrigger value="contests">Contests</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>

              <TabsContent value="batches" className="space-y-4">
                {loading.batches ? (
                  <div className="flex justify-center py-8">
                    <Loader text="Loading batches..." />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence>
                      {batchDetails
                        .slice(0, viewMore.batches ? batchDetails.length : itemsToShow)
                        .map((batch, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                          >
                            <Card className="h-full transition-all hover:shadow-md">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle>{batch.name}</CardTitle>
                                    <CardDescription>{batch.department}</CardDescription>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditBatch(batch.name)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Batch
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleViewStudents(batch.studentList)}>
                                        <Users className="h-4 w-4 mr-2" />
                                        View Students
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => handleDeleteBatch(batch.name)}
                                      >
                                        <Trash className="h-4 w-4 mr-2" />
                                        Delete Batch
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Students</span>
                                  <span className="font-medium">{batch.students}</span>
                                </div>
                              </CardContent>
                              <CardFooter> <Button
                                  variant="outline"
                                  className="w-full gap-2"
                                  onClick={() => handleViewStudents(batch.studentList)}
                                >
                                  <Users className="h-4 w-4" />
                                  View Students
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                )}
                {batchDetails.length > itemsToShow && (
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" size="sm" onClick={() => toggleViewMore("batches")} className="gap-2">
                      {viewMore.batches ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          View More ({batchDetails.length - itemsToShow} more)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="contests" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Recent Contests</h3>
                 <Button onClick={() => { setMethod('POST'); setOpenCreateContest(true); }}>
                            <Plus className="h-4 w-4" />
                            New Contest
                            </Button>
                          </div>
                          {loading.contests ? (
                            <div className="flex justify-center py-8">
                            <Loader text="Loading contests..." />
                            </div>
                          ) : (
                            <div className="space-y-4">
                            <AnimatePresence>
                              {contests
                              .slice(0, viewMore.contests ? contests.length : itemsToShow)
                              .map((contest, index) => (
                                <motion.div
                                key={contest.contestID}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                <Card className="transition-all hover:shadow-md">
                                  <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                    <h4 className="font-medium">{contest.contestName}</h4>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                      <CalendarIcon className="h-3.5 w-3.5" />
                                      <span>{new Date(contest.startTime).toLocaleString()}</span>
                                      <span>•</span>
                                      <span
                                      className={`${
                                        contest.status === "ACTIVE"
                                        ? "text-green-500"
                                        : contest.status === "SCHEDULED"
                                        ? "text-yellow-500"
                                        : contest.status === "CLOSED"
                                        ? "text-red-500"
                                        : "text-muted-foreground"
                                      }`}
                                      >
                                      {contest.status}
                                      </span>
                                    </div>
                                    </div>
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleUpdateContest(contest)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Update Contest
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  </CardContent>
                                </Card>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                            {contests.length > itemsToShow && (
                              <div className="flex justify-center mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleViewMore("contests")}
                                className="gap-2"
                              >
                                {viewMore.contests ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  Show Less
                                </>
                                ) : (
                                <>
                                  <ChevronDown className="h-4 w-4" />
                                  View More ({contests.length - itemsToShow} more)
                                </>
                                )}
                              </Button>
                              </div>
                            )}
                            </div>
                          )}
                          </TabsContent>

                          <TabsContent value="tasks" className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">Recent Tasks</h3>
                            <Button variant="outline" size="sm" className=" gap-2" onClick={() => {setMethod('POST'); setOpenCreateTask(true)}}>
                    <Plus className="h-4 w-4" />
                    New Task
                  </Button>
                </div>
                {loading.tasks ? (
                  <div className="flex justify-center py-8">
                    <Loader text="Loading tasks..." />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {tasks.slice(0, viewMore.tasks ? tasks.length : itemsToShow).map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className="transition-all hover:shadow-md dark:bg-gray-800">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{task.taskName}</CardTitle>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleEditTask(task.id, task.batches)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Task
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTask(task.id)}>
                                      <Trash className="h-4 w-4 mr-2" />
                                      Delete Task
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <CalendarIcon className="h-4 w-4 text-primary" />
                                  <div>
                                    <span className="font-medium">From:</span> {task.fromDate}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <CalendarIcon className="h-4 w-4 text-primary" />
                                  <div>
                                    <span className="font-medium">To:</span> {task.toDate}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <div>
                                    <span className="font-medium">Time:</span> {task.scheduleTime}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <RefreshCw className="h-4 w-4 text-primary" />
                                  <div>
                                    <span className="font-medium">Repeat:</span> {task.repeat}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm mt-2">
                                <Users className="h-4 w-4 text-primary" />
                                <div>
                                  <span className="font-medium">Batches:</span> {task.batches}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {tasks.length > itemsToShow && (
                      <div className="flex justify-center mt-4">
                        <Button variant="outline" size="sm" onClick={() => toggleViewMore("tasks")} className="gap-2">
                          {viewMore.tasks ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              View More ({tasks.length - itemsToShow} more)
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col items-center justify-center p-3 border rounded-lg bg-card hover:shadow-sm transition-all">
                    <Users className="h-8 w-8 text-primary mb-2" />
                      <span className="text-2xl font-bold">{mockProfile.batches}</span>
                      <span className="text-xs text-muted-foreground">Batches</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 border rounded-lg bg-card hover:shadow-sm transition-all">
                      <Calendar className="h-8 w-8 text-primary mb-2" />
                      <span className="text-2xl font-bold">{mockProfile.contests}</span>
                      <span className="text-xs text-muted-foreground">Contests</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 border rounded-lg bg-card hover:shadow-sm transition-all">
                      <FileText className="h-8 w-8 text-primary mb-2" />
                      <span className="text-2xl font-bold">{mockProfile.tasks}</span>
                      <span className="text-xs text-muted-foreground">Tasks</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 border rounded-lg bg-card hover:shadow-sm transition-all">
                      <GraduationCap className="h-8 w-8 text-primary mb-2" />
                      <span className="text-2xl font-bold">160</span>
                      <span className="text-xs text-muted-foreground">Students</span>
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

      {openStudentDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-background rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <h2 className="text-lg font-bold mb-4">Student List</h2>
            <button
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
              onClick={() => setOpenStudentDialog(false)}
              aria-label="Close"
            >
              <span className="text-destructive">X</span>
            </button>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Email</th>
                    <th className="px-4 py-2 text-left text-sm font-medium">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedStudents.map((student, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="px-4 py-2 text-sm">{student.username}</td>
                      <td className="px-4 py-2 text-sm">{student.mailId}</td>
                      <td className="px-4 py-2 text-sm">{student.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <CreateBatch
        open={openCreateBatch}
        onOpenChange={setOpenCreateBatch}
        isCreated={setBatchCreated}
        BatchName={batchName}
        method={method}
      />
      <CreateContest 
        open={openCreateContest} 
        onOpenChange={setOpenCreateContest} 
        onSubmit={handleCreateContest}
        batches={batches}
        isCreated={setBatchCreated}
        method={method}
      />
      <CreateTask
        open={openCreateTask}
        onOpenChange={setOpenCreateTask}
        batches={batches}
        isCreated={setBatchCreated}
        method={method}
        taskId={taskId}
        UpdateBatches={updateBatches}
      />
      {/* New Update Contest Dialog */}
      <CreateContest 
        open={openUpdateContest} 
        onOpenChange={setOpenUpdateContest} 
        onSubmit={handleUpdateContest}
        batches={batches}
        isCreated={setBatchCreated}
        method="PUT" // Set method to PUT for updating
      />
    </div>
  )
}

export default TeacherDashboard