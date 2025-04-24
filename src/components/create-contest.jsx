"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, ChevronsUpDown, Check } from "lucide-react"

import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { ScrollArea } from "./ui/scroll-area"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import useValidToken from "../components/hooks/useValidToken"
import { cn } from "../lib/utils"
import { Badge } from "./ui/badge"
import { toast } from "react-toastify"

export function CreateContest({ open, onOpenChange, onSubmit, batches, isCreated, method = "POST", contestData, contestId }) {
  const navigate = useNavigate()
  const isValidToken = useValidToken()

  const [isLoading, setIsLoading] = useState(false)
  const [openBatchSelector, setOpenBatchSelector] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [accessDenied, setAccessDenied] = useState(false)

  // Define schema based on method
  const createSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters." }),
    startDate: z.date({ required_error: "Please select a start date." }),
    startTime: z.string({ required_error: "Please select a start time." }),
    endDate: z.date({ required_error: "Please select an end date." }),
    endTime: z.string({ required_error: "Please select an end time." }),
    batch: z.array(z.string()).min(1, { message: "Please select at least one batch." }),
    topicCount: z.number().min(1, { message: "Please enter the number of topics." }),
    topics: z
      .array(
        z.object({
          topicTag: z.string().min(1, { message: "Please select a topic." }),
          difficulty: z.string().min(1, { message: "Please select a difficulty." }),
        }),
      )
      .min(1, { message: "At least one topic is required." }),
  })

  const updateSchema = z.object({
    contestId: z.string(),
    title: z.string().min(3, { message: "Title must be at least 3 characters." }),
    startDate: z.date({ required_error: "Please select a start date." }),
    startTime: z.string({ required_error: "Please select a start time." }),
    endDate: z.date({ required_error: "Please select an end date." }),
    endTime: z.string({ required_error: "Please select an end time." }),
  })

  // Set default values based on method
  const getDefaultValues = () => {
    if (method === "PUT" && contestData) {
      // Parse dates from contestData if available
      const startDateTime = contestData.startTime ? new Date(contestData.startTime) : undefined
      const endDateTime = contestData.endTime ? new Date(contestData.endTime) : undefined

      return {
        contestId: contestData.contestId || "",
        title: contestData.contestName || "",
        startDate: startDateTime,
        startTime: startDateTime ? format(startDateTime, "HH:mm") : "",
        endDate: endDateTime,
        endTime: endDateTime ? format(endDateTime, "HH:mm") : "",
      }
    }

    return {
      title: "",
      startDate: undefined,
      startTime: "",
      endDate: undefined,
      endTime: "",
      batch: [],
      topicCount: 1,
      topics: [{ topicTag: "", difficulty: "" }],
    }
  }

  const form = useForm({
    resolver: zodResolver(method === "PUT" ? updateSchema : createSchema),
    defaultValues: getDefaultValues(),
  })

  // Update form when contestData changes
  useEffect(() => {
    if (method === "PUT" && contestData) {
      const startDateTime = contestData.startTime ? new Date(contestData.startTime) : undefined
      const endDateTime = contestData.endTime ? new Date(contestData.endTime) : undefined

      form.reset({
        contestId: contestData.contestId || "",
        title: contestData.contestName || "",
        startDate: startDateTime,
        startTime: startDateTime ? format(startDateTime, "HH:mm") : "",
        endDate: endDateTime,
        endTime: endDateTime ? format(endDateTime, "HH:mm") : "",
      })
    }
  }, [contestData, method, form])

  useEffect(() => {
    const checkAccess = async () => {
      const userRole = localStorage.getItem("userRole")
      if (!userRole || userRole !== "ROLE_STAFF" || !isValidToken) {
        setAccessDenied(true)
        navigate("/login")
      } else {
        setAccessDenied(false)
      }
    }

    checkAccess()
  }, [isValidToken, navigate])

  if (accessDenied) {
    return <h1>Access Denied</h1>
  }

  const toggleBatch = (batch) => {
    const current = form.getValues("batch")
    if (current.includes(batch)) {
      form.setValue(
        "batch",
        current.filter((b) => b !== batch),
      )
    } else {
      form.setValue("batch", [...current, batch])
    }
  }

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true)
      console.log("Form values before processing:", values)

      let formattedValues

      if (method === "PUT") {
        // For update, send contestId, title, startTime, and endTime
        formattedValues = {
          contestId: contestId,
          contestName: values.title,
          startTime: `${format(values.startDate, "yyyy-MM-dd")}T${values.startTime}:00`,
          endTime: `${format(values.endDate, "yyyy-MM-dd")}T${values.endTime}:00`,
        }
      } else {
        // For create, include all fields
        const topicsWithDefaults = values.topics.map((topic) => ({
          ...topic,
          point: topic.difficulty === "easy" ? 10 : topic.difficulty === "medium" ? 20 : 30,
          count: 4, // Default value of 4 for count
        }))

        formattedValues = {
          contestName: values.title,
          startTime: `${format(values.startDate, "yyyy-MM-dd")}T${values.startTime}:00`,
          endTime: `${format(values.endDate, "yyyy-MM-dd")}T${values.endTime}:00`,
          assignToBatches: values.batch,
          req: topicsWithDefaults.map((topic) => ({
            topicTag: topic.topicTag,
            difficulty: topic.difficulty,
            point: topic.difficulty === "easy" ? 10 : topic.difficulty === "medium" ? 20 : 30,
            count: topicsWithDefaults.length <= 2 ? 2 : 1,
          })),
        }
      }

      console.log("Sending request with data:", formattedValues)
      const response = await fetch("http://localhost:8081/api/v0/contest", {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(formattedValues),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${method === "PUT" ? "update" : "create"} contest`)
      }

      if (typeof isCreated === "function") {
        isCreated((prev) => !prev)
      }

      toast.success(
        method === "PUT"
          ? `Contest updated successfully`
          : `${formattedValues.contestName} scheduled from ${formattedValues.startTime} to ${formattedValues.endTime}`,
      )
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error.message)
      console.error("Error processing contest:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (method === "POST") {
      const count = form.watch("topicCount") || 1
      const currentTopics = form.getValues("topics") || []

      if (count > currentTopics.length) {
        // Add new topics
        const newTopics = [...currentTopics]
        for (let i = currentTopics.length; i < count; i++) {
          newTopics.push({ topicTag: "", difficulty: "" })
        }
        form.setValue("topics", newTopics)
      } else if (count < currentTopics.length) {
        // Remove excess topics
        form.setValue("topics", currentTopics.slice(0, count))
      }
    }
  }, [form.watch("topicCount"), method, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{method === "POST" ? "Create New Contest" : "Update Contest"}</DialogTitle>
          <DialogDescription>
            {method === "POST" ? "Schedule a coding contest for your students." : "Update the contest details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            {method === "PUT" && <input type="hidden" {...form.register("contestId")} />}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contest Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Weekly Challenge" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className="w-full text-left">
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date() && method === "POST"}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className="w-full text-left">
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date() && method === "POST"}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {method === "POST" && (
              <>
                <FormField
                  control={form.control}
                  name="topicCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Topics</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 2"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseInt(e.target.value, 10) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {Array.from({ length: form.watch("topicCount") || 0 }).map((_, index) => (
                  <div key={index} className="p-4 border rounded-md">
                    <h3 className="font-medium mb-3">Topic {index + 1}</h3>
                    <FormField
                      control={form.control}
                      name={`topics.${index}.topicTag`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Topic</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select topic" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["String", "Array", "Stack", "Queue", "Grid"].map((topic) => (
                                <SelectItem key={topic} value={topic}>
                                  {topic}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`topics.${index}.difficulty`}
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormLabel>Difficulty</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["easy", "medium", "hard"].map((difficulty) => (
                                <SelectItem key={difficulty} value={difficulty}>
                                  {difficulty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="mt-3 text-sm text-muted-foreground">
                      <p>Points: Easy (10), Medium (20), Hard (30)</p>
                      <p>Default problem count: Depends on the topics selected</p>
                    </div>
                  </div>
                ))}

                <FormField
                  control={form.control}
                  name="batch"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Batches</FormLabel>
                      <Popover open={openBatchSelector} onOpenChange={setOpenBatchSelector}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className="w-full justify-between">
                              {field.value?.length > 0 ? `${field.value.length} selected` : "Select batches"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search batches..." onValueChange={setSearchTerm} />
                            <CommandList>
                              <CommandEmpty>No batch found.</CommandEmpty>
                              <CommandGroup>
                                <ScrollArea className="h-60">
                                  {batches
                                    .filter((b) => b.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((batch) => (
                                      <CommandItem key={batch} onSelect={() => toggleBatch(batch)}>
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value?.includes(batch) ? "opacity-100" : "opacity-0",
                                          )}
                                        />
                                        {batch}{" "}
                                      </CommandItem>
                                    ))}
                                </ScrollArea>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {field.value?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value.map((batch) => (
                            <Badge key={batch} variant="secondary" className="px-2 py-1">
                              {batch}
                              <button
                                className="ml-1 text-xs hover:text-destructive"
                                type="button"
                                onClick={() => toggleBatch(batch)}
                              >
                                ✕
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? method === "POST"
                    ? "Creating..."
                    : "Updating..."
                  : method === "PUT"
                    ? "Update Contest"
                    : "Create Contest"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
