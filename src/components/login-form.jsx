"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Code2 } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "./ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { ModeToggle } from "./mode-toggle"
// Removed unused import
import { toast } from "react-toastify"

const formSchema = z.object({
  mailId: z.string().min(18, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

function LoginForm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [role,setRole]=useState('')
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mailId: "",
      password: "",
    },
  })

   const fetchProfile = async () => {
      try {
        console.log("Fetching profile data...")
        const response = await fetch("http://localhost:8081/api/v0/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        })
  
        if (response.ok) {
          const result = await response.json()
          console.log("Profile data received:", result.data)
          localStorage.setItem("userProfile", JSON.stringify(result.data))
        } else {
          console.error("Failed to fetch profile data")
          toast.error("Failed to fetch profile data")
        }
      } catch (error) {
        console.error("Error fetching profile data:", error)
        toast.error("Error fetching profile data")
      }
    }

  const onSubmit = async (values) => {
    setIsLoading(true);

    try {
      console.log(values);
      const response = await fetch("http://localhost:8081/api/v0/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mailID: values.mailId,
          password: values.password,
        }),
      });

      console.log(response);

      const result = await response.json();

      if (response.ok) {
        const decodedToken = JSON.parse(atob(result.data.split(".")[1]));
        const userRole = decodedToken.role;
        setRole(userRole);
        
        localStorage.setItem("accessToken", result.data);
        localStorage.setItem("userRole", userRole);
        if(localStorage.getItem("userProfile")){
          localStorage.removeItem("userProfile");
        }
        fetchProfile();
        setTimeout(()=>{},800)
        toast.success("Login successful!");
        if (userRole === "ROLE_STUDENT") {
          const username = values.mailId.split(".")[0];
          localStorage.setItem("username", username);
          navigate(`/student-dashboard/${username}`);
        } else if (userRole === "ROLE_STAFF") {
          const username = values.mailId.split(".")[0];
          navigate(`/teacher-dashboard/${username}`);
        }
      } else {
        toast.error(result.message || "Login failed!");
      }
    } catch (error) {
      toast.error("An error occurred during login!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center px-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4">
        <motion.div
          className="mx-auto w-full max-w-md space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="flex items-center gap-2 font-bold text-2xl">
              <Code2 className="h-8 w-8" />
              <span>Turify</span>
            </div>
            <h1 className="text-2xl font-bold">{"Login to your Account"}</h1>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </div>
          <div className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="mailId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mail Id</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Log in"}
                </Button>
              </form>
            </Form>
            {role === "student" && (
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/signup?role=student" className="font-medium underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default LoginForm

