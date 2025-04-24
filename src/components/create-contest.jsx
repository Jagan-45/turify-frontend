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
import { toast } from 'react-toastify'

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  startDate: z.date({ required_error: "Please select a start date." }),
  startTime: z.string({ required_error: "Please select a start time." }),
  endDate: z.date({ required_error: "Please select an end date." }),
  endTime: z.string({ required_error: "Please select an end time." }),
  batch: z.array(z.string()).min(1, { message: "Please select at least one batch." }),
  topicCount: z.number().min(1, { message: "Please enter the number of topics." }),
  topics: z.array(z.object({
    topicTag: z.string().min(1, { message: "Please select a topic." }),
    difficulty: z.string().min(1, { message: "Please select a difficulty." }),
    point: z.number().min(1, { message: "Please enter points." }),
    count: z.number().min(1, { message: "Please enter the count of problems." }),
  })).min(1, { message: "At least one topic is required." }),
})

export function CreateContest({ open, onOpenChange, onSubmit, batches, isCreated, method = "POST" }) {
  const navigate = useNavigate()
  const isValidToken = useValidToken()

  const [isLoading, setIsLoading] = useState(false)
  const [openBatchSelector, setOpenBatchSelector] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

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
      title: "",
      startDate: undefined,
      startTime: "",
      endDate: undefined,
      endTime: "",
      batch: [],
      topicCount: 1,
      topics: [{ topicTag: "", difficulty: "", point: 0, count: 0 }],
    },
  })

  const toggleBatch = (batch) => {
    const current = form.getValues("batch")
    if (current.includes(batch)) {
      form.setValue("batch", current.filter((b) => b !== batch))
    } else {
      form.setValue("batch", [...current, batch])
    }
  }

  const handleSubmit = async (values) => {
    setIsLoading(true)
    console.log("hi inside ")
    const formattedValues = {
      contestName: values.title,
      startTime: `${format(values.startDate, "yyyy-MM-dd")}T${values.startTime}:00`,
      endTime: `${format(values.endDate, "yyyy-MM-dd")}T ${values.endTime}:00`,
      assignToBatches: values.batch,
      req: values.topics.map(topic => ({
        topicTag: topic.topicTag,
        difficulty: topic.difficulty,
        point: topic.point,
        count: topic.count,
      })),
    }

    try {
      const response = await fetch("http://localhost:8081/api/v0/contest", {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(formattedValues),
      });

      if (!response.ok) {
        throw new Error("Failed to create contest");
      }

      toast.success(
         `${formattedValues.contestName} scheduled from ${formattedValues.startTime} to ${formattedValues.endTime}`,
      );
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Contest</DialogTitle>
          <DialogDescription>Schedule a coding contest for your students.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contest Title</FormLabel>
                  <FormControl><Input placeholder="e.g., Weekly Challenge" {...field} /></FormControl>
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
                        disabled={(date) => date < new Date()}
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
                    <FormControl><SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
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
                        disabled={(date) => date < new Date()}
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
                    <FormControl><SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"].map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topicCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Topics</FormLabel>
                  <FormControl><Input type="number" placeholder="e.g., 2" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {Array.from({ length: form.watch("topicCount") || 0 }).map((_, index) => (
              <div key={index}>
                <FormField
                  control={form.control}
                  name={`topics.${index}.topicTag`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Topic</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {["String", "Array", "Stack", "Queue", "Grid"].map((topic) => (
                            <SelectItem key={topic} value={topic}>{topic}</SelectItem>
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
                    <FormItem>
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {["easy", "medium", "hard"].map((difficulty) => (
                            <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`topics.${index}.point`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`topics.${index}.count`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Count of Problems</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          {field.value?.length > 0
                            ? `${field.value.length} selected`
                            : "Select batches"}
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
                                    <Check className={cn("mr-2 h-4 w-4", field.value?.includes(batch) ? "opacity-100" : "opacity-0")} />
                                    {batch} </CommandItem>
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

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Contest"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}