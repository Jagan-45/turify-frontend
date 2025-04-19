"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, ArrowUpDown, Code2, Download, Filter, Search, Trophy } from "lucide-react"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ModeToggle } from "./mode-toggle"
import { Badge } from "./ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { useToast } from "../components/hooks/use-toast"
import  useValidToken  from "../components/hooks/useValidToken"
import { useEffect } from "react"
// Mock leaderboard data
const mockLeaderboardData = [
  {
    id: "e147b099-3db4-4732-81d9-6d08e72c071f",
    username: "user10",
    overAllRating: 147,
    contestRating: 190,
    taskStreak: 4,
    level: "MASTER",
    department: "Electrical Engineering",
    year: 2,
  },
  {
    id: "a7df5066-0f18-45ce-b348-e128b4c8c173",
    username: "user4",
    overAllRating: 148,
    contestRating: 216,
    taskStreak: 11,
    level: "CODER",
    department: "Electrical Engineering",
    year: 6,
  },
  {
    id: "5ea3af60-6141-4ba2-a500-e1c2ee624ebe",
    username: "user17",
    overAllRating: 155,
    contestRating: 372,
    taskStreak: 9,
    level: "NEWBIE",
    department: "Mechanical Engineering",
    year: 8,
  },
  {
    id: "3e32272a-595d-4a18-8210-76c1a7cf8677",
    username: "user15",
    overAllRating: 165,
    contestRating: 103,
    taskStreak: 39,
    level: "NEWBIE",
    department: "Civil Engineering",
    year: 3,
  },
  {
    id: "8a7c9b23-5d4e-1f2a-3b6c-7d8e9f0a1b2c",
    username: "user22",
    overAllRating: 210,
    contestRating: 245,
    taskStreak: 15,
    level: "EXPERT",
    department: "Computer Science",
    year: 4,
  },
  {
    id: "9b8a7c6d-5e4f-3d2c-1b0a-9e8d7f6c5b4a",
    username: "user7",
    overAllRating: 178,
    contestRating: 198,
    taskStreak: 7,
    level: "SPECIALIST",
    department: "Computer Science",
    year: 3,
  },
  {
    id: "2c3d4e5f-6g7h-8i9j-0k1l-2m3n4o5p6q7r",
    username: "user31",
    overAllRating: 192,
    contestRating: 220,
    taskStreak: 21,
    level: "EXPERT",
    department: "Mechanical Engineering",
    year: 2,
  },
  {
    id: "7r6q5p4o-3n2m-1l0k-9j8i-7h6g5f4e3d2c",
    username: "user18",
    overAllRating: 135,
    contestRating: 150,
    taskStreak: 5,
    level: "NEWBIE",
    department: "Civil Engineering",
    year: 1,
  },
  {
    id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    username: "user42",
    overAllRating: 225,
    contestRating: 280,
    taskStreak: 30,
    level: "MASTER",
    department: "Computer Science",
    year: 4,
  },
  {
    id: "6p5o4n3m-2l1k-0j9i-8h7g-6f5e4d3c2b1a",
    username: "user25",
    overAllRating: 168,
    contestRating: 175,
    taskStreak: 12,
    level: "SPECIALIST",
    department: "Electrical Engineering",
    year: 3,
  },
]

