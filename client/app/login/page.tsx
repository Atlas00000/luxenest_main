"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/components/auth-provider"
import { Github } from "lucide-react"
import { MobileLoginPage } from "@/components/pages/login/mobile-login-page"
import { useMobile } from "@/hooks/use-mobile"

// Password strength checker
const checkPasswordStrength = (password: string) => {
  let strength = 0
  const feedback = []

  if (password.length >= 8) {
    strength += 1
  } else {
    feedback.push("Password should be at least 8 characters long")
  }

  if (/[A-Z]/.test(password)) {
    strength += 1
  } else {
    feedback.push("Include at least one uppercase letter")
  }

  if (/[a-z]/.test(password)) {
    strength += 1
  } else {
    feedback.push("Include at least one lowercase letter")
  }

  if (/[0-9]/.test(password)) {
    strength += 1
  } else {
    feedback.push("Include at least one number")
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    strength += 1
  } else {
    feedback.push("Include at least one special character")
  }

  return {
    strength: (strength / 5) * 100,
    feedback: feedback.length > 0 ? feedback : ["Strong password!"],
  }
}

export default function LoginPage() {
  const isMobile = useMobile()
  const router = useRouter()
  const { login, register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState({
    login: "",
    register: "",
  })

  const [passwordStrength, setPasswordStrength] = useState({
    strength: 0,
    feedback: [],
  })

  // Load remembered email if exists
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail")
    if (rememberedEmail) {
      setLoginData(prev => ({ ...prev, email: rememberedEmail }))
      setRememberMe(true)
    }
  }, [])

  // Check password strength on change
  useEffect(() => {
    if (registerData.password) {
      setPasswordStrength(checkPasswordStrength(registerData.password))
    }
  }, [registerData.password])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({ ...errors, login: "" })

    if (!loginData.email || !loginData.password) {
      setErrors({ ...errors, login: "Please fill in all fields" })
      return
    }

    setIsLoading(true)

    try {
      await login(loginData.email, loginData.password)
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", loginData.email)
      } else {
        localStorage.removeItem("rememberedEmail")
      }
      router.push("/")
    } catch (error: any) {
      const errorMessage = error?.message || "Invalid email or password"
      setErrors({ ...errors, login: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({ ...errors, register: "" })

    if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setErrors({ ...errors, register: "Please fill in all fields" })
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      setErrors({ ...errors, register: "Passwords do not match" })
      return
    }

    if (passwordStrength.strength < 60) {
      setErrors({ ...errors, register: "Please choose a stronger password" })
      return
    }

    setIsLoading(true)

    try {
      await register(registerData.name, registerData.email, registerData.password)
      router.push("/")
    } catch (error: any) {
      const errorMessage = error?.message || "Registration failed. Please try again."
      setErrors({ ...errors, register: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  // Render mobile layout on mobile devices
  if (isMobile) {
    return <MobileLoginPage />
  }

  return (
    <div className="container mx-auto px-4 py-24 md:py-32">
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to LuxeNest</h1>
          <p className="text-muted-foreground mt-2 mb-2">Sign in to your account or create a new one</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Join over 75,000 design enthusiasts who trust LuxeNest for premium home furnishings. Create an account 
            to save favorites, track orders, and receive exclusive member benefits including early access to new 
            collections and design consultations.
          </p>
        </div>

        <div className="luxury-card p-6 md:p-8 rounded-xl">
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    aria-required="true"
                    aria-invalid={!!errors.login}
                    aria-describedby={errors.login ? "login-error" : undefined}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-xs text-muted-foreground hover:text-primary"
                      aria-label="Forgot your password?"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    aria-required="true"
                    aria-invalid={!!errors.login}
                    aria-describedby={errors.login ? "login-error" : undefined}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </Label>
                </div>

                {errors.login && (
                  <p className="text-sm text-destructive" id="login-error" role="alert">
                    {errors.login}
                  </p>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" type="button" className="w-full">
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" type="button" className="w-full">
                    <Github className="mr-2 h-4 w-4" />
                    Github
                  </Button>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    aria-required="true"
                    aria-invalid={!!errors.register}
                    aria-describedby={errors.register ? "register-error" : undefined}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    aria-required="true"
                    aria-invalid={!!errors.register}
                    aria-describedby={errors.register ? "register-error" : undefined}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    aria-required="true"
                    aria-invalid={!!errors.register}
                    aria-describedby={errors.register ? "register-error" : undefined}
                  />
                  {registerData.password && (
                    <div className="space-y-2">
                      <Progress value={passwordStrength.strength} className="h-2" />
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {passwordStrength.feedback.map((feedback, index) => (
                          <li key={index}>{feedback}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    aria-required="true"
                    aria-invalid={!!errors.register}
                    aria-describedby={errors.register ? "register-error" : undefined}
                  />
                </div>

                {errors.register && (
                  <p className="text-sm text-destructive" id="register-error" role="alert">
                    {errors.register}
                  </p>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" type="button" className="w-full">
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" type="button" className="w-full">
                    <Github className="mr-2 h-4 w-4" />
                    Github
                  </Button>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  )
}
