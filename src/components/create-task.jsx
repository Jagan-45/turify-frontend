"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, FileText, Clock, Check, ChevronsUpDown } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"

import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { Textarea } from "./ui/textarea"
import { Input } from "./ui/input"
import { useNavigate } from "react-router-dom"
import useValidToken from "./hooks/useValidToken"
import { toast } from "react-toastify"

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { ScrollArea } from "./ui/scroll-area"
import { Badge } from "./ui/badge"

const formSchema = z.object({
  batches: z.array(z.string()).min(1, "Please select at least one batch"),
  startDate: z.date({
    required_error: "Please select a start date.",
  }),
  endDate: z.date({
    required_error: "Please select an end date.",
  }),
  assignTime: z.string({
    required_error: "Please select a time.",
  }),
  repeat: z.string({
    required_error: "Please select a repeat option.",
  }),
  description: z.string().optional(),
})

export function CreateTask({ open, onOpenChange, batches, isCreated, method = "POST", taskId, updateBatches = [] }) {
  const [isLoading, setIsLoading] = useState(false)
  const [openBatchSelector, setOpenBatchSelector] = useState(false)
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const isValidToken = useValidToken()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batches: method === "PUT" ? updateBatches : [],
      repeat: "EVERYDAY",
      assignTime: "13:00",
      description: "",
    },
  })

  // Set default values when component mounts or when updateBatches changes
  useEffect(() => {
    if (method === "PUT" && updateBatches && updateBatches.length > 0) {
      form.setValue("batches", updateBatches)
    }
  }, [method, updateBatches, form])

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    if (!userRole || userRole !== "ROLE_STAFF" || !isValidToken) {
      navigate("/login")
    }
  }, [isValidToken, navigate])

  async function handleSubmit(values) {
    setIsLoading(true)

    try {
      const fromDate = format(values.startDate, "yyyy-MM-dd")
      const toDate = format(values.endDate, "yyyy-MM-dd")

      const timeComponents = values.assignTime.split(":")
      const hours = timeComponents[0]
      const minutes = timeComponents[1]
      const assignAtTime = `${hours}:${minutes}:00`

      const requestBody = {
        batches: values.batches, // Now sending array of batches
        assignAtTime: assignAtTime,
        repeat: values.repeat,
        from: fromDate,
        to: toDate,
        description: values.description,
      }

      console.log("Request body:", requestBody)

      const token = localStorage.getItem("accessToken")

      const url =
        method === "PUT" ? `http://localhost:8081/api/v0/tasks/${taskId}` : "http://localhost:8081/api/v0/tasks"

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(method === "PUT" ? "Failed to update task" : "Failed to create task")
      }

      toast.success(method === "PUT" ? "Task updated successfully!" : "Task created successfully!")
      isCreated((prev) => !prev)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error("Error handling task:", error)
      toast.error(
        method === "PUT" ? "An error occurred while updating the task." : "An error occurred while creating the task.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle batch selection
  const toggleBatch = (batch) => {
    const currentBatches = form.getValues("batches") || []
    const isSelected = currentBatches.includes(batch)

    if (isSelected) {
      form.setValue(
        "batches",
        currentBatches.filter((b) => b !== batch),
      )
    } else {
      form.setValue("batches", [...currentBatches, batch])
    }
  }

  // Function to remove a batch from selection
  const removeBatch = (batch, e) => {
    e.preventDefault()
    const currentBatches = form.getValues("batches")
    form.setValue(
      "batches",
      currentBatches.filter((b) => b !== batch),
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{method === "PUT" ? "Update Task" : "Assign Daily Task"}</DialogTitle>
          <DialogDescription>Assign LeetCode problems to your students.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
          <FormField
              control={form.control}
              name="batches"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Batches</FormLabel>
                  <Popover open={openBatchSelector} onOpenChange={setOpenBatchSelector}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openBatchSelector}
                          className="w-full justify-between"
                        >
                          {field.value.length > 0
                            ? `${field.value.length} batch${field.value.length > 1 ? "es" : ""} selected`
                            : "Select batches"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search batches..." 
                          onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                        <CommandList>
                          <CommandEmpty>No batch found.</CommandEmpty>
                          <CommandGroup>
                            <ScrollArea className="h-60">
                              {batches.filter(batch => batch.toLowerCase().includes(searchTerm.toLowerCase())).map((batch) => (
                                <CommandItem key={batch} value={batch} onSelect={() => toggleBatch(batch)}>
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value.includes(batch) ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {batch}
                                </CommandItem>
                              ))}
                            </ScrollArea>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((batch) => (
                        <Badge key={batch} variant="secondary" className="px-2 py-1">
                          {batch}
                          <button
                            className="ml-1 text-xs hover:text-destructive"
                            onClick={(e) => removeBatch(batch, e)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? format(field.value, "PPP") : <span>From</span>}
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
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? format(field.value, "PPP") : <span>To</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const startDate = form.getValues("startDate")
                            return date < new Date() || (startDate && date < startDate)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assignTime"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-col gap-2">
                    <FormLabel>Assign At</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input type="time" {...field} className="w-full" />
                        <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repeat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" role="combobox" className="w-full justify-between">
                          {field.value === "EVERYDAY"
                            ? "Every Day"
                            : field.value === "WEEKDAYS"
                              ? "Weekdays"
                              : field.value === "WEEKENDS"
                                ? "Weekends"
                                : field.value === "ONCE"
                                  ? "Once"
                                  : "Select repeat option"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            <CommandItem onSelect={() => form.setValue("repeat", "EVERYDAY")}>
                              <Check
                                className={cn("mr-2 h-4 w-4", field.value === "EVERYDAY" ? "opacity-100" : "opacity-0")}
                              />
                              Every Day
                            </CommandItem>
                            <CommandItem onSelect={() => form.setValue("repeat", "WEEKDAYS")}>
                              <Check
                                className={cn("mr-2 h-4 w-4", field.value === "WEEKDAYS" ? "opacity-100" : "opacity-0")}
                              />
                              Weekdays
                            </CommandItem>
                            <CommandItem onSelect={() => form.setValue("repeat", "WEEKENDS")}>
                              <Check
                                className={cn("mr-2 h-4 w-4", field.value === "WEEKENDS" ? "opacity-100" : "opacity-0")}
                              />
                              Weekends
                            </CommandItem>
                            <CommandItem onSelect={() => form.setValue("repeat", "ONCE")}>
                              <Check
                                className={cn("mr-2 h-4 w-4", field.value === "ONCE" ? "opacity-100" : "opacity-0")}
                              />
                              Once
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional instructions or context for the tasks."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <FileText className="mr-2 h-4 w-4 animate-spin" />
                    {method === "PUT" ? "Updating..." : "Assigning..."}
                  </>
                ) : method === "PUT" ? (
                  "Update Task"
                ) : (
                  "Assign Task"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to conditionally join class names
function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}
