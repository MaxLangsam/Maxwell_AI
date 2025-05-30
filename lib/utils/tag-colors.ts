type TagColor = {
  bg: string
  bgLight: string
  text: string
  border: string
}

// Color palette for tags
const TAG_COLORS: Record<string, TagColor> = {
  Work: {
    bg: "bg-blue-100",
    bgLight: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-300",
  },
  Personal: {
    bg: "bg-purple-100",
    bgLight: "bg-purple-50",
    text: "text-purple-800",
    border: "border-purple-300",
  },
  Creative: {
    bg: "bg-pink-100",
    bgLight: "bg-pink-50",
    text: "text-pink-800",
    border: "border-pink-300",
  },
  Technical: {
    bg: "bg-cyan-100",
    bgLight: "bg-cyan-50",
    text: "text-cyan-800",
    border: "border-cyan-300",
  },
  Learning: {
    bg: "bg-green-100",
    bgLight: "bg-green-50",
    text: "text-green-800",
    border: "border-green-300",
  },
  Planning: {
    bg: "bg-amber-100",
    bgLight: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-300",
  },
  Brainstorming: {
    bg: "bg-orange-100",
    bgLight: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-300",
  },
  Research: {
    bg: "bg-indigo-100",
    bgLight: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-300",
  },
  Coding: {
    bg: "bg-sky-100",
    bgLight: "bg-sky-50",
    text: "text-sky-800",
    border: "border-sky-300",
  },
  Writing: {
    bg: "bg-violet-100",
    bgLight: "bg-violet-50",
    text: "text-violet-800",
    border: "border-violet-300",
  },
  Health: {
    bg: "bg-emerald-100",
    bgLight: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-300",
  },
  Finance: {
    bg: "bg-lime-100",
    bgLight: "bg-lime-50",
    text: "text-lime-800",
    border: "border-lime-300",
  },
  Travel: {
    bg: "bg-teal-100",
    bgLight: "bg-teal-50",
    text: "text-teal-800",
    border: "border-teal-300",
  },
  Cooking: {
    bg: "bg-red-100",
    bgLight: "bg-red-50",
    text: "text-red-800",
    border: "border-red-300",
  },
  Entertainment: {
    bg: "bg-fuchsia-100",
    bgLight: "bg-fuchsia-50",
    text: "text-fuchsia-800",
    border: "border-fuchsia-300",
  },
}

// Generate a consistent color for any tag
export function getTagColor(tag: string): TagColor {
  // If the tag is in our predefined list, use that color
  if (tag in TAG_COLORS) {
    return TAG_COLORS[tag]
  }

  // Otherwise, generate a color based on the tag string
  const colors = Object.values(TAG_COLORS)
  const index = tag.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length

  return colors[index]
}
