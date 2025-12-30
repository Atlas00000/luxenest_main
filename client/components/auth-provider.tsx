"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import * as authApi from "@/lib/api/auth"
import { tokenStorage } from "@/lib/utils/token-storage"
import type { AuthContextType, User } from "@/lib/types/auth"
import { ApiClientError } from "@/lib/api/client"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  /**
   * Load user from API on mount if tokens exist
   */
  useEffect(() => {
    const loadUser = async () => {
      if (tokenStorage.hasTokens()) {
        try {
          const userData = await authApi.getCurrentUser()
          setUser(userData)
        } catch (error) {
          // If loading user fails, clear tokens
          tokenStorage.clearTokens()
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  /**
   * Login user
   */
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await authApi.login({ email, password })
      setUser(response.user)
      
      toast({
        title: "Login successful",
        description: "Welcome back to LuxeNest!",
      })
    } catch (error) {
      const errorMessage = error instanceof ApiClientError 
        ? error.message 
        : "Please check your credentials and try again."
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      })
      
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Register new user
   */
  const register = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await authApi.register({ name, email, password })
      setUser(response.user)
      
      toast({
        title: "Registration successful",
        description: "Welcome to LuxeNest!",
      })
    } catch (error) {
      const errorMessage = error instanceof ApiClientError 
        ? error.message 
        : "Please check your information and try again."
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      })
      
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true)
    try {
      await authApi.logout()
    } catch (error) {
      console.error("Logout error:", error)
      // Continue with logout even if API call fails
    } finally {
      setUser(null)
      setIsLoading(false)
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
    }
  }

  /**
   * Update user profile
   */
  const updateProfile = async (data: { name?: string; avatar?: string | null }): Promise<void> => {
    try {
      const updatedUser = await authApi.updateProfile(data)
      setUser(updatedUser)
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      const errorMessage = error instanceof ApiClientError 
        ? error.message 
        : "Failed to update profile. Please try again."
      
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      })
      
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isLoading,
    isAuthenticated: !!user && tokenStorage.hasTokens(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
