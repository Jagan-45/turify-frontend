"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  initialFocus,
  className,
  month: propMonth,
  onMonthChange,
  ...props
}) {
  const [month, setMonth] = React.useState(() => {
    return propMonth || (selected instanceof Date ? selected : new Date())
  })

  React.useEffect(() => {
    if (propMonth) {
      setMonth(propMonth)
    }
  }, [propMonth])

  const handleMonthChange = React.useCallback((newMonth) => {
    setMonth(newMonth)
    onMonthChange?.(newMonth)
  }, [onMonthChange])

  const daysInMonth = React.useMemo(() => {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    const firstDay = new Date(year, monthIndex, 1)
    const lastDay = new Date(year, monthIndex + 1, 0)
    const daysCount = lastDay.getDate()
    
    const days = []
    
    const firstDayOfWeek = firstDay.getDay()
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, monthIndex, -i)
      days.push({ date, isCurrentMonth: false })
    }
    
    for (let i = 1; i <= daysCount; i++) {
      const date = new Date(year, monthIndex, i)
      days.push({ date, isCurrentMonth: true })
    }
    
    const remainingDays = 7 - (days.length % 7 || 7)
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, monthIndex + 1, i)
      days.push({ date, isCurrentMonth: false })
    }
    
    return days
  }, [month])

  const isSelected = React.useCallback((date) => {
    if (!selected) return false
    
    if (selected instanceof Date) {
      return date.toDateString() === selected.toDateString()
    }
    
    if (Array.isArray(selected)) {
      return selected.some(d => d.toDateString() === date.toDateString())
    }
    
    return false
  }, [selected])

  const isDisabled = React.useCallback((date) => {
    return disabled ? disabled(date) : false
  }, [disabled])

  const handleDateSelect = React.useCallback((date) => {
    if (isDisabled(date)) return
    console.log("Selected date:", date); // Debugging line
    onSelect?.(date)
  }, [isDisabled, onSelect])

  const handlePreviousMonth = () => {
    handleMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    handleMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))
  }

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className={cn("p-3 space-y-4 rounded-lg", className)} {...props}>
      <div className="flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePreviousMonth}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>
        <motion.h2 
          className="font-medium text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          key={`${month.getMonth()}-${month.getFullYear()}`}
        >
          {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </motion.h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>

      <div className=" grid grid-cols-7 gap-1">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 h-8 flex items-center justify-center"
          >
            {day}
          </div>
        ))}

        <AnimatePresence mode="wait">
          <motion.div 
            className="col-span-7 grid grid-cols-7 gap-1"
            key={`${month.getMonth()}-${month.getFullYear()}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {daysInMonth.map(({ date, isCurrentMonth }, index) => {
              const isToday = date.toDateString() === new Date().toDateString()
              const isSelectedDate = isSelected(date)
              const isDateDisabled = isDisabled(date)
              
              return (
                <motion.button
                  key={date.toISOString()}
                  whileHover={{ scale: isDateDisabled ? 1 : 1.05 }}
                  whileTap={{ scale: isDateDisabled ? 1 : 0.95 }}
                  onClick={() => handleDateSelect(date)}
                  disabled={isDateDisabled}
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center text-sm transition-colors",
                    isCurrentMonth ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-600",
                    isToday && !isSelectedDate && "border border-blue-500 dark:border-blue-400",
                    isSelectedDate && "bg-blue-500 text-white dark:bg-blue-600",
                    isDateDisabled && "opacity-50 cursor-not-allowed",
                    !isDateDisabled && !isSelectedDate && "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  aria-label={date.toLocaleDateString()}
                  aria-selected={isSelectedDate}
                  tabIndex={initialFocus && index === 0 ? 0 : -1}
                >
                  {date.getDate()}
                </motion.button>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}