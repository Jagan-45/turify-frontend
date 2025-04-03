"use client"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Code2, GraduationCap, LineChart, MessageSquareCode, Users, Zap } from "lucide-react"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Code2 className="h-6 w-6" />
            <span>Turify</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
              How It Works
            </a>
            <a href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4">
              Testimonials
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link to="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container py-24 sm:py-32">
          <motion.div
            className="flex flex-col items-center text-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Elevate Your Placement Preparation with <span className="text-primary">Turify</span>
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              A comprehensive platform for students and teachers to collaborate on coding challenges, contests, and
              placement preparation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link to="/signup?role=student">
                <Button size="lg" className="gap-2">
                  Student Sign Up <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login?role=teacher">
                <Button size="lg" variant="outline" className="gap-2">
                  Teacher Login <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        <section id="features" className="container py-24 sm:py-32 border-t">
          <div className="flex flex-col items-center text-center gap-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Powerful Features</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Everything you need to excel in your placement preparation journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              className="flex flex-col gap-2 p-6 border rounded-lg"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <MessageSquareCode className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Task Assignment</h3>
              <p className="text-muted-foreground">
                Teachers can create contests and assign LeetCode tasks to students.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col gap-2 p-6 border rounded-lg"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <LineChart className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Performance Tracking</h3>
              <p className="text-muted-foreground">
                Comprehensive analytics and leaderboards to track progress and identify areas for improvement.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col gap-2 p-6 border rounded-lg"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Users className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Batch Management</h3>
              <p className="text-muted-foreground">
                Organize students into batches for targeted learning and contest participation.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col gap-2 p-6 border rounded-lg"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Zap className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Real-time Contests</h3>
              <p className="text-muted-foreground">
                Participate in scheduled, ongoing, and past contests with real-time feedback.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col gap-2 p-6 border rounded-lg"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <GraduationCap className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Skill Development</h3>
              <p className="text-muted-foreground">
                Targeted daily tasks to build consistent coding habits and improve problem-solving skills.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col gap-2 p-6 border rounded-lg"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Code2 className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Integrated Code Editor</h3>
              <p className="text-muted-foreground">
                Solve problems directly on the platform with our powerful code editor and test cases.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Additional sections omitted for brevity */}

        <section className="bg-muted py-24 sm:py-32">
          <div className="container">
            <div className="flex flex-col items-center text-center gap-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to Elevate Your Placement Preparation?
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Join Turify today and take the first step towards your dream placement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link to="/signup?role=student">
                  <Button size="lg" className="gap-2">
                    Get Started as Student <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login?role=teacher">
                  <Button size="lg" variant="outline" className="gap-2">
                    Log In as Teacher <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-12">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Code2 className="h-6 w-6" />
            <span>Turify</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Turify. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

