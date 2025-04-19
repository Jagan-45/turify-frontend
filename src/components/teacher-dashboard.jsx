"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
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
} from "lucide-react"

import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { ModeToggle } from "./mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { useToast } from "../components/hooks/use-toast"
import { CreateBatch } from "./create-batch"
import { CreateContest } from "./create-contest"
import { CreateTask } from "./create-task"
import  useValidToken  from "../components/hooks/useValidToken"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

// Mock data
const mockProfile = {
  name: "Dr. Rajesh Kumar",
  username: "rajesh_kumar",
  department: "Computer Science",
  email: "rajesh.kumar@example.edu",
  batches: 4,
  contests: 12,
  tasks: 45,
}

const mockBatches = [
  {
    id: 1,
    name: "CSE 2023",
    year: 3,
    students: 42,
    department: "Computer Science",
  },
  {
    id: 2,
    name: "CSE 2024",
    year: 2,
    students: 38,
    department: "Computer Science",
  },
  {
    id: 3,
    name: "ECE 2023",
    year: 3,
    students: 35,
    department: "Electrical Engineering",
  },
  {
    id: 4,
    name: "CSE 2025",
    year: 1,
    students: 45,
    department: "Computer Science",
  },
]

function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState("batches")
  const [openCreateBatch, setOpenCreateBatch] = useState(false)
  const [openCreateContest, setOpenCreateContest] = useState(false)
  const [openCreateTask, setOpenCreateTask] = useState(false)
  const [batches, setBatches] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [openStudentDialog, setOpenStudentDialog] = useState(false);
  const [batchCreated, setBatchCreated] = useState(false)
  const [batchName, setBatchName] = useState("")
  const [method,setMethod]=useState("POST")

  const navigate = useNavigate()
  const isValidToken = useValidToken()


  const userRole = localStorage.getItem("userRole")
  if (!userRole || userRole !== "ROLE_STAFF" || !isValidToken) {
      navigate("/login")
    }


  if (!localStorage.getItem("userRole") || localStorage.getItem("userRole") !== "ROLE_STAFF") {
  return <h1>Access Denied</h1>
  }


  useEffect(() => {
    const fetchBatches = async () => {
      const token = localStorage.getItem("accessToken");
      console.log(token)
      try {
        const response = await fetch("http://localhost:8081/api/v0/batches", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          toast.error("Failed to fetch batches.");
          return;
        }

        const data = await response.json();
        console.log(data)
        const processedBatches = data.data.map((batch) => ({
          name: batch["batch name"],
          students: batch.students.length, 
          studentList: batch.students, 
        }));

        setBatches(processedBatches);
      } catch (error) {
        console.error("Error fetching batches:", error);
        toast.error("Failed to load batches.");
      }
    };

    fetchBatches();
  }, [batchCreated]);


  const handleCreateContest = (contestData) => {
    // Mock API call
    console.log("Creating contest:", contestData)
    useToast({
      title: "Contest created",
      description: `${contestData.title} has been scheduled successfully.`,
    })
  }

  const handleCreateTask = (taskData) => {
    // Mock API call
    console.log("Creating task:", taskData)
    useToast({
      title: "Task assigned",
      description: `Task has been assigned to ${taskData.batch} successfully.`,
    })
  }
  
  const handleLogout = async () => {
    const token=localStorage.getItem("accessToken")
    console.log(token)
    localStorage.removeItem("accessToken")
    localStorage.removeItem("userRole")

    const response= await fetch("http://localhost:8081/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    console.log(response)
    if (response.ok) {
      toast.success("Logout successful")
      navigate("/login")
    } else {
      toast.error("Logout failed")
    }

  }

  const handleViewStudents = (students) => {
    setSelectedStudents(students);
    setOpenStudentDialog(true);
  };

  const handleEditBatch = (batchName) => { 
    setOpenCreateBatch(true)
    setBatchName(batchName)
    setMethod("PUT")
  }

  const handleDeleteBatch = async (batchId) => {
    const token = localStorage.getItem("accessToken");
    try {
      const response = await fetch(`http://localhost:8081/api/v0/batches/${batchId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast.error("Failed to delete batch.");
        return;
      }

      setBatches((prevBatches) => prevBatches.filter((batch) => batch.name !== batchId));
      setBatchCreated((prev) => !prev);
      toast.success("Batch deleted successfully.");
    } catch (error) {
      console.error("Error deleting batch:", error);
      toast.error("Failed to delete batch.");
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
              <AvatarFallback>RK</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Teacher Profile</CardTitle>
              <CardDescription>Manage your classes and assignments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-2">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" alt={mockProfile.name} />
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
                <div className="flex justify-between text-sm">
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

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="w-full gap-2" onClick={() => setOpenCreateBatch(true)}>
                <Users className="h-4 w-4" />
                Create Batch
              </Button>
              <Button className="w-full gap-2" onClick={() => setOpenCreateContest(true)}>
                <Calendar className="h-4 w-4" />
                Create Contest
              </Button>
              <Button className="w-full gap-2" onClick={() => setOpenCreateTask(true)}>
                <FileText className="h-4 w-4" />
                Assign Task
              </Button>
            </div>

            {/* Tabs for Batches, Contests, Tasks */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="batches">Batches</TabsTrigger>
                <TabsTrigger value="contests">Contests</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>

                {/* Batches Tab */}
                <TabsContent value="batches" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {batches.map((batch, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card>
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
                                <DropdownMenuItem onClick={()=>handleEditBatch(batch.name)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Batch
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewStudents(batch.studentList)}>
                                  <Users className="h-4 w-4 mr-2" />
                                  View Students
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={()=>handleDeleteBatch(batch.name)}>
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
                        <CardFooter>
                          <Button variant="outline" className="w-full gap-2" onClick={() => handleViewStudents(batch.studentList)}>
                            <Users className="h-4 w-4" />
                            View Students
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Contests Tab */}
              <TabsContent value="contests" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Recent Contests</h3>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpenCreateContest(true)}>
                    <Plus className="h-4 w-4" />
                    New Contest
                  </Button>
                </div>
                <div className="border rounded-md divide-y">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Weekly Algorithm Challenge</h4>
                      <p className="text-sm text-muted-foreground">April 10, 2023 • CSE 2023</p>
                    </div>
                    <Badge>Scheduled</Badge>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Dynamic Programming Contest</h4>
                      <p className="text-sm text-muted-foreground">April 5, 2023 • CSE 2023</p>
                    </div>
                    <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Graph Theory Challenge</h4>
                      <p className="text-sm text-muted-foreground">March 28, 2023 • CSE 2023</p>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Sorting Algorithms Contest</h4>
                      <p className="text-sm text-muted-foreground">March 20, 2023 • CSE 2024</p>
                    </div>
                    <Badge variant="outline">Completed</Badge>
                  </div>
                </div>
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Recent Tasks</h3>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => setOpenCreateTask(true)}>
                    <Plus className="h-4 w-4" />
                    New Task
                  </Button>
                </div>
                <div className="border rounded-md divide-y">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Array Manipulation Problems</h4>
                      <p className="text-sm text-muted-foreground">April 5, 2023 • CSE 2023</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">3 Problems</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            View Submissions
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">String Manipulation Problems</h4>
                      <p className="text-sm text-muted-foreground">April 4, 2023 • CSE 2024</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">2 Problems</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            View Submissions
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Linked List Problems</h4>
                      <p className="text-sm text-muted-foreground">April 3, 2023 • CSE 2023</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">2 Problems</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            View Submissions
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
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
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <span className="text-2xl font-bold">{mockProfile.batches}</span>
                    <span className="text-xs text-muted-foreground">Batches</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border rounded-lg">
                    <Calendar className="h-8 w-8 text-primary mb-2" />
                    <span className="text-2xl font-bold">{mockProfile.contests}</span>
                    <span className="text-xs text-muted-foreground">Contests</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border rounded-lg">
                    <FileText className="h-8 w-8 text-primary mb-2" />
                    <span className="text-2xl font-bold">{mockProfile.tasks}</span>
                    <span className="text-xs text-muted-foreground">Tasks</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 border rounded-lg">
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

   {/* Dialog for viewing students */}
      {openStudentDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-lg w-full relative"> 
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Student List</h2>
            <button 
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-red-500" 
              onClick={() => setOpenStudentDialog(false)}
              aria-label="Close"
            >
              <span className="text-red-500">X</span>
            </button>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Email</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Rating</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {selectedStudents.map((student, index) => (
                    <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                      <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{student.username}</td>
                      <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{student.mailId}</td>
                      <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{student.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreateBatch open={openCreateBatch} onOpenChange={setOpenCreateBatch} isCreated={setBatchCreated} BatchName={batchName} method={method}/>
      <CreateContest open={openCreateContest} onOpenChange={setOpenCreateContest} onSubmit={handleCreateContest} />
      <CreateTask open={openCreateTask} onOpenChange={setOpenCreateTask} onSubmit={handleCreateTask} />
    </div>
  )
}

export default TeacherDashboard

