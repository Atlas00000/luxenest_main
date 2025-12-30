"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, User, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"

type Message = {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: "1",
    text: "👋 Hello! Welcome to LuxeNest. How can I help you today?",
    sender: "bot",
    timestamp: new Date(),
  },
]

const botResponses = [
  {
    keywords: ["hi", "hello", "hey"],
    response: "Hello there! How can I assist you with your shopping today?",
  },
  {
    keywords: ["shipping", "delivery", "ship"],
    response: "We offer free shipping on all orders over $100. Standard delivery takes 3-5 business days.",
  },
  {
    keywords: ["return", "refund"],
    response:
      "Our return policy allows returns within 30 days of delivery. Please visit our Returns page for more details.",
  },
  {
    keywords: ["payment", "pay", "card"],
    response: "We accept all major credit cards, PayPal, and Apple Pay as payment methods.",
  },
  {
    keywords: ["discount", "coupon", "promo", "code", "sale"],
    response:
      "You can use code WELCOME10 for 10% off your first order! Check our Sale section for more discounted items.",
  },
  {
    keywords: ["material", "quality", "sustainable"],
    response: "All our products are made with premium materials. We prioritize sustainability and ethical production.",
  },
  {
    keywords: ["contact", "customer service", "phone", "email"],
    response: "You can reach our customer service team at support@luxenest.com or call us at (555) 123-4567.",
  },
  {
    keywords: ["dark mode", "light mode", "theme", "color scheme"],
    response: "You can toggle between dark and light mode using the sun/moon icon in the top navigation bar!",
  },
]

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate bot thinking
    setTimeout(() => {
      const botMessage = generateBotResponse(input)
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1000)
  }

  const generateBotResponse = (userInput: string): Message => {
    const lowercaseInput = userInput.toLowerCase()

    // Check for keyword matches
    for (const item of botResponses) {
      if (item.keywords.some((keyword) => lowercaseInput.includes(keyword))) {
        return {
          id: Date.now().toString(),
          text: item.response,
          sender: "bot",
          timestamp: new Date(),
        }
      }
    }

    // Default response if no keywords match
    return {
      id: Date.now().toString(),
      text: "I'm not sure I understand. Would you like to browse our featured products or speak with a customer service representative?",
      sender: "bot",
      timestamp: new Date(),
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 right-4 md:right-8 z-50 w-full max-w-sm bg-background rounded-2xl shadow-xl border overflow-hidden chat-widget theme-transition"
          >
            <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                <h3 className="font-medium">LuxeNest Assistant</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-80 overflow-y-auto p-4 flex flex-col gap-3 theme-transition">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-2 max-w-[80%]", message.sender === "user" ? "ml-auto" : "mr-auto")}
                >
                  {message.sender === "bot" && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-xl p-3 text-sm chat-bubble theme-transition",
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted rounded-tl-none",
                    )}
                  >
                    {message.text}
                  </div>
                  {message.sender === "user" && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-2 max-w-[80%] mr-auto">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-xl p-3 text-sm bg-muted rounded-tl-none chat-bubble theme-transition">
                    <div className="flex gap-1">
                      <span className="animate-bounce">•</span>
                      <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                        •
                      </span>
                      <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
                        •
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t theme-transition">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 theme-transition"
                />
                <Button type="submit" size="icon" disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="fixed bottom-4 right-4 md:right-8 z-50 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center theme-transition"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? "close" : "chat"}
            initial={{ scale: 0, opacity: 0, rotate: 90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </>
  )
}
