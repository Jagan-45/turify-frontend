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
import { Loader } from "./ui/loader"

function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState("overAllRating")
  const [sortDirection, setSortDirection] = useState("desc")
  const [selectedDepartments, setSelectedDepartments] = useState([])
  const [leaderboardData, setLeaderboardData] = useState([])
  const { toast } = useToast()
  const navigate = useNavigate()
  const isValidToken = useValidToken()
  const [loading, setLoading] = useState(true)

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

      const newdata=await response.data
      const d=JSON.parse(newdata).data
      console.log(d.content.map((item)=>console.log(item.user.batch)))
      const extractedData = d.content.map((item) => ({
        overAllRating: item.overAllRating ?? 0,
        contestRating: item.contestRating ?? 0,
        taskStreak: item.taskStreak ?? 0,
        level: item.level ?? "NEWBIE",
        user: {
          userID: item.user.userID ?? "",
          username: item.user.username ?? "",
          role: item.user.role ?? "",
          year: item.user.year ?? "",
          department: {
        deptID: item.user.department?.deptID ?? "",
        deptName: item.user.department?.deptName ?? "",
          },
          batch: {
        batchID: item.user.batch?.batchID ?? "",
        batchName: item.user.batch?.batchName ?? "",
          },
        },
      }));
      setLeaderboardData(extractedData);
      setLoading(false);
      
     
    } catch (error) {
      console.error("Error fetching leaderboard data:", error.message);
      toast.error("Failed to fetch leaderboard data. Please try again later.");
      setLoading(false);
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
    loading ? (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    ) : (
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
  )
}

export default Leaderboard