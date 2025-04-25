"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Code2, Loader2, Play, Save } from "lucide-react"
import { toast } from "react-toastify"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism"
import Editor from "@monaco-editor/react"

import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"
import { Separator } from "./ui/separator"
import { Card } from "./ui/card"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"
import { useTheme } from "../components/theme-provider"
import useValidToken from "../components/hooks/useValidToken"
import useContestToken from "../components/hooks/use-contest-token"

function ProblemPage() {
  const { contestId, problemId } = useParams()
  const navigate = useNavigate()
  const isValidToken = useValidToken()
  const { isValid: isContestTokenValid, isLoading: isContestTokenLoading } = useContestToken()
  const { theme } = useTheme()

  const [isLoading, setIsLoading] = useState(true)
  const [problemData, setProblemData] = useState("")
  const [code, setCode] = useState("// Write your code here\n")
  const [language, setLanguage] = useState("java")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const editorRef = useRef(null)
  
  // Check authentication and authorization
  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is logged in
      if (!isValidToken) {
        toast.error("You need to be logged in")
        navigate("/login")
        return
      }

      // Check if user is a student
      const userRole = localStorage.getItem("userRole")
      if (!userRole || userRole !== "ROLE_STUDENT") {
        toast.error("Access denied")
        navigate("/")
        return
      }

      // Check if contest token is valid
      if (!isContestTokenLoading && !isContestTokenValid) {
        toast.error("Your contest session has expired")
        navigate(`/contest/${contestId}`)
        return
      }
    }

    checkAuth()
  }, [isValidToken, isContestTokenValid, isContestTokenLoading, navigate, contestId])

  
  useEffect(() => {
    const fetchProblemData = async () => {
      if (!isValidToken || !isContestTokenValid) return

      setIsLoading(true)
      try {
        const response = await fetch(
          `http://localhost:8081/api/v0/contest/contest-problem?contestId=${contestId}&problemId=${problemId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          },
        )
        console.log(response)

        if (response.ok) {
          // const data = await response.text()
            const responseData = await response.json();
            console.log(responseData.data)
            setProblemData(responseData.data);
        } else {
          toast.error("Failed to fetch problem")
          console.log(problemId)
          // navigate(`/contest/${contestId}`)
        }
      } catch (error) {
        console.error("Error fetching problem:", error)
        toast.error("Error fetching problem")
      } finally {
        setIsLoading(false)
      }
    }

    if (!isContestTokenLoading) {
      fetchProblemData()
    }
  }, [contestId, problemId, isValidToken, isContestTokenValid, isContestTokenLoading, navigate])

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor
  }

  // Handle code change
  const handleCodeChange = (value) => {
    setCode(value)
  }

  // Handle language change
  const handleLanguageChange = (value) => {
    setLanguage(value)

    // Set default code template based on language
    switch (value) {
      case "java":
        setCode(`// Java solution
public class Main {
    public static void main(String[] args) {
        // Your solution here
    }
}`)
        break
      case "python":
        setCode(`# Python solution
def Main():
    # Your solution here
    pass

if __name__ == "__main__":
    Main()`)
        break
      case "javascript":
        setCode(`// JavaScript solution
function Main() {
    // Your solution here
}

Main();`)
        break
      case "cpp":
        setCode(`// C++ solution
#include <iostream>
using namespace std;

int main() {
    // Your solution here
    return 0;
}`)
        break
      default:
        setCode("// Write your code here\n")
    }
  }

  // Handle code submission
  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("Please write some code before submitting")
      return
    }

    setIsSubmitting(true)
    try {
      const languageIdMap = {
        java: 62,
        python: 71,
        javascript: 63,
        cpp: 54,
      }
      console.log(code)
      const languageId = languageIdMap[language] || 62 // Default to Java if language is not mapped

      const response = await fetch("http://localhost:8081/api/v0/contest/submit-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          contestId,
          problemId,
          code,
          languageId,
        }),
      })

      if (response.ok) {
        const responseData = await response.json();
        const testCaseResults = responseData.data;

        let hasWrongAnswer = false;

        testCaseResults.forEach((testCase) => {
          if (testCase.status.description === "Wrong Answer") {
            hasWrongAnswer = true;
            toast.error(`Test Case ${testCase.tcName}: Wrong Answer`);
            return;
          } 
        });

        if (!hasWrongAnswer) {
          toast.success("All test cases passed successfully!");
        }
        
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Error submitting solution")
      }
    } catch (error) {
      console.error("Error submitting solution:", error)
      toast.error("Error submitting solution")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle code run
  const handleRun = async () => {
    if (!code.trim()) {
      toast.error("Please write some code before submitting")
      return
    }

    setIsSubmitting(true)
    try {
      const languageIdMap = {
        java: 62,
        python: 71,
        javascript: 63,
        cpp: 54,
      }
      console.log(code)
      const languageId = languageIdMap[language] || 62 

      const response = await fetch("http://localhost:8081/api/v0/contest/submit-sample", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          contestId,
          problemId,
          code,
          languageId,
        }),
      })

      if (response.ok) {
        const responseData = await response.json();
        const testCaseResults = responseData.data;

        let hasWrongAnswer = false;

        testCaseResults.forEach((testCase) => {
          if (testCase.status.description === "Wrong Answer") {
            hasWrongAnswer = true;
            toast.error(`Test Case ${testCase.tcName}: Wrong Answer`);
            return;
          } 
        });

        if (!hasWrongAnswer) {
          toast.success("Test cases passed successfully! submit the problem to check all test cases");
        }
        
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || "Error Running solution")
      }
      
    } catch (error) {
      console.error("Error submitting solution:", error)
      toast.error("Error submitting solution")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Custom renderer for code blocks in markdown
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "")
      return !inline && match ? (
        <SyntaxHighlighter style={theme === "dark" ? vscDarkPlus : vs} language={match[1]} PreTag="div" {...props}>
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },
  }

  if (isLoading || isContestTokenLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 text-primary animate-spin mr-2" />
        <span>Loading problem...</span>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/contest/${contestId}`)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium cursor-pointer">Back to Contest</span>
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

      <main className="flex-1 container py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-8rem)]">
          {/* Problem Description */}
          <Card className="p-4 overflow-auto">
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown components={components}>{problemData}</ReactMarkdown>
            </div>
          </Card>

          {/* Code Editor */}
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
              <Tabs defaultValue="java" value={language} onValueChange={handleLanguageChange}>
                <TabsList>
                  <TabsTrigger value="java">Java</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="cpp">C++</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRun} disabled={isSubmitting}>
                  <Play className="h-4 w-4 mr-1" />
                  Run
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Submit
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Card className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="java"
                language={language}
                value={code}
                onChange={handleCodeChange}
                onMount={handleEditorDidMount}
                theme={theme === "dark" ? "vs-dark" : "light"}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProblemPage
