import * as React from "react"
import { cn } from "@/lib/utils"

const Timeline = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("relative border-l border-white/10 ml-3", className)} {...props} />
))
Timeline.displayName = "Timeline"

const TimelineItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mb-6 ml-6 relative last:mb-0", className)} {...props} />
))
TimelineItem.displayName = "TimelineItem"

const TimelineDot = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "primary" | "destructive" | "warning" }>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-white/20 border-black",
    primary: "bg-primary border-[#16181D]",
    destructive: "bg-red-500 border-[#16181D]",
    warning: "bg-yellow-500 border-[#16181D]",
  }
  return (
    <div 
      ref={ref} 
      className={cn("absolute flex items-center justify-center w-3 h-3 rounded-full -left-[1.8rem] ring-4 ring-[#16181D] border-2", variants[variant], className)} 
      {...props} 
    />
  )
})
TimelineDot.displayName = "TimelineDot"

const TimelineContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1", className)} {...props} />
))
TimelineContent.displayName = "TimelineContent"

export { Timeline, TimelineItem, TimelineDot, TimelineContent }
