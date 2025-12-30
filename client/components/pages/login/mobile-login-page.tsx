"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { MobilePageLayout, MobilePageHeader, MobilePageContent, MobileSection } from "@/components/layouts/mobile-page-layout"
import { MobileLoginForm } from "./mobile-login-form"
import { MobileRegisterForm } from "./mobile-register-form"

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

export function MobileLoginPage() {
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
    feedback: [] as string[],
  })

  // Load remembered email if exists
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail")
    if (rememberedEmail) {
      setLoginData((prev) => ({ ...prev, email: rememberedEmail }))
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

    if (
      !registerData.name ||
      !registerData.email ||
      !registerData.password ||
      !registerData.confirmPassword
    ) {
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

  return (
    <MobilePageLayout>
      <MobilePageHeader
        title="Welcome to LuxeNest"
        subtitle="Join over 75,000 design enthusiasts who trust LuxeNest for premium home furnishings"
        eyebrow=""
      />

      <MobilePageContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="luxury-card p-6 rounded-xl"
        >
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <MobileLoginForm
                email={loginData.email}
                password={loginData.password}
                rememberMe={rememberMe}
                isLoading={isLoading}
                error={errors.login}
                onEmailChange={(email) => setLoginData({ ...loginData, email })}
                onPasswordChange={(password) => setLoginData({ ...loginData, password })}
                onRememberMeChange={setRememberMe}
                onSubmit={handleLoginSubmit}
              />
            </TabsContent>

            <TabsContent value="register">
              <MobileRegisterForm
                name={registerData.name}
                email={registerData.email}
                password={registerData.password}
                confirmPassword={registerData.confirmPassword}
                passwordStrength={passwordStrength}
                isLoading={isLoading}
                error={errors.register}
                onNameChange={(name) => setRegisterData({ ...registerData, name })}
                onEmailChange={(email) => setRegisterData({ ...registerData, email })}
                onPasswordChange={(password) => setRegisterData({ ...registerData, password })}
                onConfirmPasswordChange={(confirmPassword) =>
                  setRegisterData({ ...registerData, confirmPassword })
                }
                onSubmit={handleRegisterSubmit}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </MobilePageContent>
    </MobilePageLayout>
  )
}

