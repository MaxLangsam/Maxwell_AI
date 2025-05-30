"use client"

import { useState } from "react"
import { SettingsIcon, X, Moon, Sun, Monitor, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useTheme } from "next-themes"
import { useSettings } from "@/hooks/use-settings"

export function SettingsDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { settings, updateSettings } = useSettings()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <SettingsIcon size={16} />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="flex items-center justify-between">
          <div>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Customize your Maxwell experience</DialogDescription>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsOpen(false)}>
            <X size={16} />
          </Button>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <RadioGroup defaultValue={theme} onValueChange={(value) => setTheme(value)} className="flex space-x-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light" className="flex items-center">
                    <Sun size={16} className="mr-1" />
                    Light
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark" className="flex items-center">
                    <Moon size={16} className="mr-1" />
                    Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system" className="flex items-center">
                    <Monitor size={16} className="mr-1" />
                    System
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <RadioGroup
                defaultValue={settings.language}
                onValueChange={(value) => updateSettings({ language: value })}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="lang-en" />
                  <Label htmlFor="lang-en" className="flex items-center">
                    <Globe size={16} className="mr-1" />
                    English
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Code syntax highlighting</Label>
                <div className="text-sm text-gray-500 dark:text-gray-400">Highlight code blocks in chat messages</div>
              </div>
              <Switch
                checked={settings.codeSyntaxHighlighting}
                onCheckedChange={(checked) => updateSettings({ codeSyntaxHighlighting: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-scroll to bottom</Label>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Automatically scroll to the latest message
                </div>
              </div>
              <Switch
                checked={settings.autoScrollToBottom}
                onCheckedChange={(checked) => updateSettings({ autoScrollToBottom: checked })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Font size</Label>
                <span className="text-sm">{settings.fontSize}px</span>
              </div>
              <Slider
                defaultValue={[settings.fontSize]}
                min={12}
                max={20}
                step={1}
                onValueChange={(value) => updateSettings({ fontSize: value[0] })}
              />
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sound effects</Label>
                <div className="text-sm text-gray-500 dark:text-gray-400">Play sounds for new messages</div>
              </div>
              <Switch
                checked={settings.soundEffects}
                onCheckedChange={(checked) => updateSettings({ soundEffects: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Desktop notifications</Label>
                <div className="text-sm text-gray-500 dark:text-gray-400">Show notifications for new messages</div>
              </div>
              <Switch
                checked={settings.desktopNotifications}
                onCheckedChange={(checked) => updateSettings({ desktopNotifications: checked })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Sound volume</Label>
                <span className="text-sm">{settings.soundVolume}%</span>
              </div>
              <Slider
                defaultValue={[settings.soundVolume]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => updateSettings({ soundVolume: value[0] })}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
