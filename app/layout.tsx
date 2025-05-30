import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Maxwell - Your Personal AI Assistant",
  description: "Maxwell is your intelligent AI assistant built with OpenAI GPT-4o-mini and the Vercel AI SDK.",
  generator: "v0.dev",
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("flex min-h-svh flex-col antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'