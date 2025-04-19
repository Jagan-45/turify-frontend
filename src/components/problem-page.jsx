"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, CheckCircle, ChevronDown, Code2, Copy, Play, Send, Terminal } from "lucide-react"

import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { useToast } from "../components/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import useValidToken from "../components/hooks/useValidToken"


// Mock problem data
const mockProblems = {
  1: {
    id: "1",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Arrays", "Hash Table"],
    description: `
      Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
      
      You may assume that each input would have exactly one solution, and you may not use the same element twice.
      
      You can return the answer in any order.
    `,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 6, we return [0, 1].",
      },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
  },
  2: {
    id: "2",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    description: `
      Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
      
      An input string is valid if:
      
      1. Open brackets must be closed by the same type of brackets.
      2. Open brackets must be closed in the correct order.
      3. Every close bracket has a corresponding open bracket of the same type.
    `,
    examples: [
      {
        input: 's = "()"',
        output: "true",
      },
      {
        input: 's = "()[]{}"',
        output: "true",
      },
      {
        input: 's = "(]"',
        output: "false",
      },
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
  },
  3: {
    id: "3",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Stack", "String"],
    description: `
      Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
      
      An input string is valid if:
      
      1. Open brackets must be closed by the same type of brackets.
      2. Open brackets must be closed in the correct order.
      3. Every close bracket has a corresponding open bracket of the same type.
    `,
    examples: [
      {
        input: 's = "()"',
        output: "true",
      },
      {
        input: 's = "()[]{}"',
        output: "true",
      },
      {
        input: 's = "(]"',
        output: "false",
      },
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
  },
}

function ProblemPage() {
  const { id } = useParams()
  const [problem, setProblem] = useState(null)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const isValidToken = useValidToken()
  if (!isValidToken) {
    navigate("/login")
  }
 
  const userRole = localStorage.getItem("userRole")
  if (userRole !== "ROLE_STUDENT" || !userRole) {
    return <h1>Access Denied</h1>
  }
          
  

  useEffect(() => {
    const fetchProblem = () => {
      const problem = mockProblems[id]
      console.log(mockProblems[id])
      // if (!problem) {
      //   useToast({
      //     title: "Problem not found",
      //     description: `No problem found for ID: ${id}`,
      //     variant: "destructive",
      //   })
      //   return
      // }
      setProblem(problem)

      // Set default code based on language
     
    }

    fetchProblem()
  }, [id]) // Added toast to dependencies

//   useEffect(()=>{
//     setTimeout(()=>{},1000)
//     console.log(problem)
//      if (language === "javascript") {
//         setCode(`function ${problem.title.toLowerCase().replace(/\s+/g, "")}(${problem.title === "Two Sum" ? "nums, target" : "s"}) {
//   // Your solution here
// }`)
//       } else if (language === "python") {
//         setCode(`def ${problem.title.toLowerCase().replace(/\s+/g, "")}(${problem.title === "Two Sum" ? "nums, target" : "s"}):
//     # Your solution here
//     pass`)
//       }
//   },[language,problem])

  const runCode = () => {
    setIsRunning(true)
    setOutput("")

    // Simulate code execution
    setTimeout(() => {
      setOutput(
        "Running test cases...\n\nTest Case 1: PASSED\nTest Case 2: PASSED\nTest Case 3: PASSED\n\nAll test cases passed!",
      )
      setIsRunning(false)

      useToast({
        title: "Code executed successfully",
        description: "All test cases passed!",
      })
    }, 1500)
  }

  const submitCode = () => {
    setIsSubmitting(true)
    setOutput("")

    // Simulate code submission
    setTimeout(() => {
      setOutput(
        "Submitting solution...\n\nRuntime: 76 ms\nMemory: 42.5 MB\n\nYour solution beats 85% of JavaScript submissions.\n\nAccepted!",
      )
      setIsSubmitting(false)

      useToast({
        title: "Solution accepted!",
        description: "Your solution beats 85% of JavaScript submissions.",
      })
    }, 2000)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    useToast({
      title: "Code copied",
      description: "Code has been copied to clipboard.",
    })
  }

  if (!problem) {
    return <div className="flex justify-center items-center h-screen">Loading problem...</div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{mockProblems[1].title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  className={
                    mockProblems[1].difficulty === "Easy"
                      ? "bg-green-500 hover:bg-green-600"
                      : mockProblems[1].difficulty === "Medium"
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : "bg-red-500 hover:bg-red-600"
                  }
                >
                  {mockProblems[1].difficulty}
                </Badge>
                {mockProblems[1].tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium">Description</h2>
              <div className="whitespace-pre-line text-muted-foreground">{mockProblems[1].description}</div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium">Examples</h2>
              <div className="space-y-4">
                {mockProblems[1].examples.map((example, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-2">
                    <div>
                      <span className="font-medium">Input: </span>
                      <code className="bg-muted px-1 py-0.5 rounded text-sm">{example.input}</code>
                    </div>
                    <div>
                      <span className="font-medium">Output: </span>
                      <code className="bg-muted px-1 py-0.5 rounded text-sm">{example.output}</code>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="font-medium">Explanation: </span>
                        <span className="text-muted-foreground">{example.explanation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium">Constraints</h2>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {mockProblems[1].constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Code Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={copyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2" onClick={runCode} disabled={isRunning || isSubmitting}>
                  <Play className="h-4 w-4" />
                  Run
                </Button>
                <Button className="gap-2" onClick={submitCode} disabled={isRunning || isSubmitting}>
                  <Send className="h-4 w-4" />
                  Submit
                </Button>
              </div>
            </div>

            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted p-2 border-b">
                <span className="text-sm font-medium">Code Editor</span>
              </div>
              <textarea
                className="w-full h-[400px] p-4 font-mono text-sm bg-background focus:outline-none resize-none"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <Collapsible className="border rounded-md">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  <span className="font-medium">Console Output</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 font-mono text-sm whitespace-pre-line min-h-[100px] max-h-[200px] overflow-auto">
                  {isRunning && (
                    <div className="flex items-center gap-2">
                      <span className="animate-spin">⟳</span> Running code...
                    </div>
                  )}
                  {isSubmitting && (
                    <div className="flex items-center gap-2">
                      <span className="animate-spin">⟳</span> Submitting solution...
                    </div>
                  )}
                  {!isRunning && !isSubmitting && output ? (
                    output.includes("Accepted") ? (
                      <div className="text-green-500">
                        <CheckCircle className="h-4 w-4 inline mr-2" />
                        {output}
                      </div>
                    ) : (
                      output
                    )
                  ) : (
                    !isRunning && !isSubmitting && "Run your code to see output here."
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProblemPage