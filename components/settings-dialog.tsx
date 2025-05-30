"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSettings } from "@/hooks/use-settings"
import { useTheme } from "next-themes"

export function SettingsDialog() {
  const [open, setOpen] = useState(false)
  const { settings, updateSettings, resetSettings } = useSettings()
  const { theme, setTheme } = useTheme()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size: {settings.fontSize}px</Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => updateSettings({ fontSize: value })}
                min={12}
                max={20}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={settings.language} onValueChange={(value) => updateSettings({ language: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-scroll">Auto-scroll to bottom</Label>
              <Switch
                id="auto-scroll"
                checked={settings.autoScrollToBottom}
                onCheckedChange={(checked) => updateSettings({ autoScrollToBottom: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="syntax-highlighting">Enable syntax highlighting</Label>
              <Switch
                id="syntax-highlighting"
                checked={settings.enableSyntaxHighlighting}
                onCheckedChange={(checked) => updateSettings({ enableSyntaxHighlighting: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="line-numbers">Show code line numbers</Label>
              <Switch
                id="line-numbers"
                checked={settings.showCodeLineNumbers}
                onCheckedChange={(checked) => updateSettings({ showCodeLineNumbers: checked })}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sound">Sound effects</Label>
              <Switch
                id="sound"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Desktop notifications</Label>
              <Switch
                id="notifications"
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => updateSettings({ notificationsEnabled: checked })}
              />
            </div>

            <div className="pt-4 border-t">
              <Button variant="destructive" onClick={resetSettings}>
                Reset to Defaults
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
