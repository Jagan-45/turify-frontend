"use client"

import { useState, useEffect } from "react"
import { useParams, Link, Navigate, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, Clock, Code2, Trophy } from "lucide-react"

import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"
import { Separator } from "./ui/separator"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { useToast } from "../components/hooks/use-toast"
import useValidToken from "../components/hooks/useValidToken"

// Mock contest data
const mockContests = {
  1: {
    id: "1",
    title: "Weekly Algorithm Challenge",
    description: "Test your skills with these algorithm problems.",
    startTime: "2023-04-10T14:00:00",
    endTime: "2023-04-10T16:00:00",
    duration: "2 hours",
    batch: "CSE 2023",
    problems: [
      {
        id: "1",
        title: "Two Sum",
        difficulty: "Easy",
        completed: true,
      },
      {
        id: "2",
        title: "Valid Parentheses",
        difficulty: "Easy",
        completed: false,
      },
      {
        id: "3",
        title: "Merge Two Sorted Lists",
        difficulty: "Easy",
        completed: false,
      },
    ],
    participants: [
      {
        id: "user-1",
        username: "aditya_singh",
        score: 200,
        problemsSolved: 2,
        timeTaken: "1h 30m",
        department: "Computer Science",
      },
      {
        id: "user-2",
        username: "priya_mehta",
        score: 180,
        problemsSolved: 2,
        timeTaken: "1h 45m",
        department: "Electrical Engineering",
      },
      {
        id: "user-3",
        username: "rahul_kumar",
        score: 150,
        problemsSolved: 1,
        timeTaken: "1h 20m",
        department: "Computer Science",
      },
      {
        id: "user-4",
        username: "neha_sharma",
        score: 120,
        problemsSolved: 1,
        timeTaken: "1h 50m",
        department: "Mechanical Engineering",
      },
    ],
  },
  3: {
    id: "3",
    title: "Dynamic Programming Contest",
    description: "Test your skills with these dynamic programming problems.",
    startTime: "2023-04-05T13:00:00",
    endTime: "2023-04-05T15:00:00",
    duration: "2 hours",
    batch: "CSE 2023",
    problems: [
      {
        id: "1",
        title: "Fibonacci Number",
        difficulty: "Easy",
        completed: true,
      },
      {
        id: "2",
        title: "Climbing Stairs",
        difficulty: "Easy",
        completed: true,
      },
      {
        id: "3",
        title: "Longest Increasing Subsequence",
        difficulty: "Medium",
        completed: false,
      },
      {
        id: "4",
        title: "Coin Change",
        difficulty: "Medium",
        completed: false,
      },
    ],
    participants: [
      {
        id: "user-1",
        username: "aditya_singh",
        score: 250,
        problemsSolved: 3,
        timeTaken: "1h 45m",
        department: "Computer Science",
      },
      {
        id: "user-5",
        username: "vikram_patel",
        score: 220,
        problemsSolved: 2,
        timeTaken: "1h 30m",
        department: "Computer Science",
      },
      {
        id: "user-6",
        username: "ananya_gupta",
        score: 180,
        problemsSolved: 2,
        timeTaken: "1h 50m",
        department: "Electrical Engineering",
      },
      {
        id: "user-7",
        username: "raj_malhotra",
        score: 150,
        problemsSolved: 1,
        timeTaken: "1h 40m",
        department: "Mechanical Engineering",
      },
    ],
  },
}

function ContestPage() {
  const { id } = useParams()
  const [contest, setContest] = useState(null)
  const [activeTab, setActiveTab] = useState("problems")
  const [timeRemaining, setTimeRemaining] = useState("")
  const Navigate=useNavigate()
  const isValidToken = useValidToken();
      if (!isValidToken) {
        Navigate("/login");
      }
      
  const userRole = localStorage.getItem("userRole");
      if (!userRole || userRole !== "ROLE_STUDENT") {
        return <div className="flex justify-center items-center h-screen">Access Denied</div>;
      }

   


  useEffect(() => {
    // Simulate API call to fetch contest
    const fetchContest = () => {
      // In a real app, this would be an API call
      console.log(id)
      const contest = mockContests[id]
      setContest(contest)
    }

    fetchContest()
  }, [id])

  useEffect(() => {
    if (!contest) return

    // Calculate time remaining
    const calculateTimeRemaining = () => {
      const now = new Date()
      const end = new Date(contest.endTime)
      
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Contest ended")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeRemaining(`${hours}h ${minutes}m`)
    }

    calculateTimeRemaining()
    const timer = setInterval(calculateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [contest])

  const handleProblemClick = (problemId) => {
    // Navigate to problem page
    useToast({
      title: "Navigating to problem",
      description: `Opening problem ${problemId}`,
    })
  }

  if (!contest) {
    return <div className="flex justify-center items-center h-screen">Loading contest...</div>
  }

  const completedProblems = contest.problems.filter((p) => p.completed).length
  const progress = (completedProblems / contest.problems.length) * 100

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => Navigate(-1)} className="flex items-center gap-2 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium cursor-pointer">Go Back</span>
            </button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2 font-bold text-xl">
              <Code2 className="h-6 w-6" />
              <span>Turify</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{contest.title}</h1>
              <p className="text-muted-foreground">{contest.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Time Remaining</p>
                  <p className="font-medium">{timeRemaining}</p>
                </div>
              </div>
              <Badge className="bg-green-500 hover:bg-green-600">Live</Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="problems">Problems</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value="problems" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contest Info */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Contest Information</CardTitle>
                    <CardDescription>Details about this contest</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Batch</span>
                        <span className="font-medium">{contest.batch}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{contest.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Problems</span>
                        <span className="font-medium">{contest.problems.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completed</span>
                        <span className="font-medium">
                          {completedProblems}/{contest.problems.length}
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full gap-2" onClick={() => setActiveTab("leaderboard")}>
                      <Trophy className="h-4 w-4" />
                      View Leaderboard
                    </Button>
                  </CardFooter>
                </Card>

                {/* Problems List */}
                <div className="md:col-span-2 space-y-4">
                  <h2 className="text-lg font-medium">Problems</h2>
                  <div className="space-y-4">
                    {contest.problems.map((problem, index) => (
                      <motion.div
                        key={problem.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  {problem.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                                  {index + 1}. {problem.title}
                                </CardTitle>
                              </div>
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
                          </CardHeader>
                          <CardFooter>
                            <Link to={`/problem/${problem.id}`} className="w-full">
                              <Button className="w-full" variant={problem.completed ? "outline" : "default"}>
                                {problem.completed ? "View Solution" : "Solve Problem"}
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="leaderboard">
              <Card>
                <CardHeader>
                  <CardTitle>Contest Leaderboard</CardTitle>
                  <CardDescription>Rankings based on score and time taken</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Rank</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Problems Solved</TableHead>
                        <TableHead>Time Taken</TableHead>
                        <TableHead>Department</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contest.participants.map((participant, index) => (
                        <TableRow key={participant.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-1">
                              {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                              {index === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
                              {index === 2 && <Trophy className="h-4 w-4 text-amber-700" />}
                              {index + 1}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{participant.username}</TableCell>
                          <TableCell>{participant.score}</TableCell>
                          <TableCell>{participant.problemsSolved}</TableCell>
                          <TableCell>{participant.timeTaken}</TableCell>
                          <TableCell>{participant.department}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default ContestPage

