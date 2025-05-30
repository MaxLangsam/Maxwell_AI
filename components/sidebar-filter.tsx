"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SidebarFilterProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedTag: string
  onTagChange: (tag: string) => void
  allTags: string[]
}

const TAG_COLORS = [
  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
]

export function SidebarFilter({ searchTerm, onSearchChange, selectedTag, onTagChange, allTags }: SidebarFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getTagColor = (tag: string) => {
    const index = tag.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return TAG_COLORS[index % TAG_COLORS.length]
  }

  const clearFilters = () => {
    onSearchChange("")
    onTagChange("all")
  }

  const hasActiveFilters = searchTerm || selectedTag !== "all"

  return (
    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsExpanded(!isExpanded)}>
          <Filter size={14} />
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={clearFilters}>
            <X size={14} />
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-2">
          <Select value={selectedTag} onValueChange={onTagChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {allTags.slice(0, 6).map((tag) => (
                <Badge
                  key={tag}
                  className={`${getTagColor(tag)} cursor-pointer hover:opacity-80 text-xs`}
                  onClick={() => onTagChange(tag)}
                >
                  {tag}
                </Badge>
              ))}
              {allTags.length > 6 && (
                <Badge variant="outline" className="text-xs">
                  +{allTags.length - 6} more
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
