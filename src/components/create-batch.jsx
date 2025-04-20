"use client"

import { useState,useEffect } from "react"
import { Upload, Users, X } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { useNavigate } from "react-router-dom"
import useValidToken from "../components/hooks/useValidToken"
import { toast } from "react-toastify"

const formSchema = z.object({
  batchName: z.string().min(3, {
    message: "Batch name must be at least 3 characters.",
  }),
  students: z.string().optional(),
})

export function CreateBatch({ open, onOpenChange, isCreated, BatchName, method}) {
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState(null)
  const navigate=useNavigate()
  const  isValidToken  = useValidToken()

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    if (!userRole || userRole !== "ROLE_STAFF" || !isValidToken) {
        navigate("/login")
      }
    }, [isValidToken, navigate])
  
    if (!localStorage.getItem("userRole") || localStorage.getItem("userRole") !== "ROLE_STAFF") {
    return <h1>Access Denied</h1>
    }

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchName: "",
      students: "",
    },
  })


  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  const handleFileUpload = async () => {
    if (!file) {
      toast.error("Please upload a file before submitting.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:8081/api/v0/batches?batchName=${form.getValues("batchName")}`, {
        method: method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      })

      if (!response.ok) {
        toast.error("Failed to upload file")
        console.log(response)
        return;
      }

      toast.success("Batch created successfully!")
       isCreated((prev) => !prev)
      onOpenChange(false)
      form.reset()
      setFile(null)
    } catch (error) {
      console.error(error)
      toast.error("An error occurred while creating the batch.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Batch</DialogTitle>
          <DialogDescription>Add a new batch of students to manage.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleFileUpload()
            }}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="batchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., IT 2023"
                      {...field}
                      value={BatchName !== "" ? BatchName : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Add Students</FormLabel>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="file"
                    accept=".xlsx, .xls"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    {file ? file.name : "Upload Excel file"}
                  </label>
                  {file && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Button type="button" variant="outline" size="icon" className="flex-shrink-0">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Users className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Batch"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

