import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, Clock, Code2, Trophy, Loader2 } from "lucide-react"
import { Download } from "lucide-react"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"
import { Separator } from "./ui/separator"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { toast } from "react-toastify"
import useValidToken from "../components/hooks/useValidToken"
import useContestToken from "../components/hooks/use-contest-token"

function ContestPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isValidToken = useValidToken()
  const { isValid: isContestTokenValid, isLoading: isContestTokenLoading } = useContestToken()

  const [contest, setContest] = useState(null)
  const [problems, setProblems] = useState([])
  const [activeTab, setActiveTab] = useState("problems")
  const [timeRemaining, setTimeRemaining] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  
  const [completedProblems, setCompletedProblems] = useState([])
  const [leaderboardData, setLeaderboardData] = useState([])

  
  // Check if user has valid token and is a student
  useEffect(() => {
    if (!isValidToken) {
      navigate("/login")
      return
    }

    const userRole = localStorage.getItem("userRole")
    if (!userRole || userRole !== "ROLE_STUDENT") {
      navigate("/")
      toast.error("Access denied")
      return
    }
  }, [isValidToken, navigate])

  
  // Check if user has contest token


  
  // Enter contest and get contest token
  const enterContest = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:8081/api/v0/contest/enter-contest/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        localStorage.setItem("accessToken", result.data.jwt)
        const problemsData = result.data.problems || []
        localStorage.setItem("problems", JSON.stringify(problemsData))
        setProblems(problemsData)
        localStorage.setItem(id,true)
        toast.success(result.message || "Successfully entered contest")
      } else {
        toast.error("Failed to enter contest")
      }
    } catch (error) {
      console.error("Error entering contest:", error)
      toast.error("Error entering contest")
    } finally {
      setIsLoading(false)
    }
  }

  
  // Initialize problems from localStorage if present
  useEffect(() => {
    const storedProblems = localStorage.getItem("problems")
    if (storedProblems) {
      setProblems(JSON.parse(storedProblems))
    }
  }, [])

  
  // Fetch contest data
  useEffect(() => {
    const fetchContest = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`http://localhost:8081/api/v0/contest/assigned-contests`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
        
        if (response.ok) {
          const result = await response.json()
          const contestData = result.data.find((c) => c.contestID === id)

          if (contestData) {
            setContest(contestData)
          } else {
            toast.error("Contest not found")
            navigate(`/student-dashboard/${localStorage.getItem("username")}`)
          }
        } else {
          toast.error("Failed to fetch contest")
          navigate(`/student-dashboard/${localStorage.getItem("username")}`)
        }
      } catch (error) {
        console.error("Error fetching contest:", error)
        toast.error(" Error fetching contest")
      } finally {
        setIsLoading(false)
      }
    }

    fetchContest()
  }, [id, navigate])

  
  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`http://localhost:8081/api/v0/contest/leaderboard/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          setLeaderboardData(result.data)
        } else {
          toast.error("Failed to fetch leaderboard")
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
        toast.error("Error fetching leaderboard")
      } finally {
        setIsLoading(false)
      }
    }

    if (localStorage.getItem(id)) {
      fetchLeaderboard()
    }
  }, [id])

  
  // Calculate time remaining
  useEffect(() => {
    if (!contest) return

    const calculateTimeRemaining = () => {
      const now = new Date()
      const end = new Date(contest.endTime)

      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining("Contest ended")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeRemaining(`${hours}h ${minutes}m`)
    }

    calculateTimeRemaining()
    const timer = setInterval(calculateTimeRemaining, 60000)

    return () => clearInterval(timer)
  }, [contest])

  
  const generateContestName = (startTime) => {
    if (!startTime) return "Contest"
    const date = new Date(startTime)
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const dayName = days[date.getDay()]
    return `${dayName} Contest`
  }

  
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A"
    const start = new Date(startTime)
    const end = new Date(endTime)
    const diff = end.getTime() - start.getTime()

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  const handleDownloadLeaderboard = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/v0/contest/leaderboard/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to download leaderboard")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `leaderboard_${id}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Leaderboard downloaded successfully")
    } catch (error) {
      console.error("Download error:", error)
      toast.error("Error downloading leaderboard")
    }
  }

  
  const navigateToProblem = (problemId) => {
    if (!isValidToken) {
      toast.error("You need to be logged in")
      navigate("/login")
      return
    }

    navigate(`/contest/problem/${id}/${problemId}`);
  }

  
  if (isLoading || isContestTokenLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 text-primary animate-spin mr-2" />
        <span>Loading...</span>
      </div>
    )
  }

  
  if (localStorage.getItem(id)=="false") {
    console.log(typeof localStorage.getItem(id))
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Enter Contest</CardTitle>
            <CardDescription>You need to enter the contest to view its details</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Contest: {contest ? generateContestName(contest.startTime) : "Loading..."}</p>
            <p className="mb-4">
              Duration: {contest ? calculateDuration(contest.startTime, contest.endTime) : "Loading..."}
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={enterContest}>
              Enter Contest
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  
  if (!contest) {
    return <div className="flex justify-center items-center h-screen">Contest not found</div>
  }

  
  const progress = problems.length > 0 ? (completedProblems.length / problems.length) * 100 : 0

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/student-dashboard/${localStorage.getItem("username")}`)} className="flex items-center gap-2 cursor-pointer">
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
              <h1 className="text-2xl font-bold">{generateContestName(contest.startTime)}</h1>
              <p className="text-muted-foreground">{contest.contestName}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Time Remaining</p>
                  <p className="font-medium">{timeRemaining}</p>
                </div>
              </div>
              <Badge
                className={
                  contest.status === "ACTIVE"
                    ? "bg-green-500 hover:bg-green-600"
                    : contest.status === "SCHEDULED"
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-500 hover:bg-gray-600"
                }
              >
                {contest.status === "ACTIVE" ? "Live" : contest.status === "SCHEDULED" ? "Scheduled" : "Closed"}
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="problems">Problems</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value="problems" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Contest Information</CardTitle>
                    <CardDescription>Details about this contest</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Start Time</span>
                        <span className="font-medium">{new Date(contest.startTime).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">End Time</span>
                        <span className="font-medium">{new Date(contest.endTime).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{calculateDuration(contest.startTime, contest.endTime)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Problems</span>
                        <span className="font-medium">{problems.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completed</span>
                        <span className="font-medium">
                          {completedProblems.length}/{problems.length}
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

                <div className="md:col-span-2 space-y-4">
                  <h2 className="text-lg font-medium">Problems</h2>
                  <div className="space-y-4">
                    {problems.map((problem, index) => (
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
                                  {completedProblems.includes(problem.id) && (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  )}
                                  {index + 1}. {problem.name}
                                </CardTitle>
                              </div>
                              <Badge className="bg-primary hover:bg-primary/90">{problem.points} Points</Badge>
                            </div>
                          </CardHeader>
                          <CardFooter>
                            <Button
                              className="w-full"
                              variant={completedProblems.includes(problem.id) ? "outline" : "default"}
                              onClick={() => navigateToProblem(problem.id)}
                            >
                              {completedProblems.includes(problem.id) ? "View Solution" : "Solve Problem"}
                            </Button>
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
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col items-start">
                      <CardTitle>Contest Leaderboard</CardTitle>
                      <CardDescription>Rankings based on score and time taken</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      className="flex gap-2 items-center"
                      onClick={handleDownloadLeaderboard}
                    >
                      <Download className="w-4 h-4" />
                      Download Leaderboard
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Rank</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Time Taken</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboardData.map((participant, index) => (
                        <TableRow key={participant.userId}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-1">
                              {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                              {index === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
                              {index === 2 && <Trophy className="h-4 w-4 text-amber-700" />}
                              {index + 1}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{participant.username}</TableCell>
                          <TableCell>{participant.points}</TableCell>
                          <TableCell>{participant.timeTaken}</TableCell>
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