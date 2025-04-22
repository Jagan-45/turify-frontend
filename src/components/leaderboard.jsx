"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowUpDown, Code2, Download, Filter, Search, Trophy } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ModeToggle } from "./mode-toggle"
import { Badge } from "./ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { useToast } from "../components/hooks/use-toast"
import useValidToken from "../components/hooks/useValidToken"
import axios from "axios"

function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState("overAllRating")
  const [sortDirection, setSortDirection] = useState("desc")
  const [selectedDepartments, setSelectedDepartments] = useState([])
  const [leaderboardData, setLeaderboardData] = useState([])
  const { toast } = useToast()
  const navigate = useNavigate()
  const isValidToken = useValidToken()

  useEffect(() => {
    if (!isValidToken) {
      navigate("/login")
    } else {
      fetchLeaderboardData()
    }
  }, [])

  const fetchLeaderboardData = async () => {
    console.log("Fetching leaderboard data...");
    const accessToken = localStorage.getItem("accessToken");
    
    try {
      const response = await axios.get("http://localhost:8081/api/v0/leaderboard", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        transformResponse: [(data) => data],
      });
  
      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const text = response.data;
      const extractedData = [];
      
      try {
        const userIdPattern = /"userID"\s*:\s*"([^"]+)"/g;
        const usernamePattern = /"username"\s*:\s*"([^"]+)"/g;
        const rolePattern = /"role"\s*:\s*"([^"]+)"/g;
        const yearPattern = /"year"\s*:\s*(\d+)/g;
        const deptIdPattern = /"deptID"\s*:\s*(\d+)/g;
        const deptNamePattern = /"deptName"\s*:\s*"([^"]+)"/g;
        const batchIdPattern = /"batchID"\s*:\s*(\d+)/g;
        const batchNamePattern = /"batchName"\s*:\s*"([^"]+)"/g;
        const levelPattern = /"level"\s*:\s*"([^"]+)"/g;
        const overallRatingPattern = /"overAllRating"\s*:\s*(\d+)/g;
        const contestRatingPattern = /"contestRating"\s*:\s*(\d+)/g;
        const taskStreakPattern = /"taskStreak"\s*:\s*(\d+)/g;
        
        const userIds = [...text.matchAll(userIdPattern)].map(match => match[1]);
        const usernames = [...text.matchAll(usernamePattern)].map(match => match[1]);
        const roles = [...text.matchAll(rolePattern)].map(match => match[1]);
        const years = [...text.matchAll(yearPattern)].map(match => parseInt(match[1]));
        const deptIds = [...text.matchAll(deptIdPattern)].map(match => parseInt(match[1]));
        const deptNames = [...text.matchAll(deptNamePattern)].map(match => match[1]);
        const batchIds = [...text.matchAll(batchIdPattern)].map(match => parseInt(match[1]));
        const batchNames = [...text.matchAll(batchNamePattern)].map(match => match[1]);
        const levels = [...text.matchAll(levelPattern)].map(match => match[1]);
        const overallRatings = [...text.matchAll(overallRatingPattern)].map(match => parseInt(match[1]));
        const contestRatings = [...text.matchAll(contestRatingPattern)].map(match => parseInt(match[1]));
        const taskStreaks = [...text.matchAll(taskStreakPattern)].map(match => parseInt(match[1]));
        
        const uniqueUserIds = new Set();
        
        for (let i = 0; i < userIds.length; i++) {
          if (uniqueUserIds.has(userIds[i]) || roles[i] !== "ROLE_STUDENT") continue;
          
          uniqueUserIds.add(userIds[i]);
          
          extractedData.push({
            overAllRating: overallRatings[i] || 0,
            contestRating: contestRatings[i] || 0,
            taskStreak: taskStreaks[i] || 0,
            level: levels[i] || "NEWBIE",
            user: {
              userID: userIds[i],
              username: usernames[i],
              role: roles[i],
              year: years[i],
              department: {
                deptID: deptIds[i],
                deptName: deptNames[i]
              },
              batch: {
                batchID: batchIds[i],
                batchName: batchNames[i]
              }
            }
          });
        }
        
        console.log("Extracted leaderboard data:", extractedData);
        setLeaderboardData(extractedData);
        
      } catch (error) {
        console.error("Error extracting data:", error);
        throw new Error("Failed to extract leaderboard data");
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error.message);
      toast.error("Failed to fetch leaderboard data. Please try again later.");
    }
  }

  const departments = Array.from(new Set(leaderboardData.map((user) => user.user.department?.deptName)))

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  const filteredGlobalData = leaderboardData
    .filter(
      (user) =>
        user.user.username?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedDepartments.length === 0 || selectedDepartments.includes(user.user.department?.deptName)),
    )
    .sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return 0
    })

  const toggleDepartment = (department) => {if(selectedDepartments.includes(department)) {
      setSelectedDepartments(selectedDepartments.filter((d) => d !== department))
    } else {
      setSelectedDepartments([...selectedDepartments, department])
    }
  }


  const getLevelBadgeColor = (level) => {
    switch (level) {
      case "NEWBIE":
        return "bg-gray-500 hover:bg-gray-600"
      case "CODER":
        return "bg-green-500 hover:bg-green-600"
      case "SPECIALIST":
        return "bg-blue-500 hover:bg-blue-600"
      case "EXPERT":
        return "bg-purple-500 hover:bg-purple-600"
      case "MASTER":
        return "bg-yellow-500 hover:bg-yellow-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const handleExport = () => {
    toast.success("Exporting leaderboard data...")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium cursor-pointer">Go Back</span>
            </button>
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
              <h1 className="text-2xl font-bold">Leaderboard</h1>
              <p className="text-muted-foreground">Track student performance and rankings</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by username..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                    {selectedDepartments.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedDepartments.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <div className="p-2">
                    <p className="text-sm font-medium mb-2">Departments</p>
                    {departments.map((department) => (
                      <DropdownMenuCheckboxItem
                        key={department}
                        checked={selectedDepartments.includes(department)}
                        onCheckedChange={() => toggleDepartment(department)}
                      >
                        {department}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Rank</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("overAllRating")}>
                    <div className="flex items-center gap-1">
                      Overall Rating
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("contestRating")}>
                    <div className="flex items-center gap-1">
                      Contest Rating
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("taskStreak")}>
                    <div className="flex items-center gap-1">
                      Task Streak
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGlobalData.map((user, index) => (
                  <motion.tr
                    key={user.user.userID}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        {index === 0 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        {index === 1 && <Trophy className="h-4 w-4 text-gray-400" />}
                        {index === 2 && <Trophy className="h-4 w-4 text-amber-700" />}
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>{user.user.username}</TableCell>
                    <TableCell>
                      <Badge className={getLevelBadgeColor(user.level)}>{user.level}</Badge>
                    </TableCell>
                    <TableCell>{user.overAllRating}</TableCell>
                    <TableCell>{user.contestRating}</TableCell>
                    <TableCell>{user.taskStreak}</TableCell>
                    <TableCell>{user.user.department?.deptName}</TableCell>
                    <TableCell>{user.user.year}</TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Leaderboard