// Mock contest data
const mockContestData = {
  id: "contest-123",
  title: "Dynamic Programming Challenge",
  date: "April 5, 2023",
  participants: [
    {
      id: "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
      username: "user42",
      score: 95,
      solvedProblems: 4,
      timeTaken: "1h 45m",
      department: "Computer Science",
      year: 4,
    },
    {
      id: "2c3d4e5f-6g7h-8i9j-0k1l-2m3n4o5p6q7r",
      username: "user31",
      score: 90,
      solvedProblems: 4,
      timeTaken: "1h 52m",
      department: "Mechanical Engineering",
      year: 2,
    },
    {
      id: "9b8a7c6d-5e4f-3d2c-1b0a-9e8d7f6c5b4a",
      username: "user7",
      score: 85,
      solvedProblems: 3,
      timeTaken: "1h 30m",
      department: "Computer Science",
      year: 3,
    },
    {
      id: "6p5o4n3m-2l1k-0j9i-8h7g-6f5e4d3c2b1a",
      username: "user25",
      score: 80,
      solvedProblems: 3,
      timeTaken: "1h 40m",
      department: "Electrical Engineering",
      year: 3,
    },
    {
      id: "5ea3af60-6141-4ba2-a500-e1c2ee624ebe",
      username: "user17",
      score: 75,
      solvedProblems: 3,
      timeTaken: "1h 55m",
      department: "Mechanical Engineering",
      year: 8,
    },
    {
      id: "a7df5066-0f18-45ce-b348-e128b4c8c173",
      username: "user4",
      score: 70,
      solvedProblems: 3,
      timeTaken: "2h 05m",
      department: "Electrical Engineering",
      year: 6,
    },
    {
      id: "e147b099-3db4-4732-81d9-6d08e72c071f",
      username: "user10",
      score: 65,
      solvedProblems: 2,
      timeTaken: "1h 50m",
      department: "Electrical Engineering",
      year: 2,
    },
    {
      id: "8a7c9b23-5d4e-1f2a-3b6c-7d8e9f0a1b2c",
      username: "user22",
      score: 60,
      solvedProblems: 2,
      timeTaken: "2h 10m",
      department: "Computer Science",
      year: 4,
    },
    {
      id: "3e32272a-595d-4a18-8210-76c1a7cf8677",
      username: "user15",
      score: 55,
      solvedProblems: 2,
      timeTaken: "2h 15m",
      department: "Civil Engineering",
      year: 3,
    },
    {
      id: "7r6q5p4o-3n2m-1l0k-9j8i-7h6g5f4e3d2c",
      username: "user18",
      score: 50,
      solvedProblems: 2,
      timeTaken: "2h 20m",
      department: "Civil Engineering",
      year: 1,
    },
  ],
}

function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState("overAllRating")
  const [sortDirection, setSortDirection] = useState("desc")
  const [selectedDepartments, setSelectedDepartments] = useState([])
  const [activeTab, setActiveTab] = useState("global")
  const { toast } = useToast()
  const Navigate=useNavigate()
  const isValidToken = useValidToken();
      if (!isValidToken) {
        Navigate("/login");
      }


  // Get unique departments
  const departments = Array.from(new Set(mockLeaderboardData.map((user) => user.department)))

  // Handle sort
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc")
    }
  }

  // Filter and sort global leaderboard data
  const filteredGlobalData = mockLeaderboardData
    .filter(
      (user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedDepartments.length === 0 || selectedDepartments.includes(user.department)),
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

  // Filter and sort contest leaderboard data
  const filteredContestData = mockContestData.participants
    .filter(
      (user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedDepartments.length === 0 || selectedDepartments.includes(user.department)),
    )
    .sort((a, b) => {
      if (sortColumn === "score") {
        return sortDirection === "asc" ? a.score - b.score : b.score - a.score
      }
      if (sortColumn === "solvedProblems") {
        return sortDirection === "asc" ? a.solvedProblems - b.solvedProblems : b.solvedProblems - a.solvedProblems
      }
      return 0
    })

  // Toggle department selection
  const toggleDepartment = (department) => {
    if (selectedDepartments.includes(department)) {
      setSelectedDepartments(selectedDepartments.filter((d) => d !== department))
    } else {
      setSelectedDepartments([...selectedDepartments, department])
    }
  }

  // Get badge color based on level
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
    useToast({
      title: "Exporting leaderboard",
      description: "Leaderboard data has been exported to CSV.",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
           <button onClick={() => Navigate(-1)} className="flex items-center gap-2 cursor-pointer">
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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="global">Global Leaderboard</TabsTrigger>
              <TabsTrigger value="contest">Contest Leaderboard</TabsTrigger>
            </TabsList>

            {/* Global Leaderboard */}
            <TabsContent value="global" className="space-y-4">
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
                        key={user.id}
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
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          <Badge className={getLevelBadgeColor(user.level)}>{user.level}</Badge>
                        </TableCell>
                        <TableCell>{user.overAllRating}</TableCell>
                        <TableCell>{user.contestRating}</TableCell>
                        <TableCell>{user.taskStreak}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>{user.year}</TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Contest Leaderboard */}
            <TabsContent value="contest" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium">{mockContestData.title}</h2>
                  <p className="text-sm text-muted-foreground">{mockContestData.date}</p>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Rank</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("score")}>
                        <div className="flex items-center gap-1">
                          Score
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("solvedProblems")}>
                        <div className="flex items-center gap-1">
                          Problems Solved
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Time Taken</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Year</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContestData.map((user, index) => (
                      <motion.tr
                        key={user.id}
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
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.score}</TableCell>
                        <TableCell>{user.solvedProblems}</TableCell>
                        <TableCell>{user.timeTaken}</TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>{user.year}</TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

export default Leaderboard

