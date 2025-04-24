"use client"

import { useState, useEffect } from "react"

export default function useContestToken() {
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkContestToken = () => {
      setIsLoading(true)
      const contestToken = localStorage.getItem("accessToken")

      if (!contestToken) {
        setIsValid(false)
        setIsLoading(false)
        return
      }

      try {
        const payload = JSON.parse(atob(contestToken.split(".")[1]))
        const expiry = payload.exp * 1000 

        if (Date.now() >= expiry) {
          localStorage.removeItem("contestToken")
          setIsValid(false)
        } else {
          setIsValid(true)
        }
      } catch (error) {
        console.error("Error checking contest token:", error)
        localStorage.removeItem("contestToken")
        setIsValid(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkContestToken()
  }, [])

  return { isValid, isLoading }
}
