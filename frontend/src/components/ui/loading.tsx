import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  text?: string;
}

export function Loading({ className, size = 24, text, ...props }: LoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2", className)} {...props}>
      <Loader2 size={size} className="animate-spin text-primary" />
      {text && <span className="text-sm font-medium text-muted-foreground">{text}</span>}
    </div>
  )
}
