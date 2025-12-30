"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Github } from "lucide-react"

interface MobileRegisterFormProps {
  name: string
  email: string
  password: string
  confirmPassword: string
  passwordStrength: {
    strength: number
    feedback: string[]
  }
  isLoading: boolean
  error: string
  onNameChange: (name: string) => void
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onConfirmPasswordChange: (confirmPassword: string) => void
  onSubmit: (e: React.FormEvent) => void
}

export function MobileRegisterForm({
  name,
  email,
  password,
  confirmPassword,
  passwordStrength,
  isLoading,
  error,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: MobileRegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? "register-error" : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? "register-error" : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? "register-error" : undefined}
        />
        {password && (
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
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? "register-error" : undefined}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" id="register-error" role="alert">
          {error}
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

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" type="button" className="w-full text-xs">
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          Google
        </Button>
        <Button variant="outline" type="button" className="w-full text-xs">
          <Github className="mr-2 h-4 w-4" />
          Github
        </Button>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  )
}

