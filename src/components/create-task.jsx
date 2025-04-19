"use client"

import { useState,useEffect } from "react"
import { CalendarIcon, FileText } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"

import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { Textarea } from "./ui/textarea"
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import TextField from '@mui/material/TextField';
import { useNavigate } from "react-router-dom"
import useValidToken from "../components/hooks/useValidToken"

const formSchema = z.object({
  batch: z.string({
    required_error: "Please select a batch.",
  }),
  startDate: z.date({
    required_error: "Please select a start date.",
  }),
  endDate: z.date({
    required_error: "Please select an end date.",
  }),
  problemLinks: z.string().min(10, {
    message: "Please provide at least one problem link.",
  }),
  description: z.string().optional(),
})

export function CreateTask({ open, onOpenChange, onSubmit }) {
  const [isLoading, setIsLoading] = useState(false)
  const [time, setTime] = useState(dayjs())
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
      batch: "",
      problemLinks: "",
      description: "",
    },
  })

  function handleSubmit(values) {
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      onOpenChange(false)

      if (onSubmit) {
        onSubmit(values)
      }

      form.reset()
    }, 1500)
  }

  return (

    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Assign Daily Task</DialogTitle>
          <DialogDescription>Assign LeetCode problems to your students.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="batch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="batch-1">CSE 2023</SelectItem>
                      <SelectItem value="batch-2">CSE 2024</SelectItem>
                      <SelectItem value="batch-3">ECE 2023</SelectItem>
                      <SelectItem value="batch-4">CSE 2025</SelectItem>
                    </SelectContent>
                  </Select>
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
                            variant={"outline"}
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
                            variant={"outline"}
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
            name="Timer"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-4 pt-4">
                  <FormLabel className="whitespace-nowrap">Assign At</FormLabel>
                  <FormControl>
                    <TimePicker
                      value={time}
                      onChange={(newTime) => setTime(newTime)}
                      renderInput={(params) => <TextField {...params} />}
                      ampm={true}
                    />
                  </FormControl>
                </div>
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
                    Assigning...
                  </>
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

